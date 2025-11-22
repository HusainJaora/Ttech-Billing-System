import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, User, Phone, Check } from 'lucide-react';


export const SearchableDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option...",
  displayKey = "name",
  valueKey = "id",
  searchKeys = ["name"],
  disabled = false,
  className = "",
  subtitleKey = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options based on search
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    return searchKeys.some(key => {
      const value = option[key]?.toString().toLowerCase() || '';
      return value.includes(searchTerm.toLowerCase());
    });
  });

  // Get selected option details
  const selectedOption = options.find(opt => opt[valueKey] === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button / Search Input */}
      <div
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-white border-2 rounded-xl transition-all duration-200
          ${disabled 
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
            : isOpen
              ? 'border-indigo-500 ring-4 ring-indigo-100 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
        `}
      >
        {isOpen ? (
          <>
            <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder="Search..."
              className="flex-1 outline-none bg-transparent text-gray-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(true)}
            disabled={disabled}
            className="w-full flex items-center justify-between"
          >
            <span className={`flex-1 text-left ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption[displayKey] : placeholder}
            </span>
            
            <div className="flex items-center space-x-2">
              {value && !disabled && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear selection"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </button>
        )}
        
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Options List */}
          <div ref={listRef} className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = option[valueKey] === value;
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <button
                    key={option[valueKey]}
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                      ${isSelected 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : isHighlighted
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}>
                        <User className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isSelected ? 'text-indigo-700' : 'text-gray-900'
                        }`}>
                          {option[displayKey]}
                        </p>
                        {subtitleKey && option[subtitleKey] && (
                          <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                            <Phone className="h-3 w-3 mr-1" />
                            {option[subtitleKey]}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-indigo-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
                <p className="text-xs text-gray-500">Try adjusting your search</p>
              </div>
            )}
          </div>

          {/* Footer with count */}
          {filteredOptions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''} available
                {searchTerm && ` (filtered from ${options.length})`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
