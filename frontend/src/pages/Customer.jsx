import { useState,useContext,useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import ENDPOINTS from '../api/endpoint';
import { AuthContext } from '../context/AuthContext';
 import { UserPlus, AlertCircle, CheckCircle, Mail, Phone, MapPin, User, Users, Search, Calendar, Eye, RefreshCw, Download, Filter, X } from 'lucide-react';



export const Customer = ()=>{
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
    const [formData,setFormData] = useState({
        customer_name:'',
        customer_contact:'',
        customer_email:'',
        customer_address:''
    })

    const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const validateForm = ()=>{
    const newErrors = {};
    if(!formData.customer_name.trim()){
        newErrors.customer_name = 'Customer name is required'
    }

    if(!formData.customer_contact.trim()){
        newErrors.customer_contact = 'Customer contact is required'
    }else if (!/^\d{10}$/.test(formData.customer_contact)) {
        newErrors.customer_contact = 'Contact number must be 10 digits';
   }

   if (formData.customer_email.trim()) {
   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
       newErrors.customer_email = 'Email must be valid';
   }}
   setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
}

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
    const response = await axiosInstance.post(ENDPOINTS.CUSTOMER.ADD_CUSTOMER,{
        customer_name:formData.customer_name,
        customer_contact:formData.customer_contact,
        customer_email:formData.customer_email || 'NA',
        customer_address:formData.customer_address || 'NA',
    })
    showNotification('success',response.data.message|| 'Customer added successfully')

    setFormData({
        customer_name:'',
        customer_contact:'',
        customer_email:'',
        customer_address:''
    })
    
} catch (error) {
    console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 
      'Failed to create user. Please try again.';
      showNotification('error', errorMessage);
    }finally {
      setLoading(false);
    }

}

const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar 
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        currentUser={user}
        currentPath={location.pathname}

      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-12 lg:ml-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
                  <p className="text-sm text-gray-600">Create a new customer record</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Notification */}
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

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details below to add a new customer</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Name */}
              <div>
                <label htmlFor="customer_name" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Customer Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.customer_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.customer_name}</span>
                  </p>
                )}
              </div>

              {/* Customer Contact */}
              <div>
                <label htmlFor="customer_contact" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Contact Number <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  id="customer_contact"
                  name="customer_contact"
                  value={formData.customer_contact}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.customer_contact ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit contact number"
                  maxLength="10"
                />
                {errors.customer_contact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.customer_contact}</span>
                  </p>
                )}
              </div>

              {/* Customer Email */}
              <div>
                <label htmlFor="customer_email" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.customer_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address (optional)"
                />
                {errors.customer_email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.customer_email}</span>
                  </p>
                )}
              </div>

              {/* Customer Address */}
              <div>
                <label htmlFor="customer_address" className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Address</span>
                </label>
                <textarea
                  id="customer_address"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                  placeholder="Enter customer address (optional)"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setFormData({
                    customer_name: '',
                    customer_contact: '',
                    customer_email: '',
                    customer_address:''
                  })}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={loading}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Fields marked with <span className="text-red-500">*</span> are required. 
                  Email and Address are optional and will default to 'NA' if not provided.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
)
}

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

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(ENDPOINTS.CUSTOMER.CUSTOMER_LIST);
      setCustomers(response.data.customers || []);
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
    // CRITICAL: Set responseType to 'blob' for binary data
    const response = await axiosInstance.post(
      ENDPOINTS.CUSTOMER.EXPORT_CUSTOMER,
      exportFilters,
      {
        responseType: 'blob' // This tells axios to expect binary data
      }
    );

    // Create blob from response
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Customer List_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Reset modal
    setShowExportModal(false);
    setExportFilters({ q: '', from_date: '', to_date: '' });

    // Show success notification using your existing system
    showNotification('success', `Customers exported successfully! File: ${filename}`);
    
  } catch (error) {
    console.error('Export error:', error);

    // Handle specific error cases
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or contact number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {filteredCustomers.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer ID
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
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customer_id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-indigo-600">
                            #{customer.customer_id}
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
                    ))}
                  </tbody>
                </table>
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

          {filteredCustomers.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Search Results</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Added Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.filter(c => {
                        const today = new Date().toISOString().split('T')[0];
                        return c.created_date === today;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

