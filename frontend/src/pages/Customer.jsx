import { useState,useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import ENDPOINTS from '../api/endpoint';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle, Mail, Phone, MapPin, User } from 'lucide-react';



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
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    customer_email: 'NA',
                    customer_address: 'NA'
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

