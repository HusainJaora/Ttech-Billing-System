import { useState, useEffect,useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import ENDPOINTS from '../api/endpoint';
import { SearchableDropdown } from '../components/Dropdown';
import {
  ArrowLeft, ArrowRight, Save, Plus, AlertCircle, X, 
  User, Phone, Mail, MapPin, Package, Sparkles, 
  CheckCircle, FileText, DollarSign
} from 'lucide-react';
import { usePersistedForm, useSessionStorage, loadFromSession   } from '../hooks/SessionStorage';

export const AddQuotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inquiryIdFromUrl = searchParams.get('inquiry_id');
  const hasInitializedStep = useRef(false);

  // Session storage keys
  const STEP_KEY = 'quotation_current_step';
  const CONTACT_KEY = 'quotation_contact_number';
  const CUSTOMER_EXISTS_KEY = 'quotation_customer_exists';
  const QUOTATION_TYPE_KEY = 'quotation_type';



  const [currentStep, setCurrentStep, clearCurrentStep] = useSessionStorage(
  STEP_KEY,
   0
);

const [contactNumber, setContactNumber, clearContactNumber] = useSessionStorage(
  CONTACT_KEY,
  ''
);

const [customerExists, setCustomerExists, clearCustomerExists] = useSessionStorage(
  CUSTOMER_EXISTS_KEY,
  false
);

const [quotationType, setQuotationType, clearQuotationType] = useSessionStorage(
  QUOTATION_TYPE_KEY,
  inquiryIdFromUrl ? 'Repair' : 'Normal'
);

  const [loading, setLoading] = useState(false);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [productCategories, setProductCategories] = useState([]);

  // Persisted form
  const {
    formData,
    handleChange: handleFormChange,
    updateFields,
    resetForm,
    clearForm
  } = usePersistedForm('add_quotation', {
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    customer_address: '',
    inquiry_id: inquiryIdFromUrl || '',
    notes: '',
    items: [{
      product_name: '',
      product_category_id: '',
      product_description: '',
      warranty: '',
      quantity: 1,
      unit_price: 0
    }]
  }, {
    clearOnSubmit: false,
    restoreOnMount: true
  });



  useEffect(() => {
  if (!hasInitializedStep.current && inquiryIdFromUrl) {
    const savedStep = loadFromSession(STEP_KEY, null);
    // Only set to step 1 if there's no saved step
    if (savedStep === null || savedStep === 0) {
      setCurrentStep(1);
    }
    hasInitializedStep.current = true;
  }
}, [inquiryIdFromUrl, setCurrentStep]);

  useEffect(() => {
    fetchProductCategories();
    if (inquiryIdFromUrl) {
      fetchInquiryDetails();
    }
  }, []);

  const fetchProductCategories = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PRODUCT_CATEGORY.PRODUCT_CATEGORY_LIST);
      setProductCategories(response.data.ProductCategory || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

 
  const fetchInquiryDetails = async () => {
  try {
    setLoading(true);
    const response = await axiosInstance.get(
      `${ENDPOINTS.INQUIRY.GET_INQUIRY_DETAIL}/${inquiryIdFromUrl}`
    );
    const inquiry = response.data.data;
    
    updateFields({
      customer_name: inquiry.customer_name,
      customer_contact: inquiry.customer_contact,
      customer_email: inquiry.customer_email === 'NA' ? '' : inquiry.customer_email,
      customer_address: inquiry.customer_address === 'NA' ? '' : inquiry.customer_address,
      inquiry_id: inquiryIdFromUrl
    });
    
    // Only set step to 1 if there's no saved step (first time loading)
    const savedStep = loadFromSession(STEP_KEY, null);
    if (savedStep === null || savedStep === 0) {
      setCurrentStep(1);
    }
  } catch (err) {
    showNotification('error', 'Failed to load inquiry details');
    navigate('/repair/inquiry');
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
        setCurrentStep(1);
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    updateFields({ items: updatedItems });
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
    }
  };

  const addItem = () => {
    updateFields({
      items: [
        ...formData.items,
        {
          product_name: '',
          product_category_id: '',
          product_description: '',
          warranty: '',
          quantity: 1,
          unit_price: 0
        }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      updateFields({ items: updatedItems });
    }
  };

  const validateCustomerStep = () => {
    if (quotationType === 'Repair' && inquiryIdFromUrl) {
      return true;
    }

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

  const validateItemsStep = () => {
    const newErrors = {};
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    formData.items.forEach((item, i) => {
      if (!item.product_name.trim()) {
        newErrors[`item_${i}_product_name`] = `Product name is required`;
      }
      if (!item.product_category_id) {
        newErrors[`item_${i}_product_category_id`] = `Category is required`;
      }
      if (!item.warranty.trim()) {
        newErrors[`item_${i}_warranty`] = `Warranty is required`;
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${i}_quantity`] = `Quantity must be at least 1`;
      }
      if (!item.unit_price || item.unit_price < 0) {
        newErrors[`item_${i}_unit_price`] = `Unit price is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateCustomerStep()) {
      setCurrentStep(2);
      setErrors({});
    } else if (currentStep === 2 && validateItemsStep()) {
      setCurrentStep(3);
      setErrors({});
    }
  };

 
  const handleBack = () => {
  if (currentStep === 1 && !inquiryIdFromUrl) {
    setCurrentStep(0);
    clearContactNumber();
    clearCustomerExists();
    resetForm();
    clearCurrentStep();
  } else {
    setCurrentStep(prev => prev - 1);
  }
  setErrors({});
};
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    ).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateItemsStep()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        customer_email: formData.customer_email || 'NA',
        customer_address: formData.customer_address || 'NA',
        inquiry_id: quotationType === 'Repair' ? formData.inquiry_id : undefined
      };

      const response = await axiosInstance.post(ENDPOINTS.QUOTATION.ADD_QUOTATION, payload);
      
      setQuotationDetails(response.data);
      showNotification('success', 'Quotation created successfully!');
      setCurrentStep(4);
      
    
     setTimeout(() => {
     clearForm();
     clearCurrentStep();
     clearContactNumber();
     clearCustomerExists();
     clearQuotationType();
     }, 100);
    } catch (err) {
      console.error('Error creating quotation:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create quotation';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
  resetForm();
  setCurrentStep(inquiryIdFromUrl ? 1 : 0);
  clearContactNumber();
  setErrors({});
  setQuotationDetails(null);
  clearCustomerExists();
  clearCurrentStep();
};

  if (loading && currentStep < 4) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (currentStep === 4 && quotationDetails) {
    return (
      <>
        <header className="bg-white shadow-lg border-b border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                  Quotation Created Successfully!
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-green-500" />
                  Your quotation has been generated
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Quotation Details
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 border-2 border-gray-200">
                <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Quotation Number:</span>
                  <span className="font-bold text-xl text-indigo-600">{quotationDetails.quotation_no}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900 font-semibold">{quotationDetails.quotation_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Amount:</span>
                  <span className="text-gray-900 font-bold text-lg">₹{calculateTotal()}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg transform hover:scale-105"
                >
                  Create Another Quotation
                </button>
                <button
                  onClick={() => navigate('/quotations')}
                  className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  View All Quotations
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
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 ml-12 lg:ml-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                Create {quotationType} Quotation
              </h1>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                Generate a new quotation for customer
              </p>
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

        {/* Progress Steps */}
        {currentStep > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
                } font-semibold`}>1</div>
                <div className={`flex-1 h-2 mx-2 rounded-full ${
                  currentStep >= 2 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
                } font-semibold`}>2</div>
                <div className={`flex-1 h-2 mx-2 rounded-full ${
                  currentStep >= 3 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 3 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              } font-semibold`}>3</div>
            </div>
            <div className="flex justify-between mt-3 text-sm font-medium">
              <span className={currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500'}>Customer</span>
              <span className={currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500'}>Items</span>
              <span className={currentStep >= 3 ? 'text-indigo-600' : 'text-gray-500'}>Review</span>
              </div>
          </div>
        )}
        {/* Step 0: Contact Lookup - Only for Normal Quotation */}
        {currentStep === 0 && !inquiryIdFromUrl && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Enter Customer Contact
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">We'll check if this customer exists</p>
            </div>

            <div className="p-8">
              <div className="max-w-md mx-auto space-y-6">
                <div>
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
                    className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg text-center font-semibold ${
                      errors.contact ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="10 digit phone number"
                    autoFocus
                  />
                  {errors.contact && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                <button
                  onClick={checkCustomerExists}
                  disabled={checkingCustomer || contactNumber.length !== 10}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold shadow-lg"
                >
                  {checkingCustomer ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Checking...
                    </span>
                  ) : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Step 1: Customer Information */}
        {currentStep === 1 &&(<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">
                {quotationType === 'Repair' ? 'Customer from inquiry' : customerExists ? 'Existing customer' : 'New customer details'}
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>Customer Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    disabled={quotationType === 'Repair'}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                      quotationType === 'Repair' ? 'bg-gray-100' : errors.customer_name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {errors.customer_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.customer_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="h-4 w-4 text-indigo-500" />
                    <span>Contact Number <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="customer_contact"
                    value={formData.customer_contact}
                    onChange={handleChange}
                    disabled={quotationType === 'Repair' || customerExists}
                    className={`w-full px-4 py-3 border-2 rounded-xl ${
                      quotationType === 'Repair' || customerExists ? 'bg-gray-100' : 'focus:ring-2 focus:ring-indigo-500'
                    } ${errors.customer_contact ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="10 digit number"
                  />
                  {errors.customer_contact && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.customer_contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    disabled={quotationType === 'Repair'}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                      quotationType === 'Repair' ? 'bg-gray-100' : errors.customer_email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="customer@example.com"
                  />
                  {errors.customer_email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.customer_email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>Address</span>
                  </label>
                  <input
                    type="text"
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleChange}
                    disabled={quotationType === 'Repair'}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                      quotationType === 'Repair' ? 'bg-gray-100' : 'border-gray-200'
                    }`}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                {!inquiryIdFromUrl && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg ml-auto"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        


        {/* Step 2: Items */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Quotation Items
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm">Add products/services</p>
                </div>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-indigo-500" />
                      Item {index + 1}
                    </h3>
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                          errors[`item_${index}_product_name`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder="Product name"
                      />
                      {errors[`item_${index}_product_name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_product_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={productCategories}
                        value={item.product_category_id}
                        onChange={(val) => handleItemChange(index, 'product_category_id', val)}
                        placeholder="Select category"
                        displayKey="product_category_name"
                        valueKey="product_category_id"
                        searchKeys={["product_category_name"]}
                      />
                      {errors[`item_${index}_product_category_id`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_product_category_id`]}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={item.product_description}
                        onChange={(e) => handleItemChange(index, 'product_description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Product description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Warranty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.warranty}
                        onChange={(e) => handleItemChange(index, 'warranty', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                          errors[`item_${index}_warranty`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder="e.g., 1 Year"
                      />
                      {errors[`item_${index}_warranty`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_warranty`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                          errors[`item_${index}_quantity`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Unit Price (₹) <span className="text-red-500">*</span>
                      </label>
                      
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price === 0 ? "" : item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        placeholder="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                        errors[`item_${index}_unit_price`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                      />

                      {errors[`item_${index}_unit_price`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_unit_price`]}</p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Line Total</label>
                        <div className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl font-bold text-gray-900">
                          ₹{(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {errors.items && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.items}
                </p>
              )}

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Review Quotation
                </h2>
                <p className="text-indigo-100 mt-1 text-sm">Please review all details</p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-500" />
                    Customer Information
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 space-y-3 border-2 border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="font-bold text-gray-900">{formData.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Contact:</span>
                      <span className="font-bold text-gray-900">{formData.customer_contact}</span>
                    </div>
                    {formData.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Email:</span>
                        <span className="font-semibold text-gray-900">{formData.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-indigo-500" />
                    Items ({formData.items.length})
                  </h3>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-gray-900">{item.product_name}</div>
                          <div className="font-bold text-indigo-600">₹{(item.quantity * item.unit_price).toFixed(2)}</div>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          {item.product_description && <div>Description: {item.product_description}</div>}
                          <div>Warranty: {item.warranty} | Qty: {item.quantity} | Unit Price: ₹{item.unit_price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-1 text-green-600" />
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-green-600">₹{calculateTotal()}</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Notes (Optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold text-lg shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Quotation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
      </main>
    
    </>
  );
};

