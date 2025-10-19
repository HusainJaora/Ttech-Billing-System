import { useState,useContext,useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import ENDPOINTS from '../api/endpoint';
import { AuthContext } from '../context/AuthContext';
 import { UserPlus, AlertCircle, CheckCircle, Mail, Phone, MapPin, User, Users, Search, Calendar, Eye, RefreshCw, Download, Filter, X, Sparkles } from 'lucide-react';
 import { SearchActionBar } from '../components/SearchActionBar';





export const Customer = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

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

      setFormData({
        customer_name: '',
        customer_contact: '',
        customer_email: '',
        customer_address: ''
      });

    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message ||
        'Failed to create user. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar Component */}
      <Sidebar
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        currentUser={user}
        currentPath={location.pathname}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with gradient */}
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
                  onClick={() => setFormData({
                    customer_name: '',
                    customer_contact: '',
                    customer_email: '',
                    customer_address: ''
                  })}
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

          {/* Info Card with enhanced styling */}
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
      </div>
    </div>
  );
};


export const CustomerList = () => { 
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({ q: '', from_date: '', to_date: '' });
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(ENDPOINTS.CUSTOMER.CUSTOMER_LIST);
      const sortedCustomers = (response.data.customers || []).sort((a, b) => {
        const dateA = new Date(`${a.created_date} ${a.created_time || '00:00:00'}`);
        const dateB = new Date(`${b.created_date} ${b.created_time || '00:00:00'}`);
        return dateB - dateA;
      });
      setCustomers(sortedCustomers);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Customer fetch error:', err);
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportChange = (e) => {
    const { name, value } = e.target;
    setExportFilters(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER.EXPORT_CUSTOMER,
        exportFilters,
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `Customer List_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowExportModal(false);
      setExportFilters({ q: '', from_date: '', to_date: '' });

      showNotification('success', `Customers exported successfully! File: ${filename}`);
      
    } catch (error) {
      console.error('Export error:', error);

      if (error.response?.status === 404) {
        showNotification('error', 'No customers found matching your filters');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Failed to export customers. Please try again.';
        showNotification('error', errorMessage);
      }
    } finally {
      setExporting(false);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchCustomers();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/detail/${customerId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        currentUser={user}
        currentPath={location.pathname}
      />

      <div className="flex-1 flex flex-col min-h-screen">
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
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  title="Export customers to Excel"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
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
          {notification.show && (
            <div className={`mb-6 rounded-lg border-2 p-4 flex items-start space-x-3 ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
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
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Sr. No.
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact
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
                      {currentCustomers.map((customer, index) => {
                        const serialNumber = customers.length - customers.findIndex(c => c.customer_id === customer.customer_id);
                        return (
                          <tr
                            key={customer.customer_id}
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
                                <Users className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {customer.customer_name}
                                </p>
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
                            <button
                              onClick={() => handleViewCustomer(customer.customer_id)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {[...Array(totalPages)].map((_, i) => {
                              const page = i + 1;
                              // Show first page, last page, current page, and pages around current
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                      currentPage === page
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                              ) {
                                return (
                                  <span key={page} className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Export Customers</h2>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search (Name or Contact)</label>
                <input
                  type="text"
                  name="q"
                  value={exportFilters.q}
                  onChange={handleExportChange}
                  placeholder="Optional search term"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    name="from_date"
                    value={exportFilters.from_date}
                    onChange={handleExportChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    name="to_date"
                    value={exportFilters.to_date}
                    onChange={handleExportChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Filter className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">Apply filters to export specific customers. Leave empty to export all.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={exporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
