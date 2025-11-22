// hooks/useSessionStorage.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useSessionStorage = (key, initialValue) => {
  // Use ref to store initialValue to prevent stale closure
  const initialValueRef = useRef(initialValue);
  
  // Update ref when initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);
  
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to sessionStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      setStoredValue(prevValue => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        sessionStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error saving to sessionStorage key "${key}":`, error);
    }
  }, [key]);

  // Remove the value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValueRef.current);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
};

export const useScrollPosition = (key, options = {}) => {
  const {
    restoreOnMount = true,
    waitForContent = false,
    contentReady = true,
    debounceDelay = 150,
    restoreDelay = 300
  } = options;
  
  const scrollKey = `scroll_${key}`;
  const scrollTimerRef = useRef(null);
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const isMountedRef = useRef(true);

  // Continuous scroll saving with debounce
  const saveScroll = useCallback(() => {
    // Don't save if we're in the middle of restoring or unmounted
    if (isRestoringRef.current || !isMountedRef.current) return;
    
    const currentScroll = window.scrollY;
    if (currentScroll > 0) {
      sessionStorage.setItem(scrollKey, currentScroll.toString());
    } else {
      // Clear saved scroll if user scrolls to top
      sessionStorage.removeItem(scrollKey);
    }
  }, [scrollKey]);

  // Better restore with RAF pattern
  const restoreScroll = useCallback(() => {
    // Prevent multiple restores or restore on unmounted component
    if (hasRestoredRef.current || !isMountedRef.current) return;
    
    const savedScroll = sessionStorage.getItem(scrollKey);
    if (savedScroll && parseInt(savedScroll) > 0) {
      const scrollY = parseInt(savedScroll);
      isRestoringRef.current = true;
      hasRestoredRef.current = true;
      
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return; // Check if still mounted
        
        setTimeout(() => {
          if (!isMountedRef.current) return; // Check again before scrolling
          
          window.scrollTo({
            top: scrollY,
            left: 0,
            behavior: 'instant'
          });
          // Allow saving again after restore completes
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        }, restoreDelay);
      });
    }
  }, [scrollKey, restoreDelay]);

  // Manual clear function
  const clearScroll = useCallback(() => {
    sessionStorage.removeItem(scrollKey);
    hasRestoredRef.current = false;
  }, [scrollKey]);

  // Track scroll continuously
  useEffect(() => {
    isMountedRef.current = true;
    
    const handleScroll = () => {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(saveScroll, debounceDelay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScroll);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScroll);
      if (!isRestoringRef.current) {
        saveScroll();
      }
      clearTimeout(scrollTimerRef.current);
    };
  }, [saveScroll, debounceDelay]);

  // Restore scroll when content is ready
  useEffect(() => {
    if (restoreOnMount && (!waitForContent || contentReady)) {
      restoreScroll();
    }
  }, [restoreOnMount, waitForContent, contentReady, restoreScroll]);

  return { saveScroll, restoreScroll, clearScroll };
};

/**
 * Custom hook for managing form state with sessionStorage persistence
 * @param {string} key - The sessionStorage key
 * @param {object} initialState - The initial form state
 * @param {object} options - Options for form persistence
 * @returns {object} - Form state and handlers
 */
export const usePersistedForm = (key, initialState, options = {}) => {
  const {
    clearOnSubmit = true,
    restoreOnMount = true,
    compareWithOriginal = false,
    originalData = null
  } = options;

  const [formData, setFormData, clearFormData] = useSessionStorage(
    `form_${key}`,
    initialState
  );

  const hasRestoredRef = useRef(false);
  const initialStateRef = useRef(initialState);
  
  // Update initialStateRef when initialState changes
  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  // Initialize form data on mount
  useEffect(() => {
    if (restoreOnMount && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      try {
        const saved = sessionStorage.getItem(`form_${key}`);
        if (saved) {
          const savedData = JSON.parse(saved);
          
          // If comparing with original data, check if saved data is different
          if (compareWithOriginal && originalData) {
            if (JSON.stringify(savedData) !== JSON.stringify(originalData)) {
              setFormData(savedData);
            } else {
              clearFormData();
            }
          } else {
            setFormData(savedData);
          }
        }
      } catch (error) {
        console.warn(`Error restoring form data for "${key}":`, error);
      }
    }
  }, [key, restoreOnMount, compareWithOriginal, originalData, setFormData, clearFormData]);

  // Handle form field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, [setFormData]);

  // Handle multiple field updates
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, [setFormData]);

  // Reset form to initial state - use ref to avoid stale closure
  const resetForm = useCallback(() => {
    setFormData(initialStateRef.current);
    clearFormData();
  }, [setFormData, clearFormData]);

  // Clear form data (usually on successful submit)
  const clearForm = useCallback(() => {
    clearFormData();
  }, [clearFormData]);

  // Check if form has changes compared to original
  const hasChanges = useCallback(() => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  return {
    formData,
    setFormData,
    handleChange,
    updateFields,
    resetForm,
    clearForm,
    hasChanges
  };
};

/**
 * Utility function to save any data to sessionStorage
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 * @returns {boolean} - Success status
 */
export const saveToSession = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error saving to sessionStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Utility function to load data from sessionStorage
 * @param {string} key - The storage key
 * @param {*} defaultValue - The default value if key doesn't exist
 * @returns {*} - The stored value or default value
 */
export const loadFromSession = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error loading from sessionStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Utility function to remove data from sessionStorage
 * @param {string} key - The storage key
 * @returns {boolean} - Success status
 */
export const removeFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing sessionStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Utility function to clear all sessionStorage data with a specific prefix
 * @param {string} prefix - The key prefix to match
 * @returns {number} - Number of items cleared
 */
export const clearSessionByPrefix = (prefix) => {
  try {
    let count = 0;
    const keys = Object.keys(sessionStorage);
    
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
        count++;
      }
    });
    
    return count;
  } catch (error) {
    console.warn(`Error clearing sessionStorage with prefix "${prefix}":`, error);
    return 0;
  }
};

/**
 * Custom hook for managing URL search parameters with persistence
 * @param {object} defaultParams - Default parameter values
 * @returns {[object, function, function]} - [params, setParams, clearParams]
 */
export const usePersistedSearchParams = (defaultParams = {}) => {
  const defaultParamsRef = useRef(defaultParams);
  
  // Update ref when defaultParams changes
  useEffect(() => {
    defaultParamsRef.current = defaultParams;
  }, [defaultParams]);
  
  const [searchParams, setSearchParams] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = { ...defaultParams };
    
    Object.keys(defaultParams).forEach(key => {
      const value = urlParams.get(key);
      if (value !== null) {
        params[key] = value;
      }
    });
    
    return params;
  });

  const updateParams = useCallback((updates) => {
    setSearchParams(prev => {
      const newParams = { ...prev, ...updates };
      
      // Update URL
      const urlParams = new URLSearchParams();
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== defaultParamsRef.current[key]) {
          urlParams.set(key, value);
        }
      });
      
      const newUrl = urlParams.toString() 
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      
      window.history.replaceState({}, '', newUrl);
      
      return newParams;
    });
  }, []);

  const clearParams = useCallback(() => {
    setSearchParams(defaultParamsRef.current);
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  return [searchParams, updateParams, clearParams];
};

export default {
  useSessionStorage,
  useScrollPosition,
  usePersistedForm,
  usePersistedSearchParams,
  saveToSession,
  loadFromSession,
  removeFromSession,
  clearSessionByPrefix
};