import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import ENDPOINTS from '../api/endpoint';
import { UserPlus, AlertCircle, CheckCircle, Mail, Phone, MapPin, User, Users, Calendar, Eye, RefreshCw, Sparkles, FileText, Receipt, ArrowLeft, Clock, XCircle, Wrench, ClipboardList, Edit2, Save } from 'lucide-react';
import { SearchActionBar } from '../components/SearchActionBar';
import { ExportButton } from '../components/ExportButton';
import { Pagination } from '../components/Pagination';
import { 
  saveToSession,
  loadFromSession,
} from '../components/SessionStorage';

// Add Customer Component
export const Customer = () => {
  const [formData, setFormData] = useState(() => 
    loadFromSession('addCustomerForm', {
      customer_name: '',
      customer_contact: '',
      customer_email: '',
      customer_address: ''
    })
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Save form data to session storage on change
  useEffect(() => {
    saveToSession('addCustomerForm', formData);
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_contact.trim()) {
      newErrors.customer_contact = 'Customer contact is required';
    } else if (!/^\d{10}$/.test(formData.customer_contact)) {
      newErrors.customer_contact = 'Contact number must be 10 digits';
    }

    if (formData.customer_email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
        newErrors.customer_email = 'Email must be valid';
      }
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

    setLoading(true);
    try {
      const response = await axiosInstance.post(ENDPOINTS.CUSTOMER.ADD_CUSTOMER, {
        customer_name: formData.customer_name,
        customer_contact: formData.customer_contact,
        customer_email: formData.customer_email || 'NA',
        customer_address: formData.customer_address || 'NA',
      });
      showNotification('success', response.data.message || 'Customer added successfully');

      // Clear form and session storage on success
      const emptyForm = {
        customer_name: '',
        customer_contact: '',
        customer_email: '',
        customer_address: ''
      };
      setFormData(emptyForm);
      saveToSession('addCustomerForm', emptyForm);

    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message ||
        'Failed to create user. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const emptyForm = {
      customer_name: '',
      customer_contact: '',
      customer_email: '',
      customer_address: ''
    };
    setFormData(emptyForm);
    saveToSession('addCustomerForm', emptyForm);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Add Customer
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Create a new customer record
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">Fill in the details below to add a new customer</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Customer Name */}
            <div className="group">
              <label htmlFor="customer_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 text-indigo-500" />
                <span>Customer Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.customer_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter customer name"
              />
              {errors.customer_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.customer_name}</span>
                </p>
              )}
            </div>

            {/* Customer Contact */}
            <div className="group">
              <label htmlFor="customer_contact" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>Contact Number <span className="text-red-500">*</span></span>
              </label>
              <input
                type="tel"
                id="customer_contact"
                name="customer_contact"
                value={formData.customer_contact}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.customer_contact ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter 10-digit contact number"
                maxLength="10"
              />
              {errors.customer_contact && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.customer_contact}</span>
                </p>
              )}
            </div>

            {/* Customer Email */}
            <div className="group">
              <label htmlFor="customer_email" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.customer_email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter email address (optional)"
              />
              {errors.customer_email && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.customer_email}</span>
                </p>
              )}
            </div>

            {/* Customer Address */}
            <div className="group">
              <label htmlFor="customer_address" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>Address</span>
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm hover:border-indigo-300"
                placeholder="Enter customer address (optional)"
              />
            </div>

            {/* Form Actions */}
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
                    <span>Adding Customer...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Add Customer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">Information</h3>
              <p className="text-sm text-blue-800 mt-1">
                Fields marked with <span className="text-red-500 font-semibold">*</span> are required.
                Email and Address are optional and will default to 'NA' if not provided.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

