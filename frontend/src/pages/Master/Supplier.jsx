import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileCheck, ArrowLeft, Edit2, Save, Info, BookOpen, Building2, AlertCircle, CheckCircle, Phone, User, RefreshCw, Sparkles, Wrench, MapPin, FileText } from 'lucide-react';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
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

// Add Supplier Component
export const Supplier = () => {
  // Use persisted form with session storage
  const {
    formData,
    handleChange: handleFormChange,
    resetForm,
    clearForm
  } = usePersistedForm('add_supplier', {
    supplier_Legal_name: '',
    supplier_Ledger_name: '',
    supplier_contact: '',
    supplier_address: '',
    supplier_contact_name: '',
    supplier_other: ''
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
    if (!formData.supplier_Legal_name.trim()) {
      newErrors.supplier_Legal_name = 'Supplier legal name is required';
    }

    if (!formData.supplier_contact.trim()) {
      newErrors.supplier_contact = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.supplier_contact)) {
      newErrors.supplier_contact = 'Phone number must be 10 digits';
    }

    if (!formData.supplier_contact_name.trim()) {
      newErrors.supplier_contact_name = 'Supplier contact person name is required';
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
  const handleBackToList = () => {
    navigate('/master/supplier/list');
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(ENDPOINTS.SUPPLIER.ADD_SUPPLIER, {
        supplier_Legal_name: formData.supplier_Legal_name,
        supplier_Ledger_name: formData.supplier_Ledger_name || 'NA',
        supplier_contact: formData.supplier_contact,
        supplier_address: formData.supplier_address || 'NA',
        supplier_contact_name: formData.supplier_contact_name,
        supplier_other: formData.supplier_other || 'NA',
      });
      showNotification('success', response.data.message || 'Supplier added successfully');

      // Clear form data from session storage
      clearForm();

    } catch (error) {
      console.error('Error creating supplier:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message ||
        'Failed to create supplier. Please try again.';
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
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Add Supplier
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Create a new Supplier record
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
              <User className="h-5 w-5 mr-2" />
              Supplier Information
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">Fill in the details below to add a new Supplier</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Supplier legal name */}
            <div className="group">
              <label htmlFor="supplier_Legal_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                <span>Supplier Legal Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="supplier_Legal_name"
                name="supplier_Legal_name"
                value={formData.supplier_Legal_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_Legal_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter Supplier legal name"
              />
              {errors.supplier_Legal_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_Legal_name}</span>
                </p>
              )}
            </div>

            {/* Supplier ledger name */}
            <div className="group">
              <label htmlFor="supplier_Ledger_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <span>Supplier Ledger Name</span>
              </label>
              <input
                type="text"
                id="supplier_Ledger_name"
                name="supplier_Ledger_name"
                value={formData.supplier_Ledger_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_Ledger_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter supplier ledger name"
              />
              {errors.supplier_Ledger_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_Ledger_name}</span>
                </p>
              )}
            </div>

            {/* Supplier contact */}
            <div className="group">
              <label htmlFor="supplier_contact" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>Supplier Phone Number <span className="text-red-500">*</span></span>
              </label>
              <input
                type="tel"
                id="supplier_contact"
                name="supplier_contact"
                value={formData.supplier_contact}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_contact ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
              />
              {errors.supplier_contact && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_contact}</span>
                </p>
              )}
            </div>

            {/* Supplier Address */}
            <div className="group">
              <label htmlFor="supplier_address" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>Supplier Address</span>
              </label>
              <input
                type="text"
                id="supplier_address"
                name="supplier_address"
                value={formData.supplier_address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_address ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter supplier address"
              />
              {errors.supplier_address && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_address}</span>
                </p>
              )}
            </div>

            {/* Supplier Contact person name */}
            <div className="group">
              <label htmlFor="supplier_contact_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 text-indigo-500" />
                <span>Supplier Contact Person Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="supplier_contact_name"
                name="supplier_contact_name"
                value={formData.supplier_contact_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_contact_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter supplier contact person name"
              />
              {errors.supplier_contact_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_contact_name}</span>
                </p>
              )}
            </div>

            {/* Supplier Other Detail */}
            <div className="group">
              <label htmlFor="supplier_other" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Info className="h-4 w-4 text-indigo-500" />
                <span>Other Details</span>
              </label>
              <input
                type="text"
                id="supplier_other"
                name="supplier_other"
                value={formData.supplier_other}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_other ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter supplier other detail"
              />
              {errors.supplier_other && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_other}</span>
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
                    <span>Adding Supplier...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4" />
                    <span>Add Supplier</span>
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

