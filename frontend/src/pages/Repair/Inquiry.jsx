import { useState,useRef,useEffect } from 'react';
import { useNavigate, useParams,useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
import { SearchableDropdown } from '../../components/Dropdown';

import {Download,X,Printer,ArrowLeft,ArrowRight,Save,Plus,AlertCircle,Eye,Edit2,Trash2,UserPlus,RefreshCw,CheckCircle,Clock,XCircle,
FileText,ClipboardList,Calendar,User,Phone,Wrench,Mail,MapPin,Package,Sparkles,DollarSign} from 'lucide-react';

import { SearchActionBar } from '../../components/SearchActionBar';
import { ExportButton } from '../../components/ExportButton';
import { Pagination } from '../../components/Pagination';
import {usePersistedForm, useScrollPosition, useSessionStorage, removeFromSession} from '../../hooks/SessionStorage';




export const Inquiry = () => {

  const navigate = useNavigate();
  // Session storage keys
  const STEP_KEY = 'inquiry_current_step';
  const CONTACT_KEY = 'inquiry_contact_number';
  const CUSTOMER_EXISTS_KEY = 'inquiry_customer_exists';

  // Initialize state from session storage on mount
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem(STEP_KEY);
    const step = saved ? parseInt(saved) : 0;
    // If step is 4 (success) but no inquiry details, reset to 0
    return step === 4 ? 0 : step;
  });

  const [contactNumber, setContactNumber] = useState(() => {
    return sessionStorage.getItem(CONTACT_KEY) || '';
  });

  const [customerExists, setCustomerExists] = useState(() => {
    const saved = sessionStorage.getItem(CUSTOMER_EXISTS_KEY);
    return saved === 'true';
  });

  const [loading, setLoading] = useState(false);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [inquiryDetails, setInquiryDetails] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Use persisted form with session storage
  const {
    formData,
    handleChange: handleFormChange,
    updateFields,
    resetForm,
    clearForm
  } = usePersistedForm('add_inquiry', {
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: '',
    notes: '',
    products: [
      {
        product_name: '',
        problem_description: '',
        accessories_given: ''
      }
    ]
  }, {
    clearOnSubmit: false,
    restoreOnMount: true
  });

  // Save step to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(STEP_KEY, currentStep.toString());
  }, [currentStep]);

  // Save contact number to session storage
  useEffect(() => {
    if (contactNumber) {
      sessionStorage.setItem(CONTACT_KEY, contactNumber);
    }
  }, [contactNumber]);

  // Save customer exists flag
  useEffect(() => {
    sessionStorage.setItem(CUSTOMER_EXISTS_KEY, customerExists.toString());
  }, [customerExists]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Check if customer exists by contact number
  const checkCustomerExists = async () => {
    if (!/^[0-9]{10}$/.test(contactNumber)) {
      setErrors({ contact: 'Phone number must be exactly 10 digits' });
      return;
    }

    setCheckingCustomer(true);
    setErrors({});

    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER.CHECK_BY_CONTACT,
        { customer_contact: contactNumber }
      );
      
      if (response.data && response.data.exists) {
        setCustomerExists(true);
        updateFields({
          customer_name: response.data.customer.customer_name || '',
          customer_contact: contactNumber,
          customer_email: response.data.customer.customer_email || '',
          customer_address: response.data.customer.customer_address || ''
        });
        setCurrentStep(2);
      } else {
        setCustomerExists(false);
        updateFields({ customer_contact: contactNumber });
        setCurrentStep(1);
      }
    } catch (err) {
      console.error('Error checking customer:', err);
      setCustomerExists(false);
      updateFields({ customer_contact: contactNumber });
      setCurrentStep(1);
    } finally {
      setCheckingCustomer(false);
    }
  };

  const handleChange = (e) => {
    handleFormChange(e);
    const { name } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
    updateFields({ products: updatedProducts });
    if (errors[`product_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`product_${index}_${field}`]: '' }));
    }
  };

  const addProduct = () => {
    updateFields({
      products: [
        ...formData.products,
        { product_name: '', problem_description: '', accessories_given: '' }
      ]
    });
  };

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      const updatedProducts = formData.products.filter((_, i) => i !== index);
      updateFields({ products: updatedProducts });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    if (!formData.customer_contact.trim()) {
      newErrors.customer_contact = 'Customer contact is required';
    } else if (!/^\d{10}$/.test(formData.customer_contact)) {
      newErrors.customer_contact = 'Contact number must be 10 digits';
    }
    if (formData.customer_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email must be valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.products.length === 0) {
      newErrors.products = 'At least one product is required';
    }
    formData.products.forEach((product, i) => {
      if (!product.product_name.trim()) {
        newErrors[`product_${i}_name`] = `Product name is required for item ${i + 1}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setErrors({});
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep === 1 || currentStep === 2) {
      setCurrentStep(0);
      setContactNumber('');
      setCustomerExists(false);
      resetForm();
      removeFromSession(STEP_KEY);
      removeFromSession(CONTACT_KEY);
      removeFromSession(CUSTOMER_EXISTS_KEY);
    } else {
      setCurrentStep(prev => prev - 1);
    }
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.post(ENDPOINTS.INQUIRY.ADD_INQUIRY, formData);
      
      setInquiryDetails(response.data);
      showNotification('success', 'Inquiry created successfully!');
      
      setCurrentStep(4); // Success step
      
      // Clear all session storage AFTER setting step 4
      // This ensures refresh takes user back to start
      setTimeout(() => {
        clearForm();
        removeFromSession(STEP_KEY);
        removeFromSession(CONTACT_KEY);
        removeFromSession(CUSTOMER_EXISTS_KEY);
      }, 100);
    } catch (err) {
      console.error('Error creating inquiry:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create inquiry';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleBackToList = () => {
    navigate('/repair/inquiry');
  };

  const handleReset = () => {
    resetForm();
    setCurrentStep(0);
    setContactNumber('');
    setErrors({});
    setInquiryDetails(null);
    setCustomerExists(false);
    setNotification({ show: false, type: '', message: '' });
    
    // Clear all session storage
     removeFromSession(STEP_KEY);
     removeFromSession(CONTACT_KEY);
     removeFromSession(CUSTOMER_EXISTS_KEY);
  };

  // Show receipt if requested
  if (showReceipt && inquiryDetails) {
    return (
      <InquiryReceipt 
        inquiryId={inquiryDetails.inquiry_id} 
        onClose={() => {
          setShowReceipt(false);
          setCurrentStep(4);
        }}
      />
    );
  }

  // Success Screen
  if (currentStep === 4 && inquiryDetails) {
    return (
      <>
        <header className="bg-white shadow-lg border-b border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-12 lg:ml-0">
                <button
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                    Inquiry Created Successfully!
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Sparkles className="h-3 w-3 mr-1 text-green-500" />
                    Your inquiry has been registered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Inquiry Details
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 border-2 border-gray-200">
                <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Inquiry Number:</span>
                  <span className="font-bold text-xl text-indigo-600">{inquiryDetails.inquiry_no}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Inquiry Date:</span>
                  <span className="text-gray-900">{new Date(inquiryDetails.inquiry_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-900 font-semibold">{inquiryDetails.customer?.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="text-gray-900">{inquiryDetails.customer?.customer_contact}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Products:</span>
                  <span className="text-gray-900 font-semibold">{inquiryDetails.products?.length} item(s)</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg transform hover:scale-105"
                >
                  <Printer className="w-5 h-5" />
                  View/Print Receipt
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg transform hover:scale-105"
                >
                  Create Another Inquiry
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Add New Inquiry
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Create a new repair inquiry with customer and product details
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
              : notification.type === 'error'
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
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

        {/* Progress Steps */}
        {currentStep > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
                } font-semibold transition-all`}>
                  1
                </div>
                <div className={`flex-1 h-2 mx-2 rounded-full ${
                  currentStep >= 2 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
                } transition-all`}></div>
              </div>
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
                } font-semibold transition-all`}>
                  2
                </div>
                <div className={`flex-1 h-2 mx-2 rounded-full ${
                  currentStep >= 3 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
                } transition-all`}></div>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 3 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              } font-semibold transition-all`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-3 text-sm font-medium">
              <span className={`${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500'}`}>Customer Details</span>
              <span className={`${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>Product Details</span>
              <span className={`${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-500'}`}>Review & Submit</span>
            </div>
          </div>
        )}

        {/* Step 0: Contact Lookup */}
        {currentStep === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Enter Customer Contact
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">We'll check if this customer already exists in our system</p>
            </div>

            <div className="p-8">
              <div className="max-w-md mx-auto space-y-6">
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="h-4 w-4 text-indigo-500" />
                    <span>Contact Number <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      setErrors({});
                    }}
                    maxLength={10}
                    className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-center font-semibold transition-all shadow-sm ${
                      errors.contact ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    placeholder="10 digit phone number"
                    autoFocus
                  />
                  {errors.contact && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.contact}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={checkCustomerExists}
                  disabled={checkingCustomer || contactNumber.length !== 10}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  {checkingCustomer ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Checking...</span>
                    </span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Customer Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <User className="h-5 w-5 mr-2" />
                New Customer Information
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">This is a new customer. Please fill in their details.</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  <span>Contact Number <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={formData.customer_contact}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-lg font-semibold text-gray-600"
                />
              </div>

              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>Customer Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
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
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                    errors.customer_email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  placeholder="customer@example.com (optional)"
                />
                {errors.customer_email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.customer_email}</span>
                  </p>
                )}
              </div>

              <div className="group">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span>Address</span>
                </label>
                <textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm hover:border-indigo-300"
                  placeholder="Enter address (optional)"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg transform hover:scale-105"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Product Details */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Product/Item Details
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm">Add the products for repair</p>
                </div>
                <button
                  onClick={addProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            {customerExists && (
              <div className="mx-8 mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                <p className="text-green-800 text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Existing customer: <span className="font-bold ml-1">{formData.customer_name}</span>
                </p>
              </div>
            )}

            <div className="p-8 space-y-4">
              {formData.products.map((product, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 relative bg-gradient-to-br from-gray-50 to-white hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-indigo-500" />
                      Product {index + 1}
                    </h3>
                    {formData.products.length > 1 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={product.product_name}
                        onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                          errors[`product_${index}_name`] ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        placeholder="e.g., iPhone 12, Samsung TV"
                      />
                      {errors[`product_${index}_name`] && (
                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors[`product_${index}_name`]}</span>
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Problem Description
                      </label>
                      <textarea
                        value={product.problem_description}
                        onChange={(e) => handleProductChange(index, 'problem_description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm hover:border-indigo-300"
                        placeholder="Describe the issue..."
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Accessories Given
                      </label>
                      <input
                        type="text"
                        value={product.accessories_given}
                        onChange={(e) => handleProductChange(index, 'accessories_given', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-300"
                        placeholder="e.g., Charger, Box, Earphones"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.products && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.products}</span>
                </p>
              )}

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg transform hover:scale-105"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Review Details
                </h2>
                <p className="text-indigo-100 mt-1 text-sm">Please review all information before submitting</p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-500" />
                    Customer Information
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 space-y-3 border-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="font-bold text-gray-900">{formData.customer_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Contact:</span>
                      <span className="font-bold text-gray-900">{formData.customer_contact}</span>
                    </div>
                    {formData.customer_email && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Email:</span>
                        <span className="font-semibold text-gray-900">{formData.customer_email}</span>
                      </div>
                    )}
                    {formData.customer_address && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Address:</span>
                        <span className="font-semibold text-gray-900 text-right max-w-xs">{formData.customer_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-indigo-500" />
                    Products ({formData.products.length})
                  </h3>
                  <div className="space-y-3">
                    {formData.products.map((product, index) => (
                      <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200">
                        <div className="font-bold text-gray-900 mb-2 flex items-center">
                          <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          {product.product_name}
                        </div>
                        {product.problem_description && (
                          <div className="text-sm text-gray-700 mb-2 ml-8">
                            <span className="font-semibold">Problem:</span> {product.problem_description}
                          </div>
                        )}
                        {product.accessories_given && (
                          <div className="text-sm text-gray-700 ml-8">
                            <span className="font-semibold">Accessories:</span> {product.accessories_given}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Additional Notes (Optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm hover:border-indigo-300"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm transform hover:scale-105 disabled:transform-none"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Create Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info Card */}
        {currentStep > 0 && currentStep < 4 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900">Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
                  Your progress is automatically saved and will be restored if you navigate away.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};


export const InquiryList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInquiryId, setDeleteInquiryId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignInquiryId, setAssignInquiryId] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusInquiryId, setStatusInquiryId] = useState(null);
  const [statusAction, setStatusAction] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  
  // NEW: State for update technician modal
  const [showUpdateTechnicianModal, setShowUpdateTechnicianModal] = useState(false);
  const [updateTechnicianInquiryId, setUpdateTechnicianInquiryId] = useState(null);
  const [updateSelectedTechnician, setUpdateSelectedTechnician] = useState('');
  
  const ITEMS_PER_PAGE = 20;

  const { saveScroll, restoreScroll, clearScroll } = useScrollPosition(
    'inquiryList',
    false // Don't auto-restore on mount
  );

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && inquiries.length > 0) {
      restoreScroll(300);
    }
  }, [loading, inquiries.length, restoreScroll]);

  useEffect(() => {
    fetchInquiries();
    fetchTechnicians();
  }, []);

  useEffect(() => {
    filterInquiries();
    // Don't reset page if we're coming back from navigation
    if (!searchParams.get('page')) {
      setCurrentPage(1);
    }
  }, [searchTerm, inquiries]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, currentPage]);

  const fetchInquiries = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(ENDPOINTS.INQUIRY.INQUIRY_LIST);
      const inquiryData = response.data.inquiries || []; 
      setInquiries(inquiryData);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || '';
      
      if (errorMessage.toLowerCase().includes('no inquiries found') || 
          err.response?.status === 404) {
        setInquiries([]);
        setError(null);
      } else {
        setError(errorMessage || 'Failed to fetch inquiries');
        console.error('Inquiry fetch error:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TECHNICIAN.TECHNICIAN_LIST);
      setTechnicians(response.data.technicians || []);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const filterInquiries = () => {
    if (!searchTerm.trim()) {
      setFilteredInquiries(inquiries);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = inquiries.filter(inquiry =>
      inquiry.inquiry_no.toLowerCase().includes(term) ||
      inquiry.customer_name.toLowerCase().includes(term) ||
      inquiry.status.toLowerCase().includes(term) ||
      (inquiry.technician_name && inquiry.technician_name.toLowerCase().includes(term))
    );
    setFilteredInquiries(filtered);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleDeleteClick = (inquiryId) => {
    setDeleteInquiryId(inquiryId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`${ENDPOINTS.INQUIRY.INQUIRY_LIST}/delete-inquiry/${deleteInquiryId}`);
      showNotification('success', 'Inquiry deleted successfully');
      fetchInquiries();
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to delete inquiry');
    } finally {
      setShowDeleteModal(false);
      setDeleteInquiryId(null);
    }
  };

  const handleAssignClick = (inquiryId) => {
    setAssignInquiryId(inquiryId);
    setSelectedTechnician('');
    setShowAssignModal(true);
  };

  const handleAssignConfirm = async () => {
    if (!selectedTechnician) {
      showNotification('error', 'Please select a technician');
      return;
    }

    try {
      await axiosInstance.post(
        `${ENDPOINTS.INQUIRY_STATUS.ASSIGN_TECHNICIAN}/${assignInquiryId}/assign`,
        { technician_id: selectedTechnician }
      );
      showNotification('success', 'Technician assigned successfully');
      fetchInquiries();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to assign technician');
    } finally {
      setShowAssignModal(false);
      setAssignInquiryId(null);
      setSelectedTechnician('');
    }
  };

  // NEW: Handle Update Technician Click
  const handleUpdateTechnicianClick = (inquiryId, currentTechnicianId) => {
    setUpdateTechnicianInquiryId(inquiryId);
    setUpdateSelectedTechnician(currentTechnicianId || '');
    setShowUpdateTechnicianModal(true);
  };

  // NEW: Handle Update Technician Confirm
  const handleUpdateTechnicianConfirm = async () => {
    if (!updateSelectedTechnician) {
      showNotification('error', 'Please select a technician');
      return;
    }

    try {
      await axiosInstance.patch(
        `${ENDPOINTS.INQUIRY_STATUS.UPDATE_TECHNICIAN}/${updateTechnicianInquiryId}/update-technician`,
        { technician_id: updateSelectedTechnician }
      );
      showNotification('success', 'Technician updated successfully');
      setShowUpdateTechnicianModal(false);
      setUpdateTechnicianInquiryId(null);
      setUpdateSelectedTechnician('');
      fetchInquiries();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update technician');
      // Keep modal open on error so user can try again
    }
  };

  const handleStatusClick = (inquiryId, action) => {
    setStatusInquiryId(inquiryId);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    try {
      const endpoint = statusAction === 'done' 
        ? `${ENDPOINTS.INQUIRY_STATUS.MARK_DONE}/${statusInquiryId}/status-done`
        : `${ENDPOINTS.INQUIRY_STATUS.MARK_CANCEL}/${statusInquiryId}/status-cancelled`;
      
      await axiosInstance.patch(endpoint);
      showNotification('success', `Inquiry marked as ${statusAction === 'done' ? 'Done' : 'Cancelled'} successfully`);
      fetchInquiries();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setShowStatusModal(false);
      setStatusInquiryId(null);
      setStatusAction('');
    }
  };

  const handlePrintClick = (inquiryId) => {
    setSelectedInquiryId(inquiryId);
    setShowReceiptModal(true);
  };

  const handleCloseReceipt = () => {
    setShowReceiptModal(false);
    setSelectedInquiryId(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'technician assigned': { bg: 'bg-blue-100', text: 'text-blue-800', icon: UserPlus },
      'done': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInquiries = filteredInquiries.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    clearScroll(); // Clear saved scroll position
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    fetchInquiries(true);
  };

  // Navigation handlers with scroll position saving
  const handleViewDetails = (inquiryId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/inquiries/detail/${inquiryId}`);
  };

  const handleEditInquiry = (inquiryId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/inquiries/edit/${inquiryId}`);
  };

  const handleCreateQuotation = (inquiryId) => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/quotations/create?inquiry_id=${inquiryId}`);
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading inquiries...</p>
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
                <ClipboardList className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inquiry List</h1>
                <p className="text-sm text-gray-600">
                  Total {filteredInquiries.length} inquir{filteredInquiries.length !== 1 ? 'ies' : 'y'}
                  {filteredInquiries.length > 0 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh inquiry list"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <ExportButton
                endpoint={ENDPOINTS.INQUIRY.EXPORT_INQUIRY}
                axiosInstance={axiosInstance}
                defaultFilters={{ q: '', from_date: '', to_date: '' }}
                buttonText="Export"
                modalTitle="Export Inquiries"
                fileNamePrefix="Inquiry List"
                filterFields={[
                  {
                    name: 'q',
                    label: 'Search',
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
              />

              <button
                onClick={() => navigate('/repairs/inquiry/add')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Add Inquiry</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.show && (
          <div className={`mb-6 rounded-xl border-2 p-4 flex items-start space-x-3 shadow-lg ${
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

        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing inquiry list...</span>
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
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by inquiry no, customer name, status, or technician..."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {currentInquiries.length > 0 ? (
            <>
              {/* Scrollable Table Container */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Inquiry No.</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Technician</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentInquiries.map((inquiry) => (
                        <tr key={inquiry.inquiry_id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{inquiry.inquiry_no}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{inquiry.customer_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 text-sm text-gray-900">
                              <Wrench className="h-4 w-4 text-gray-400" />
                              <span>{inquiry.technician_name || 'Not Assigned'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(inquiry.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(inquiry.created_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-2">
                              {/* View Details Button */}
                              <button
                                onClick={() => handleViewDetails(inquiry.inquiry_id)}
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-xs font-medium"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {/* Print/Download Receipt Button */}
                              <button
                                onClick={() => handlePrintClick(inquiry.inquiry_id)}
                                className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-xs font-medium"
                                title="Print/Download Receipt"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                              
                              {/* Conditional buttons based on status */}
                              {inquiry.status.toLowerCase() !== 'cancelled' && inquiry.status.toLowerCase() !== 'done' && (
                                <>
                                  <button
                                    onClick={() => handleEditInquiry(inquiry.inquiry_id)}
                                    className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition text-xs font-medium"
                                    title="Edit inquiry"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>

                                  {inquiry.status.toLowerCase() === 'pending' && (
                                    <button
                                      onClick={() => handleAssignClick(inquiry.inquiry_id)}
                                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-medium"
                                      title="Assign technician"
                                    >
                                      <UserPlus className="h-3.5 w-3.5" />
                                    </button>
                                  )}

                                  {/* NEW: Update Technician Button - Only show when status is "Technician Assigned" */}
                                  {inquiry.status.toLowerCase() === 'technician assigned' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateTechnicianClick(inquiry.inquiry_id, inquiry.technician_id)}
                                        className="inline-flex items-center px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition text-xs font-medium"
                                        title="Update technician"
                                      >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                      </button>

                                      <button
                                        onClick={() => handleStatusClick(inquiry.inquiry_id, 'done')}
                                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-xs font-medium"
                                        title="Mark as done"
                                      >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}

                                  <button
                                    onClick={() => handleStatusClick(inquiry.inquiry_id, 'cancel')}
                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium"
                                    title="Cancel inquiry"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}

                              {inquiry.status.toLowerCase() === 'done' && !inquiry.has_quotation && (
                                <button
                                  onClick={() => handleCreateQuotation(inquiry.inquiry_id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-xs font-medium"
                                  title="Create quotation"
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  <span>Quotation</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteClick(inquiry.inquiry_id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium"
                                title="Delete inquiry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredInquiries.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                showInfo={true}
                itemLabel="inquiries"
              />
            </>
          ) : (
            <div className="text-center py-16">
              <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No inquiries found' : 'No inquiries yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first inquiry'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/repairs/inquiry/add')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  <FileText className="h-5 w-5" />
                  <span>Add First Inquiry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Inquiry</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Assign Technician</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Technician
              </label>
              <SearchableDropdown
                options={technicians}
                value={selectedTechnician}
                onChange={setSelectedTechnician}
                placeholder="Choose a technician..."
                displayKey="technician_name"
                valueKey="technician_id"
                searchKeys={["technician_name", "technician_phone"]}
                subtitleKey="technician_phone"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignConfirm}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Update Technician Modal */}
      {showUpdateTechnicianModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Update Technician</h3>
            </div>
            
            {/* Error message inside modal */}
            {notification.show && notification.type === 'error' && (
              <div className="mb-4 rounded-lg border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 p-3 flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800">{notification.message}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Technician
              </label>
               <SearchableDropdown
                options={technicians}
                value={updateSelectedTechnician}
                onChange={setUpdateSelectedTechnician}
                placeholder="Choose a technician..."
                displayKey="technician_name"
                valueKey="technician_id"
                searchKeys={["technician_name", "technician_phone"]}
                subtitleKey="technician_phone"
               />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpdateTechnicianModal(false);
                  setUpdateTechnicianInquiryId(null);
                  setUpdateSelectedTechnician('');
                  // Clear any error notifications when closing
                  if (notification.show && notification.type === 'error') {
                    setNotification({ show: false, type: '', message: '' });
                  }
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTechnicianConfirm}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                statusAction === 'done' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {statusAction === 'done' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {statusAction === 'done' ? 'Mark as Done' : 'Cancel Inquiry'}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {statusAction === 'done'
                ? 'Mark this inquiry as completed? You can create a quotation after this.'
                : 'Are you sure you want to cancel this inquiry?'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium ${
                  statusAction === 'done'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedInquiryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="w-full min-h-screen">
            <InquiryReceipt 
              inquiryId={selectedInquiryId} 
              onClose={handleCloseReceipt}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const InquiryDetail = () => {
  const navigate = useNavigate();
  const { inquiry_id } = useParams();
  
  const [inquiryData, setInquiryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================
  // SCROLL POSITION MANAGEMENT WITH HOOK
  // ============================================
  
  const { saveScroll, restoreScroll, clearScroll } = useScrollPosition(
    'inquiryDetail',
    false // Don't auto-restore on mount
  );

  // Restore scroll position after data loads
  useEffect(() => {
    if (!loading && inquiryData) {
      restoreScroll(300);
    }
  }, [loading, inquiryData, restoreScroll]);

  useEffect(() => {
    fetchInquiryDetail();
  }, [inquiry_id]);

  const fetchInquiryDetail = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.INQUIRY.GET_INQUIRY_DETAIL}/${inquiry_id}`
      );
      
      setInquiryData(response.data.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to fetch inquiry details';
      setError(errorMessage);
      console.error('Inquiry detail fetch error:', err);
      console.error('Error details:', err.response);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    saveScroll(); // Save current scroll before navigation
    navigate(`/inquiries/edit/${inquiry_id}`);
  };

  const handleBackToList = () => {
    clearScroll(); // Clear saved scroll position
    navigate('/repair/inquiry');
  };

  const handlePrintReceipt = () => {
    window.open(`/inquiries/receipt/${inquiry_id}`, '_blank');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: Clock,
        border: 'border-yellow-300'
      },
      'technician assigned': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: UserPlus,
        border: 'border-blue-300'
      },
      'done': { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: CheckCircle,
        border: 'border-green-300'
      },
      'cancelled': { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XCircle,
        border: 'border-red-300'
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="h-4 w-4 mr-2" />
        {status}
      </span>
    );
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (loading && !inquiryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading inquiry details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Inquiry</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToList}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Inquiry List
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <button
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back to list"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {inquiryData?.inquiry_no}
                </h1>
                <p className="text-sm text-gray-600">Inquiry Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchInquiryDetail(true)}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              {inquiryData?.status?.toLowerCase() !== 'cancelled' && 
               inquiryData?.status?.toLowerCase() !== 'done' && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing inquiry details...</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Status & Date Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Inquiry Status</h2>
              {getStatusBadge(inquiryData?.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created Date</p>
                  <p className="text-base text-gray-900">
                    {formatDate(inquiryData?.created_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created Time</p>
                  <p className="text-base text-gray-900">
                    {formatTime(inquiryData?.created_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base text-gray-900">
                    {inquiryData?.customer_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-base text-gray-900">
                    {inquiryData?.customer_contact}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">
                    {inquiryData?.customer_email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base text-gray-900">
                    {inquiryData?.customer_address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-indigo-600" />
              Technician Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Technician Name</p>
                  <p className="text-base text-gray-900">
                    {inquiryData?.technician_name || 'Not Assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">
                    {inquiryData?.technician_phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Information - TABLE FORMAT */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-indigo-600" />
              Products ({inquiryData?.products?.length || 0})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                      Sr. No.
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                      Problem Description
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                      Accessories Given
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inquiryData?.products?.length > 0 ? (
                    inquiryData.products.map((product, index) => (
                      <tr key={product.item_id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className=" text-black  w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {product.product_name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.problem_description || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.accessories_given || 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quotation Information (if exists) */}
          {inquiryData?.quotation && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                Quotation Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quotation Number</p>
                    <p className="text-base text-gray-900 font-semibold">
                      {inquiryData.quotation.quotation_no}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-base text-gray-900 font-semibold">
                      ₹{inquiryData.quotation.total_amount}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quotation Date</p>
                    <p className="text-base text-gray-900">
                      {formatDate(inquiryData.quotation.quotation_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-base text-gray-900">
                      {inquiryData.quotation.status}
                    </p>
                  </div>
                </div>
              </div>
              
              {inquiryData.quotation.items?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Quotation Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Product</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Qty</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Unit Price</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inquiryData.quotation.items.map((item) => (
                          <tr key={item.item_id}>
                            <td className="px-4 py-2 text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-2 text-gray-600">{item.product_description}</td>
                            <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-right text-gray-900">₹{item.unit_price}</td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900">₹{item.total_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Repair Information (if exists) */}
          {inquiryData?.repair && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-indigo-600" />
                Repair Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Repair Number</p>
                    <p className="text-base text-gray-900 font-semibold">
                      {inquiryData.repair.repair_no}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-base text-gray-900">
                      {inquiryData.repair.repair_status}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Repair Date</p>
                    <p className="text-base text-gray-900">
                      {formatDate(inquiryData.repair.repair_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Repair Time</p>
                    <p className="text-base text-gray-900">
                      {formatTime(inquiryData.repair.repair_time)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {inquiryData?.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Additional Notes
              </h2>
              <p className="text-base text-gray-900 whitespace-pre-wrap">
                {inquiryData.notes}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export const EditInquiry = () => {
  const navigate = useNavigate();
  const { inquiry_id } = useParams();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: '',
    notes: '',
    products: []
  });

  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState('');

  const [deletedItemIds, setDeletedItemIds, clearDeletedItems] = useSessionStorage(
    `editInquiry_deletedItems_${inquiry_id}`,
    []
  );

  const [savedFormData, setSavedFormData, clearSavedFormData] = useSessionStorage(
    `editInquiry_form_${inquiry_id}`,
    null
  );

  const { saveScroll, restoreScroll, clearScroll } = useScrollPosition(
    `editInquiry_${inquiry_id}`,
    {
      restoreOnMount: true,
      contentReady: !loading,
      restoreDelay: 100
    }
  );

  // FIXED: Save form data to session storage on change
  useEffect(() => {
    if (!originalData) return;

    const isDifferent = hasChanges();

    if (isDifferent) {
      setSavedFormData(formData);
    } else {
      clearSavedFormData();
    }
  }, [formData, deletedItemIds, originalData]);

  useEffect(() => {
    fetchInquiryDetail();
  }, [inquiry_id]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${ENDPOINTS.INQUIRY.GET_INQUIRY_DETAIL}/${inquiry_id}`
      );
      
      const inquiry = response.data.data;
      
      const inquiryData = {
        customer_id: inquiry.customer_id,
        customer_name: inquiry.customer_name,
        customer_contact: inquiry.customer_contact,
        customer_email: inquiry.customer_email === 'NA' ? '' : inquiry.customer_email,
        customer_address: inquiry.customer_address === 'NA' ? '' : inquiry.customer_address,
        notes: inquiry.notes || '',
        products: inquiry.products.map(p => ({
          inquiry_item_id: p.item_id,
          product_name: p.product_name,
          problem_description: p.problem_description === 'NA' ? '' : p.problem_description,
          accessories_given: p.accessories_given === 'NA' ? '' : p.accessories_given
        }))
      };
      
      setOriginalData(inquiryData);
      
      // FIXED: Simplified validation for saved data
      if (savedFormData && 
          typeof savedFormData === 'object' && 
          savedFormData.customer_id) {
        console.log('Restoring saved form data:', savedFormData);
        setFormData(savedFormData);
      } else {
        setFormData(inquiryData);
      }
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch inquiry details';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
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
    
    if (formData.customer_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email must be valid';
    }
    
    if (formData.products.length === 0) {
      newErrors.products = 'At least one product is required';
    }
    
    formData.products.forEach((product, i) => {
      if (!product.product_name.trim()) {
        newErrors[`product_${i}_name`] = `Product name is required for item ${i + 1}`;
      }
    });
    
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
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
    
    if (errors[`product_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`product_${index}_${field}`]: '' }));
    }
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { product_name: '', problem_description: '', accessories_given: '' }
      ]
    }));
  };

  const removeProduct = (index) => {
    const product = formData.products[index];
    
    if (product.inquiry_item_id) {
      setDeletedItemIds(prev => [...prev, product.inquiry_item_id]);
    }
    
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const handleCheckCustomer = async () => {
    setCustomerSearchError('');

    if (!/^\d{10}$/.test(searchContact)) {
      setCustomerSearchError('Contact number must be 10 digits');
      return;
    }

    if (searchContact === formData.customer_contact) {
      setCustomerSearchError('This is the current customer');
      return;
    }

    setCheckingCustomer(true);
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER.CHECK_BY_CONTACT,
        { customer_contact: searchContact }
      );
      
      if (response.data.exists) {
        const customer = response.data.customer;
        setFormData(prev => ({
          ...prev,
          customer_id: customer.customer_id,
          customer_name: customer.customer_name,
          customer_contact: customer.customer_contact,
          customer_email: customer.customer_email === 'NA' ? '' : customer.customer_email,
          customer_address: customer.customer_address === 'NA' ? '' : customer.customer_address
        }));
        setShowCustomerModal(false);
        setSearchContact('');
        setCustomerSearchError('');
        showNotification('success', 'Customer updated successfully');
      } else {
        setCustomerSearchError('Customer not found with this contact number');
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      setCustomerSearchError(error.response?.data?.message || 'Failed to check customer');
    } finally {
      setCheckingCustomer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Please fix all validation errors');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        notes: formData.notes,
        items: formData.products.map(p => ({
          inquiry_item_id: p.inquiry_item_id,
          product_name: p.product_name,
          problem_description: p.problem_description || 'NA',
          accessories_given: p.accessories_given || 'NA'
        })),
        deleted_item_ids: deletedItemIds
      };

      if (originalData && formData.customer_id !== originalData.customer_id) {
        updateData.customer_id = formData.customer_id;
      }

      const response = await axiosInstance.put(
        `${ENDPOINTS.INQUIRY.UPDATE_INQUIRY}/${inquiry_id}`,
        updateData
      );
      
      showNotification('success', response.data.message || 'Inquiry updated successfully');
      
      clearSavedFormData();
      clearDeletedItems();
      clearScroll();
      
      setTimeout(() => {
        navigate(`/inquiries/detail/${inquiry_id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating inquiry:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update inquiry. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setDeletedItemIds([]);
      setErrors({});
      clearSavedFormData();
      clearDeletedItems();
      showNotification('success', 'Form reset to original values');
    }
  };

  const handleCancel = () => {
    clearSavedFormData();
    clearDeletedItems();
    clearScroll();
    navigate(`/repair/inquiry`);
  };

  // FIXED: Improved hasChanges function with detailed comparison
  const hasChanges = () => {
    if (!originalData) return false;
    
    // Check deleted items
    if (deletedItemIds.length > 0) return true;
    
    // Check customer info
    if (formData.customer_id !== originalData.customer_id ||
        formData.customer_name !== originalData.customer_name ||
        formData.customer_contact !== originalData.customer_contact ||
        formData.customer_email !== originalData.customer_email ||
        formData.customer_address !== originalData.customer_address ||
        formData.notes !== originalData.notes) {
      return true;
    }
    
    // Check products length
    if (formData.products.length !== originalData.products.length) {
      return true;
    }
    
    // FIXED: Better product comparison using ID or index matching
    for (let i = 0; i < formData.products.length; i++) {
      const currentProduct = formData.products[i];
      
      // Find matching original product by inquiry_item_id if it exists
      let originalProduct;
      if (currentProduct.inquiry_item_id) {
        originalProduct = originalData.products.find(
          p => p.inquiry_item_id === currentProduct.inquiry_item_id
        );
      } else {
        // For new products without ID, compare by index
        originalProduct = originalData.products[i];
      }
      
      if (!originalProduct) return true;
      
      // Compare all product fields
      if (currentProduct.product_name !== originalProduct.product_name ||
          currentProduct.problem_description !== originalProduct.problem_description ||
          currentProduct.accessories_given !== originalProduct.accessories_given) {
        return true;
      }
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading inquiry details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header - keeping same as original */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Edit2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Edit Inquiry
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Update inquiry details
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification.show && (
          <div className={`mb-6 rounded-xl border-2 p-4 flex items-start space-x-3 shadow-lg ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm">Current customer details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  Change Customer
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>Customer Name</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-700"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="h-4 w-4 text-indigo-500" />
                    <span>Contact Number</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer_contact}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-700"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer_email || 'N/A'}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-700"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>Address</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address || 'N/A'}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Product Details ({formData.products.length})
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm">Update product information</p>
                </div>
                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              {formData.products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products added yet. Click "Add Product" to start.
                </div>
              ) : (
                formData.products.map((product, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-6 relative bg-gradient-to-br from-gray-50 to-white hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center">
                        <Package className="h-4 w-4 mr-2 text-indigo-500" />
                        Product {index + 1}
                        {product.inquiry_item_id && (
                          <span className="ml-2 text-xs text-gray-500">(ID: {product.inquiry_item_id})</span>
                        )}
                      </h3>
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={product.product_name}
                          onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                            errors[`product_${index}_name`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="e.g., iPhone 12, Samsung TV"
                        />
                        {errors[`product_${index}_name`] && (
                          <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors[`product_${index}_name`]}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Problem Description
                        </label>
                        <textarea
                          value={product.problem_description}
                          onChange={(e) => handleProductChange(index, 'problem_description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                          placeholder="Describe the issue..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Accessories Given
                        </label>
                        <input
                          type="text"
                          value={product.accessories_given}
                          onChange={(e) => handleProductChange(index, 'accessories_given', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          placeholder="e.g., Charger, Box, Earphones"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {errors.products && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.products}</span>
                </p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold">Additional Notes</h2>
            </div>
            <div className="p-8">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || !hasChanges()}
              title="Reset to original values"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium shadow-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasChanges()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
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

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">Information</h3>
              <p className="text-sm text-blue-800 mt-1">
                 <span className="font-semibold">Change Customer</span> button to select a different customer.
                Use the <span className="font-semibold">Reset</span> button to discard changes and restore original values.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Customer Search Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Change Customer</h3>
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  setSearchContact('');
                  setCustomerSearchError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Enter the contact number of the customer you want to assign to this inquiry
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={searchContact}
                  onChange={(e) => {
                    setSearchContact(e.target.value);
                    setCustomerSearchError('');
                  }}
                  maxLength={10}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition ${
                    customerSearchError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
                  }`}
                  placeholder="10 digit phone number"
                />
                {customerSearchError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{customerSearchError}</span>
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSearchContact('');
                    setCustomerSearchError('');
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCheckCustomer}
                  disabled={checkingCustomer || searchContact.length !== 10}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingCustomer ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Checking...</span>
                    </span>
                  ) : (
                    'Search Customer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const InquiryReceipt = ({ inquiryId, onClose }) => {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceiptData();
  }, [inquiryId]);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${ENDPOINTS.INQUIRY.GET_INQUIRY_RECEIPT}/${inquiryId}`);
      setReceiptData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load receipt data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!receiptData) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Buttons - Hidden when printing */}
      <div className="max-w-4xl mx-auto  print:hidden sticky top-0  z-10 shadow-sm">
        <div className="flex gap-2 bg-white rounded-lg p-3 shadow">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print Receipt</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button
            onClick={onClose}
            className="ml-auto flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <X size={18} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Receipt Content - Optimized for A4 printing */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none mb-4 print:max-w-full m-2">
        <div className="p-8 print:p-[15mm]">
          {/* Header with Logo */}
          <div className="border-b-4 border-blue-600 pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              {receiptData.business?.logo_url && (
                <img 
                  src={receiptData.business.logo_url} 
                  alt="Business Logo" 
                  className="h-25 object-contain"
                />
              )}
              <div className="text-right flex-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  {receiptData.business?.business_name || 'Your Business Name'}
                </h2>
                {receiptData.business?.business_address && (
                  <p className="text-base text-gray-600">{receiptData.business.business_address}</p>
                )}
                {receiptData.business?.business_phone && (
                  <p className="text-base text-gray-600">Ph: {receiptData.business.business_phone}</p>
                )}
                {receiptData.business?.business_email && (
                  <p className="text-base text-gray-600">{receiptData.business.business_email}</p>
                )}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-800 uppercase">
              Inquiry Receipt
            </h1>
            <p className="text-center text-base text-gray-600 mt-2">
              Product Acceptance Acknowledgment
            </p>
          </div>

          {/* Inquiry Details Row */}
          <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inquiry Number</p>
              <p className="text-2xl font-bold text-blue-600">
                {receiptData.inquiry_no}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Date & Time</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(receiptData.inquiry_date)}
              </p>
              <p className="text-base text-gray-600">
                {formatTime(receiptData.inquiry_time)}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-base text-gray-800">
                  {receiptData.customer?.customer_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact</p>
                <p className="font-semibold text-base text-gray-800">
                  {receiptData.customer?.customer_contact}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-base text-gray-800">
                  {receiptData.customer?.customer_email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-semibold text-base text-gray-800">
                  {receiptData.customer?.customer_address || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Products Received
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-base w-16">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-base">
                      Product Name
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-base">
                      Problem Description
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-base">
                      Accessories Given
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.products?.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center text-base">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-base font-medium">
                        {product.product_name}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-base">
                        {product.problem_description || 'NA'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-base">
                        {product.accessories_given || 'NA'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Conditions */}
          {receiptData.terms && receiptData.terms.length > 0 && (
            <div className="border-t border-gray-300 pt-4 mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                Terms & Conditions:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                {receiptData.terms.map((term, index) => (
                  <li key={index}>• {term}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Signatures */}
          <div className="flex justify-between items-end pt-8 border-t-2 border-gray-300 mt-8">
            <div className="w-48">
              <p className="text-xs text-gray-600 mb-12">Customer Signature</p>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-xs text-gray-500">Date: _______________</p>
              </div>
            </div>
            <div className="w-48 text-right">
              <p className="text-xs text-gray-600 mb-12">Authorized Signature</p>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-xs text-gray-500">Service Center Stamp</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 italic">
              This is a computer-generated receipt and serves as proof of product acceptance.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For queries, please contact us with your inquiry number.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            box-sizing: border-box;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-\\[15mm\\] {
            padding: 0 !important;
          }
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          .bg-gray-100 {
            background: white !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          /* Ensure colors print correctly */
          .bg-gray-50, .bg-blue-600, .text-blue-600 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