// Customer List Component with URL-based state persistence
export const CustomerList = () => { 
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const ITEMS_PER_PAGE = 20;

  // Save scroll position before unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToSession('customerListScroll', window.scrollY);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveToSession('customerListScroll', window.scrollY);
    };
  }, []);

  // Restore scroll position
  useEffect(() => {
    const scrollY = loadFromSession('customerListScroll', 0);
    if (scrollY > 0) {
      window.scrollTo(0, scrollY);
      // Clear after restoring
      sessionStorage.removeItem('customerListScroll');
    }
  }, [loading]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
    // Don't reset page if we're coming back from navigation
    if (!searchParams.get('page')) {
      setCurrentPage(1);
    }
  }, [searchTerm, customers]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage]);

  const fetchCustomers = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(ENDPOINTS.CUSTOMER.CUSTOMER_LIST);
      const sortedCustomers = (response.data.customers || []).sort((a, b) => {
        const dateA = new Date(`${a.created_date} ${a.created_time || '00:00:00'}`);
        const dateB = new Date(`${b.created_date} ${b.created_time || '00:00:00'}`);
        return dateB - dateA;
      });
      setCustomers(sortedCustomers);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || '';
      
      if (errorMessage.toLowerCase().includes('no customer found') || 
          errorMessage.toLowerCase().includes('customer not found') ||
          err.response?.status === 400) {
        setCustomers([]);
        setError(null);
        console.log('No customers available');
      } else {
        setError(errorMessage || 'Failed to fetch customers');
        console.error('Customer fetch error:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(customer =>
      customer.customer_name.toLowerCase().includes(term) ||
      customer.customer_contact.includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    fetchCustomers(true);
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/detail/${customerId}`);
  };

  const handleEditCustomer = (customerId) => {
    navigate(`/customers/edit/${customerId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
                <p className="text-sm text-gray-600">
                  Total {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
                  {filteredCustomers.length > 0 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh customer list"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <ExportButton
                endpoint={ENDPOINTS.CUSTOMER.EXPORT_CUSTOMER}
                axiosInstance={axiosInstance}
                defaultFilters={{ q: '', from_date: '', to_date: '' }}
                buttonText="Export"
                modalTitle="Export Customers"
                fileNamePrefix="Customer List"
                filterFields={[
                  {
                    name: 'q',
                    label: 'Search (Name or Contact)',
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

              <button
                onClick={() => navigate('/customers/add')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing customer list...</span>
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
            placeholder="Search by name or contact number..."
          />
        </div> 

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {currentCustomers.length > 0 ? (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sr. No.</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Time</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCustomers.map((customer) => {
                      const serialNumber = customers.length - customers.findIndex(c => c.customer_id === customer.customer_id);
                      return (
                        <tr key={customer.customer_id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{serialNumber}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Users className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{customer.customer_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{customer.customer_contact}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(customer.created_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatTime(customer.created_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEditCustomer(customer.customer_id)}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition font-medium"
                                title="Edit customer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleViewCustomer(customer.customer_id)}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium"
                                title="View customer details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCustomers.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  itemLabel="customers"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No customers found' : 'No customers yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first customer'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/customers/add')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Add First Customer</span>
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

// Edit Customer Component with state persistence
export const EditCustomer = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Save form data to session storage on change
  useEffect(() => {
    if (formData.customer_name || formData.customer_contact) {
      saveToSession(`editCustomerForm_${customerId}`, formData);
    }
  }, [formData, customerId]);

  // Save scroll position
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToSession(`editCustomerScroll_${customerId}`, window.scrollY);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveToSession(`editCustomerScroll_${customerId}`, window.scrollY);
    };
  }, [customerId]);

  // Restore scroll position
  useEffect(() => {
    if (!loading) {
      const scrollY = loadFromSession(`editCustomerScroll_${customerId}`, 0);
      if (scrollY > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollY);
          sessionStorage.removeItem(`editCustomerScroll_${customerId}`);
        }, 100);
      }
    }
  }, [loading, customerId]);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Check if we have saved form data from a previous session
      const savedFormData = loadFromSession(`editCustomerForm_${customerId}`, null);
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.CUSTOMER.CUSTOMER_DETAIL}/${customerId}`
      );
      
      const { profile } = response.data;
      const customerData = {
        customer_name: profile.customer_name || '',
        customer_contact: profile.customer_contact || '',
        customer_email: profile.customer_email === 'NA' ? '' : (profile.customer_email || ''),
        customer_address: profile.customer_address === 'NA' ? '' : (profile.customer_address || '')
      };
      
      // If we have saved form data and it's different from original, restore it
      // This handles the case where user made changes and page reloaded
      if (savedFormData && JSON.stringify(savedFormData) !== JSON.stringify(customerData)) {
        setFormData(savedFormData);
      } else {
        setFormData(customerData);
        // Clear any stale saved data
        sessionStorage.removeItem(`editCustomerForm_${customerId}`);
      }
      
      setOriginalData(customerData);
    } catch (error) {
      console.error('Error fetching customer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch customer details';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_contact.trim()) {
      newErrors.customer_contact = 'Customer contact is required';
    } else if (!/^\d{10}$/.test(formData.customer_contact)) {
      newErrors.customer_contact = 'Contact number must be 10 digits';
    }

    if (formData.customer_email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
        newErrors.customer_email = 'Email must be valid';
      }
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
      const updateData = {
        customer_name: formData.customer_name,
        customer_contact: formData.customer_contact,
        customer_email: formData.customer_email.trim() || 'NA'
      };
      if (formData.customer_email.trim()) {
      updateData.customer_email = formData.customer_email;
      }

     if (formData.customer_address.trim()) {
      updateData.customer_address = formData.customer_address;
     }


      const response = await axiosInstance.put(
        `${ENDPOINTS.CUSTOMER.UPDATE_CUSTOMER}/${customerId}`,
        updateData
      );
      
      showNotification('success', response.data.message || 'Customer updated successfully');
      
      // Clear saved form data on successful update
      sessionStorage.removeItem(`editCustomerForm_${customerId}`);
      sessionStorage.removeItem(`editCustomerScroll_${customerId}`);
      
      setTimeout(() => {
        navigate(`/customers/detail/${customerId}`);
      }, 1500);

    } catch (error) {
      console.error('Error updating customer:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update customer. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear saved form data when canceling
    sessionStorage.removeItem(`editCustomerForm_${customerId}`);
    sessionStorage.removeItem(`editCustomerScroll_${customerId}`);
    navigate(`/customers/list`);
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      sessionStorage.removeItem(`editCustomerForm_${customerId}`);
      setErrors({});
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading customer details...</p>
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
                  Edit Customer
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Update customer information
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
              Customer Information
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">Update the details below to modify customer information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="group">
              <label htmlFor="customer_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 text-indigo-500" />
                <span>Customer Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.customer_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter customer name"
              />
              {errors.customer_name && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.customer_name}</span>
                </p>
              )}
            </div>

            <div className="group">
              <label htmlFor="customer_contact" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>Contact Number <span className="text-red-500">*</span></span>
              </label>
              <input
                type="tel"
                id="customer_contact"
                name="customer_contact"
                value={formData.customer_contact}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.customer_contact ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter 10-digit contact number"
                maxLength="10"
              />
              {errors.customer_contact && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.customer_contact}</span>
                </p>
              )}
            </div>

            <div className="group">
              <label htmlFor="customer_email" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                  errors.customer_email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Enter email address (optional)"
              />
              {errors.customer_email && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.customer_email}</span>
                </p>
              )}
            </div>

            <div className="group">
              <label htmlFor="customer_address" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>Address</span>
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm hover:border-indigo-300"
                placeholder="Enter customer address (optional)"
              />
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
                Fields marked with <span className="text-red-500 font-semibold">*</span> are required.
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

// Customer Detail Component with tab persistence
export const CustomerDetail = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Save scroll position
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToSession(`customerDetail_${customerId}_scroll`, window.scrollY);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveToSession(`customerDetail_${customerId}_scroll`, window.scrollY);
    };
  }, [customerId]);

  // Restore scroll position
  useEffect(() => {
    if (!loading && customerData) {
      const scrollY = loadFromSession(`customerDetail_${customerId}_scroll`, 0);
      if (scrollY > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollY);
          sessionStorage.removeItem(`customerDetail_${customerId}_scroll`);
        }, 100);
      }
    }
  }, [loading, customerData, customerId]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      setSearchParams({ tab: activeTab }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [customerId]);

  const fetchCustomerDetail = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.CUSTOMER.CUSTOMER_DETAIL}/${customerId}`
      );
      
      setCustomerData(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to fetch customer details';
      setError(errorMessage);
      console.error('Customer detail fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchCustomerDetail(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'paid': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  if (loading && !customerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Customer</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/customers/list')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    );
  }

  const { profile, invoices = [], quotations = [], inquiries = [], repairs = [], pending_payments = [], total_due = 0 } = customerData || {};

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <button
                onClick={() => navigate('/customers/list')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.customer_name}</h1>
                <p className="text-sm text-gray-600">Customer Details</p>
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh customer details"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing customer details...</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Number</p>
                <p className="text-base text-gray-900">{profile?.customer_contact}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-base text-gray-900">{profile?.customer_email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 md:col-span-2">
              <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base text-gray-900">{profile?.customer_address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {total_due > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Outstanding Balance</h3>
                  <p className="text-sm text-red-700">{pending_payments.length} pending invoice(s)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-900">{formatCurrency(total_due)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: FileText },
                { id: 'invoices', name: 'Invoices', icon: Receipt, count: invoices.length },
                { id: 'quotations', name: 'Quotations', icon: ClipboardList, count: quotations.length },
                { id: 'inquiries', name: 'Inquiries', icon: AlertCircle, count: inquiries.length },
                { id: 'repairs', name: 'Repairs', icon: Wrench, count: repairs.length },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                    {tab.count !== undefined && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Invoices</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{invoices.length}</p>
                    </div>
                    <Receipt className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Quotations</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{quotations.length}</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Inquiries</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">{inquiries.length}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Repairs</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">{repairs.length}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                {invoices.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(invoice.invoice_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{invoice.source_type || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(invoice.grand_total)}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(invoice.amount_paid)}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(invoice.due_amount)}</td>
                          <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No invoices found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quotations' && (
              <div className="overflow-x-auto">
                {quotations.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quotation No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotations.map((quotation) => (
                        <tr key={quotation.quotation_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{quotation.quotation_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(quotation.quotation_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{quotation.quotation_type || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(quotation.total_amount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{quotation.notes || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No quotations found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="overflow-x-auto">
                {inquiries.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Inquiry No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Technician</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inquiries.map((inquiry) => (
                        <tr key={inquiry.inquiry_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{inquiry.inquiry_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inquiry.created_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inquiry.created_time || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inquiry.technician_name || 'Not Assigned'}</td>
                          <td className="px-4 py-3">{getStatusBadge(inquiry.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No inquiries found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'repairs' && (
              <div className="overflow-x-auto">
                {repairs.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Repair No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quotation No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Inquiry No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Technician</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {repairs.map((repair) => (
                        <tr key={repair.repair_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{repair.repair_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{repair.quotation_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{repair.inquiry_no}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{repair.technician_name || 'Not Assigned'}</td>
                          <td className="px-4 py-3">{getStatusBadge(repair.repair_status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No repairs found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};