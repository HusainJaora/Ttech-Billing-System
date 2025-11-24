import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
import { Network, AlertCircle, CheckCircle, Tag, RefreshCw, Sparkles, ArrowLeft, Edit2, Save } from 'lucide-react';
import { SearchActionBar } from '../../components/SearchActionBar';
import { ExportButton } from '../../components/ExportButton';
import { Pagination } from '../../components/Pagination';
import { MasterActions } from '../../components/Buttons/MasterActionButton';
import { 
  usePersistedForm,
  saveToSession,
  loadFromSession,
  useScrollPosition
} from '../../hooks/SessionStorage';

// Add Product Category Component
export const ProductCategory = () => {
  // Use persisted form with session storage
  const {
    formData,
    handleChange: handleFormChange,
    resetForm,
    clearForm
  } = usePersistedForm('add_product_category', {
    product_category_name: ''
  }, {
    clearOnSubmit: true,
    restoreOnMount: true
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_category_name.trim()) {
      newErrors.product_category_name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    handleFormChange(e);
    
    const { name } = e.target;
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };


   const handleBackToList = () => {
    navigate('/master/product-categories/list');
    

    };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(ENDPOINTS.PRODUCT_CATEGORY.ADD_PRODUCT_CATEGORY, {
        product_category_name: formData.product_category_name
      });
      showNotification('success', response.data.message || 'Product category added successfully');

      // Clear form data from session storage
      clearForm();
      
    } catch (error) {
      console.error('Error creating product category:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message ||
        'Failed to create product category. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    resetForm();
    setErrors({});
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <button
                    onClick={handleBackToList}
                    className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Add Product Category
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Create a new product category
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.show && (
          <div className={`mb-6 rounded-xl border-2 p-4 flex items-start space-x-3 shadow-lg transform transition-all animate-in slide-in-from-top ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Product Category Information
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">Fill in the details below to add a new product category</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="group">
              <label htmlFor="product_category_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Network className="h-4 w-4 text-indigo-500" />
                <span>Category Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="product_category_name"
                name="product_category_name"
                value={formData.product_category_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.product_category_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter category name"
              />
              {errors.product_category_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.product_category_name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding Category...</span>
                  </>
                ) : (
                  <>
                    <Network className="h-4 w-4" />
                    <span>Add Category</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">Information</h3>
              <p className="text-sm text-blue-800 mt-1">
                All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

// Product Category List with URL-based state persistence
export const ProductCategoryList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  const ITEMS_PER_PAGE = 20;

  // ============================================
  // SCROLL POSITION MANAGEMENT WITH HOOK
  // ============================================
  
  const { saveScroll, restoreScroll, clearScroll } = useScrollPosition(
    'productCategoryList',
    false // Don't auto-restore on mount
  );

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && categories.length > 0) {
      restoreScroll(300);
    }
  }, [loading, categories.length, restoreScroll]);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
    if (!searchParams.get('page')) {
      setCurrentPage(1);
    }
  }, [searchTerm, categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage, setSearchParams]);

  const fetchCategories = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(ENDPOINTS.PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST);
      
      if (response.data.message) {
        setCategories([]);
        setError(null);
      } else {
        setCategories(response.data.ProductCategory || []);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || '';
      
      if (errorMessage.toLowerCase().includes('no product category found') || 
          errorMessage.toLowerCase().includes('product category not found') ||
          err.response?.status === 400) {
        setCategories([]);
        setError(null);
      } else {
        setError(errorMessage || 'Failed to fetch product categories');
        console.error('Product category fetch error:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterCategories = () => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = categories.filter(category => {
      const name = (category.product_category_name || '').toLowerCase();
      return name.includes(term);
    });
    setFilteredCategories(filtered);
  };

  // ============================================
  // HANDLERS
  // ============================================

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.PRODUCT_CATEGORY.DELETE_PRODUCT_CATEGORY}/${categoryId}`
      );
      
      showNotification('success', 
        response.data.message || 'Product category deleted successfully'
      );
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting product category:', error);
      throw error;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    clearScroll(); // Clear saved scroll position
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    fetchCategories(true);
  };

  const handleViewCategory = (categoryId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/product-categories/detail/${categoryId}`);
  };

  const handleEditCategory = (categoryId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/master/edit-product-category/${categoryId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // ============================================
  // PAGINATION
  // ============================================

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product categories...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Network className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Category List</h1>
                <p className="text-sm text-gray-600">
                  Total {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                  {filteredCategories.length > 0 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh category list"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {ENDPOINTS.PRODUCT_CATEGORY?.EXPORT_PRODUCT_CATEGORY && (
                <ExportButton
                  endpoint={ENDPOINTS.PRODUCT_CATEGORY.EXPORT_PRODUCT_CATEGORY}
                  axiosInstance={axiosInstance}
                  defaultFilters={{ q: '', from_date: '', to_date: '' }}
                  buttonText="Export"
                  modalTitle="Export Product Categories"
                  fileNamePrefix="Product_Category_List"
                  filterFields={[
                    {
                      name: 'q',
                      label: 'Search (Category Name)',
                      type: 'text',
                      placeholder: 'Optional search term',
                      gridSpan: 2
                    },
                    {
                      name: 'from_date',
                      label: 'From Date',
                      type: 'date'
                    },
                    {
                      name: 'to_date',
                      label: 'To Date',
                      type: 'date'
                    }
                  ]}
                  onExportSuccess={(filename) => {
                    console.log('Export successful:', filename);
                  }}
                  onExportError={(error) => {
                    console.error('Export failed:', error);
                  }}
                />
              )}

              <button
                onClick={() => navigate('/master/add-product-category')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Add Category</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing category list...</span>
          </div>
        )}

        {notification.show && (
          <div className={`mb-6 rounded-xl border-2 p-4 flex items-start space-x-3 shadow-lg animate-in slide-in-from-top ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={handleManualRefresh}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <SearchActionBar
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search by category name..."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {currentCategories.length > 0 ? (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created Time
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCategories.map((category) => {
                      const serialNumber = categories.length - categories.findIndex(c => c.product_category_id === category.product_category_id);
                      return (
                        <tr
                          key={category.product_category_id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">
                              {serialNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Network className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {category.product_category_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatDate(category.created_date)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {category.created_time || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <MasterActions
                              onEdit={() => handleEditCategory(category.product_category_id)}
                              onView={() => handleViewCategory(category.product_category_id)}
                              onDelete={() => handleDeleteCategory(
                                category.product_category_id, 
                                category.product_category_name
                              )}
                              itemName={'category'}
                              size="md"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCategories.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  itemLabel="categories"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <Network className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No categories found' : 'No product categories yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first product category'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/master/add-product-category')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    <Network className="h-5 w-5" />
                    <span>Add First Category</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

// Edit Product Category
export const EditProductCategory = () => {
  const navigate = useNavigate();
  const { product_category_id } = useParams();
  
  const [formData, setFormData] = useState({
    product_category_name: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Save form data to session storage on change
  useEffect(() => {
    // Only save if we have originalData to compare with
    if (!originalData) return;

    // Check if different from original
    const isDifferent = JSON.stringify(formData) !== JSON.stringify(originalData);

    if (isDifferent) {
      // Save to session storage if different from original (including empty state)
      saveToSession(`editProductCategoryForm_${product_category_id}`, formData);
    } else {
      // Clear session storage if back to original state
      sessionStorage.removeItem(`editProductCategoryForm_${product_category_id}`);
    }
  }, [formData, product_category_id, originalData]);

  // Save scroll position
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToSession(`editProductCategoryScroll_${product_category_id}`, window.scrollY);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveToSession(`editProductCategoryScroll_${product_category_id}`, window.scrollY);
    };
  }, [product_category_id]);

  // Restore scroll position
  useEffect(() => {
    if (!loading) {
      const scrollY = loadFromSession(`editProductCategoryScroll_${product_category_id}`, 0);
      if (scrollY > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollY);
          sessionStorage.removeItem(`editProductCategoryScroll_${product_category_id}`);
        }, 100);
      }
    }
  }, [loading, product_category_id]);

  useEffect(() => {
    fetchProductCategoryData();
  }, [product_category_id]);

  const fetchProductCategoryData = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.PRODUCT_CATEGORY.PRODUCT_CATEGORY_DETAIL}/${product_category_id}`
      );
      
      const categoryData = {
        product_category_name: response.data.productCategory.product_category_name || ''
      };
      
      // Set original data first
      setOriginalData(categoryData);
      
      // Check if we have saved form data from a previous session
      const savedFormData = loadFromSession(`editProductCategoryForm_${product_category_id}`, null);
      
      // If we have saved data (including empty state), restore it
      // Otherwise use the original data from server
      if (savedFormData !== null) {
        setFormData(savedFormData);
      } else {
        setFormData(categoryData);
      }
    } catch (error) {
      console.error('Error fetching product category:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch product category details';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_category_name.trim()) {
      newErrors.product_category_name = 'Product category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put(
        `${ENDPOINTS.PRODUCT_CATEGORY.UPDATE_PRODUCT_CATEGORY}/${product_category_id}`,
        formData
      );
      
      showNotification('success', response.data.message || 'Product category updated successfully');
      
      // Clear saved form data on successful update
      sessionStorage.removeItem(`editProductCategoryForm_${product_category_id}`);
      sessionStorage.removeItem(`editProductCategoryScroll_${product_category_id}`);
      
      setTimeout(() => {
        navigate(`/product-categories/detail/${product_category_id}`);
      }, 1500);

    } catch (error) {
      console.error('Error updating product category:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update product category. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear saved form data when canceling
    sessionStorage.removeItem(`editProductCategoryForm_${product_category_id}`);
    sessionStorage.removeItem(`editProductCategoryScroll_${product_category_id}`);
    navigate('/master/product-categories/list');
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      sessionStorage.removeItem(`editProductCategoryForm_${product_category_id}`);
      setErrors({});
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product category details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Edit2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Edit Product Category
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Update product category information
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.show && (
          <div className={`mb-6 rounded-xl border-2 p-4 flex items-start space-x-3 shadow-lg transform transition-all animate-in slide-in-from-top ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Product Category Information
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">Update the details below to modify product category information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="group">
              <label htmlFor="product_category_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Network className="h-4 w-4 text-indigo-500" />
                <span>Product Category Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="product_category_name"
                name="product_category_name"
                value={formData.product_category_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.product_category_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter product category name"
              />
              {errors.product_category_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.product_category_name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all font-medium shadow-sm transform hover:scale-105"
                disabled={saving || !hasChanges()}
                title="Reset to original values"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transform hover:scale-105"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">Information</h3>
              <p className="text-sm text-blue-800 mt-1">
                All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
                Your changes are automatically saved locally. If the page reloads, your unsaved edits will be restored.
                Use the <span className="font-semibold">Reset</span> button to discard changes and restore original values.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

// Product Category Detail Component
export const ProductCategoryDetail = () => {
  const navigate = useNavigate();
  const { product_category_id } = useParams(); 
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCategoryDetail();
  }, [product_category_id]);

  const fetchCategoryDetail = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.PRODUCT_CATEGORY.PRODUCT_CATEGORY_DETAIL}/${product_category_id}`
      );
      
      setCategoryData(response.data.productCategory);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to fetch product category details';
      setError(errorMessage);
      console.error('Product category detail fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/master/edit-product-category/${product_category_id}`);
  };

  const handleBackToList = () => {
    navigate('/master/product-categories/list');

  };

  if (loading && !categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product category details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product Category</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToList}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Category List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <button
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Network className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{categoryData?.product_category_name}</h1>
                <p className="text-sm text-gray-600">Product Category Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing category details...</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Network className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Name</p>
                  <p className="text-base text-gray-900">{categoryData?.product_category_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Created Date</p>
                <p className="text-base text-gray-900">
                  {categoryData?.created_date ? new Date(categoryData.created_date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created Time</p>
                <p className="text-base text-gray-900">{categoryData?.created_time || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