// Supplier List with URL-based state persistence
export const SupplierList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
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
    'supplierList',
    false // Don't auto-restore on mount
  );

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && suppliers.length > 0) {
      restoreScroll(300);
    }
  }, [loading, suppliers.length, restoreScroll]);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
    if (!searchParams.get('page')) {
      setCurrentPage(1);
    }
  }, [searchTerm, suppliers]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage, setSearchParams]);

  const fetchSuppliers = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(ENDPOINTS.SUPPLIER.SUPPLIER_LIST);
      
      // Backend already returns suppliers sorted by supplier_id DESC
      // Handle case where response contains a message instead of suppliers array
      if (response.data.message && !response.data.suppliers) {
        setSuppliers([]);
        setError(null);
        console.log(response.data.message);
      } else {
        const suppliersList = response.data.suppliers || [];
        setSuppliers(suppliersList);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || '';
      
      // Handle "No suppliers found" message as a normal empty state
      if (errorMessage.toLowerCase().includes('no supplier') || 
          err.response?.status === 404) {
        setSuppliers([]);
        setError(null);
        console.log('No suppliers available');
      } else {
        setError(errorMessage || 'Failed to fetch suppliers');
        console.error('Supplier fetch error:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterSuppliers = () => {
    if (!searchTerm.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = suppliers.filter(supplier => {
      const legalName = (supplier.supplier_Legal_name || '').toLowerCase();
      return legalName.includes(term);
    });
    setFilteredSuppliers(filtered);
  };

  // ============================================
  // HANDLERS
  // ============================================

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleDeleteSupplier = async (supplierId, supplierName) => {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.SUPPLIER.DELETE_SUPPLIER}/${supplierId}`
      );
      
      showNotification('success', 
        response.data.message || 'Supplier deleted successfully'
      );
      
      // Refresh the supplier list
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error; // Let MasterActions handle the error display
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    clearScroll(); // Clear saved scroll position
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    fetchSuppliers(true);
  };

  const handleViewSupplier = (supplierId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/suppliers/detail/${supplierId}`);
  };

  const handleEditSupplier = (supplierId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/master/edit-supplier/${supplierId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  // ============================================
  // PAGINATION
  // ============================================

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading && suppliers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading suppliers...</p>
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
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supplier List</h1>
                <p className="text-sm text-gray-600">
                  Total {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''}
                  {filteredSuppliers.length > 0 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh supplier list"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Integrated ExportButton Component */}
              {ENDPOINTS.SUPPLIER?.EXPORT_SUPPLIER && (
                <ExportButton
                  endpoint={ENDPOINTS.SUPPLIER.EXPORT_SUPPLIER}
                  axiosInstance={axiosInstance}
                  defaultFilters={{ q: '', from_date: '', to_date: '' }}
                  buttonText="Export"
                  modalTitle="Export Suppliers"
                  fileNamePrefix="Supplier_List"
                  filterFields={[
                    {
                      name: 'q',
                      label: 'Search (Legal Name)',
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
                onClick={() => navigate('/master/add-supplier')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Add Supplier</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing supplier list...</span>
          </div>
        )}

        {/* Notification Display */}
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
            placeholder="Search by legal name..."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {currentSuppliers.length > 0 ? (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Legal Name
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
                    {currentSuppliers.map((supplier) => {
                      const serialNumber = suppliers.length - suppliers.findIndex(s => s.supplier_id === supplier.supplier_id);
                      return (
                        <tr
                          key={supplier.supplier_id}
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
                                <Building2 className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {supplier.supplier_Legal_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatDate(supplier.created_date)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatTime(supplier.created_time)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <MasterActions
                              onEdit={() => handleEditSupplier(supplier.supplier_id)}
                              onView={() => handleViewSupplier(supplier.supplier_id)}
                              onDelete={() => handleDeleteSupplier(
                                supplier.supplier_id, 
                                supplier.supplier_Legal_name
                              )}
                              itemName={'Supplier ?'}
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
                  totalItems={filteredSuppliers.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  itemLabel="suppliers"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No suppliers found' : 'No suppliers yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first supplier'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/master/add-supplier')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Add First Supplier</span>
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

// Edit Supplier with session storage
export const EditSupplier = () => {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  
  const [formData, setFormData] = useState({
    supplier_Legal_name: '',
    supplier_Ledger_name: '',
    supplier_contact: '',
    supplier_address: '',
    supplier_contact_name: '',
    supplier_other: ''
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
      saveToSession(`editSupplierForm_${supplierId}`, formData);
    } else {
      // Clear session storage if back to original state
      sessionStorage.removeItem(`editSupplierForm_${supplierId}`);
    }
  }, [formData, supplierId, originalData]);

  // Save scroll position
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToSession(`editSupplierScroll_${supplierId}`, window.scrollY);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveToSession(`editSupplierScroll_${supplierId}`, window.scrollY);
    };
  }, [supplierId]);

  // Restore scroll position
  useEffect(() => {
    if (!loading) {
      const scrollY = loadFromSession(`editSupplierScroll_${supplierId}`, 0);
      if (scrollY > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollY);
          sessionStorage.removeItem(`editSupplierScroll_${supplierId}`);
        }, 100);
      }
    }
  }, [loading, supplierId]);

  useEffect(() => {
    fetchSupplierData();
  }, [supplierId]);

  const fetchSupplierData = async () => {
    try {
      console.log('Fetching supplier data for ID:', supplierId);
      console.log('Endpoint:', `${ENDPOINTS.SUPPLIER.SUPPLIER_DETAIL}/${supplierId}`);
      setLoading(true);
      const response = await axiosInstance.get(
        `${ENDPOINTS.SUPPLIER.SUPPLIER_DETAIL}/${supplierId}`
      );
      
      const supplierData = {
        supplier_Legal_name: response.data.supplier.supplier_Legal_name || '',
        supplier_Ledger_name: response.data.supplier.supplier_Ledger_name || '',
        supplier_contact: response.data.supplier.supplier_contact || '',
        supplier_address: response.data.supplier.supplier_address || '',
        supplier_contact_name: response.data.supplier.supplier_contact_name || '',
        supplier_other: response.data.supplier.supplier_other || ''
      };
      
      // Set original data first
      setOriginalData(supplierData);
      
      // Check if we have saved form data from a previous session
      const savedFormData = loadFromSession(`editSupplierForm_${supplierId}`, null);
      
      // If we have saved data (including empty state), restore it
      // Otherwise use the original data from server
      if (savedFormData !== null) {
        setFormData(savedFormData);
      } else {
        setFormData(supplierData);
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch supplier details';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.supplier_Legal_name.trim()) {
      newErrors.supplier_Legal_name = 'Legal name is required';
    }

    if (!formData.supplier_Ledger_name.trim()) {
      newErrors.supplier_Ledger_name = 'Ledger name is required';
    }

    if (!formData.supplier_contact.trim()) {
      newErrors.supplier_contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.supplier_contact)) {
      newErrors.supplier_contact = 'Contact number must be 10 digits';
    }

    if (!formData.supplier_address.trim()) {
      newErrors.supplier_address = 'Address is required';
    }

    if (!formData.supplier_contact_name.trim()) {
      newErrors.supplier_contact_name = 'Contact person name is required';
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
        `${ENDPOINTS.SUPPLIER.UPDATE_SUPPLIER}/${supplierId}`,
        formData
      );
      
      showNotification('success', response.data.message || 'Supplier updated successfully');
      
      // Clear saved form data on successful update
      sessionStorage.removeItem(`editSupplierForm_${supplierId}`);
      sessionStorage.removeItem(`editSupplierScroll_${supplierId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        navigate(`/suppliers/detail/${supplierId}`);
      }, 1500);

    } catch (error) {
      console.error('Error updating supplier:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update supplier. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear saved form data when canceling
    sessionStorage.removeItem(`editSupplierForm_${supplierId}`);
    sessionStorage.removeItem(`editSupplierScroll_${supplierId}`);
    navigate(`/master/supplier/list`);
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      sessionStorage.removeItem(`editSupplierForm_${supplierId}`);
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
          <p className="mt-4 text-gray-600 font-medium">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with gradient */}
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
                  Edit Supplier
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Update supplier information
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification with animation */}
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

        {/* Form Card with enhanced styling */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Supplier Information
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">Update the details below to modify supplier information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Supplier Legal Name */}
            <div className="group">
              <label htmlFor="supplier_Legal_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                <span>Legal Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="supplier_Legal_name"
                name="supplier_Legal_name"
                value={formData.supplier_Legal_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_Legal_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter legal name"
              />
              {errors.supplier_Legal_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_Legal_name}</span>
                </p>
              )}
            </div>

            {/* Supplier Ledger Name */}
            <div className="group">
              <label htmlFor="supplier_Ledger_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span>Ledger Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="supplier_Ledger_name"
                name="supplier_Ledger_name"
                value={formData.supplier_Ledger_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_Ledger_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter ledger name"
              />
              {errors.supplier_Ledger_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_Ledger_name}</span>
                </p>
              )}
            </div>

            {/* Supplier Contact */}
            <div className="group">
              <label htmlFor="supplier_contact" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>Contact Number <span className="text-red-500">*</span></span>
              </label>
              <input
                type="tel"
                id="supplier_contact"
                name="supplier_contact"
                value={formData.supplier_contact}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_contact ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter 10-digit contact number"
                maxLength="10"
              />
              {errors.supplier_contact && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_contact}</span>
                </p>
              )}
            </div>

            {/* Supplier Address */}
            <div className="group">
              <label htmlFor="supplier_address" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>Address <span className="text-red-500">*</span></span>
              </label>
              <textarea
                id="supplier_address"
                name="supplier_address"
                value={formData.supplier_address}
                onChange={handleChange}
                rows="3"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_address ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter complete address"
              />
              {errors.supplier_address && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_address}</span>
                </p>
              )}
            </div>

            {/* Supplier Contact Name */}
            <div className="group">
              <label htmlFor="supplier_contact_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 text-indigo-500" />
                <span>Contact Person Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="supplier_contact_name"
                name="supplier_contact_name"
                value={formData.supplier_contact_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.supplier_contact_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter contact person name"
              />
              {errors.supplier_contact_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.supplier_contact_name}</span>
                </p>
              )}
            </div>

            {/* Supplier Other */}
            <div className="group">
              <label htmlFor="supplier_other" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span>Other Information</span>
              </label>
              <textarea
                id="supplier_other"
                name="supplier_other"
                value={formData.supplier_other}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300"
                placeholder="Enter additional information (optional)"
              />
            </div>

            {/* Form Actions */}
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

        {/* Info Card with enhanced styling */}
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

// Supplier Detail
export const SupplierDetail = () => {
  const navigate = useNavigate();
  const { supplierId } = useParams(); 
  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSupplierDetail();
  }, [supplierId]);

  const fetchSupplierDetail = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.SUPPLIER.SUPPLIER_DETAIL}/${supplierId}`
      );
      
      setSupplierData(response.data.supplier);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to fetch supplier details';
      setError(errorMessage);
      console.error('Supplier detail fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/master/edit-supplier/${supplierId}`);
  };

  const handleBackToList = () => {
    navigate('/master/supplier/list');
  };

  if (loading && !supplierData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Supplier</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToList}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Supplier List
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
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{supplierData?.supplier_Legal_name}</h1>
                <p className="text-sm text-gray-600">Supplier Details</p>
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
            <span className="text-sm text-blue-700">Refreshing supplier details...</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Building2 className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Legal Name</p>
                  <p className="text-base text-gray-900">{supplierData?.supplier_Legal_name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Ledger Name</p>
                  <p className="text-base text-gray-900">{supplierData?.supplier_Ledger_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Number</p>
                  <p className="text-base text-gray-900">{supplierData?.supplier_contact}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="text-base text-gray-900">{supplierData?.supplier_contact_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address & Additional Information</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base text-gray-900">{supplierData?.supplier_address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileCheck className="h-5 w-5 text-indigo-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Other Details</p>
                  <p className="text-base text-gray-900">{supplierData?.supplier_other}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Created Date</p>
                <p className="text-base text-gray-900">
                  {supplierData?.created_date ? new Date(supplierData.created_date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created Time</p>
                <p className="text-base text-gray-900">{supplierData?.created_time || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};