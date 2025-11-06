import { useState,useRef } from 'react';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
import { Plus, Trash2, Save, ArrowRight, ArrowLeft, CheckCircle, Printer, Download, X } from 'lucide-react';


// Add Inquiry
export const Inquiry = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inquiryDetails, setInquiryDetails] = useState(null);
  const [customerExists, setCustomerExists] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  // Check if customer exists by contact number
  const checkCustomerExists = async () => {
    if (!/^[0-9]{10}$/.test(contactNumber)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setCheckingCustomer(true);
    setError('');

    try {
      // Call backend to check if customer exists
      const response = await axiosInstance.post(
        ENDPOINTS.CUSTOMER.CHECK_BY_CONTACT,
        { customer_contact: contactNumber }
      );
      
      if (response.data && response.data.exists) {
        // Customer exists - autofill their information
        setCustomerExists(true);
        setFormData(prev => ({
          ...prev,
          customer_name: response.data.customer.customer_name || '',
          customer_contact: contactNumber,
          customer_email: response.data.customer.customer_email || '',
          customer_address: response.data.customer.customer_address || ''
        }));
        setCurrentStep(2); // Skip to product details
      } else {
        // New customer - show form to add details
        setCustomerExists(false);
        setFormData(prev => ({
          ...prev,
          customer_contact: contactNumber
        }));
        setCurrentStep(1); // Go to customer details form
      }
    } catch (err) {
      console.error('Error checking customer:', err);
      // If customer doesn't exist (404) or error, treat as new customer
      setCustomerExists(false);
      setFormData(prev => ({
        ...prev,
        customer_contact: contactNumber
      }));
      setCurrentStep(1);
    } finally {
      setCheckingCustomer(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
    setError('');
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product_name: '',
          problem_description: '',
          accessories_given: ''
        }
      ]
    }));
  };

  const removeProduct = (index) => {
    if (formData.products.length > 1) {
      const updatedProducts = formData.products.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        products: updatedProducts
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.customer_name.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!formData.customer_contact.trim()) {
      setError('Customer contact is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.products.length === 0) {
      setError('At least one product is required');
      return false;
    }
    for (let i = 0; i < formData.products.length; i++) {
      if (!formData.products[i].product_name.trim()) {
        setError(`Product name is required for item ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setError('');
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      setError('');
    }
  };

  // const handleBack = () => {
  //   if (currentStep === 1) {
  //     // Go back to contact lookup
  //     setCurrentStep(0);
  //     setContactNumber('');
  //     setCustomerExists(false);
  //   } else {
  //     setCurrentStep(prev => prev - 1);
  //   }
  //   setError('');
  // };
const handleBack = () => {
    if (currentStep === 1) {
      // Go back to contact lookup
      setCurrentStep(0);
      setContactNumber('');
      setCustomerExists(false);
      // Reset form data to initial state
      setFormData({
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
      });
    } else if (currentStep === 2) {
      // When going back from product details to contact lookup
      // Reset everything to allow entering a new contact number
      setCurrentStep(0);
      setContactNumber('');
      setCustomerExists(false);
      setFormData({
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
      });
    } else {
      setCurrentStep(prev => prev - 1);
    }
    setError('');
  };
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(ENDPOINTS.INQUIRY.ADD_INQUIRY, formData);
      setInquiryDetails(response.data);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating inquiry:', err);
      setError(err.response?.data?.error || 'Failed to create inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
    });
    setCurrentStep(0);
    setContactNumber('');
    setError('');
    setSuccess(false);
    setInquiryDetails(null);
    setCustomerExists(false);
    setShowReceipt(false);
  };

  const handleViewReceipt = () => {
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  // Show receipt if requested
  if (showReceipt && inquiryDetails) {
    return <InquiryReceiptPDF inquiryData={inquiryDetails} onClose={handleCloseReceipt} />;
  }

  // Success screen with option to view receipt
  if (success && inquiryDetails) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Your inquiry has been registered in the system</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Inquiry Number:</span>
              <span className="font-bold text-blue-600">{inquiryDetails.inquiry_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Inquiry Date:</span>
              <span className="text-gray-900">{new Date(inquiryDetails.inquiry_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="text-gray-900">{inquiryDetails.customer?.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Contact:</span>
              <span className="text-gray-900">{inquiryDetails.customer?.customer_contact}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Products:</span>
              <span className="text-gray-900">{inquiryDetails.products?.length} item(s)</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleViewReceipt}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Printer className="w-5 h-5" />
              View/Print Receipt
            </button>
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Another Inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Inquiry</h1>
          <p className="text-gray-600 mt-1">Create a new repair inquiry with customer and product details</p>
        </div>

        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} font-semibold`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} font-semibold`}>
                  2
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} font-semibold`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={`${currentStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Customer Details</span>
              <span className={`${currentStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Product Details</span>
              <span className={`${currentStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Review & Submit</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {currentStep === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enter Customer Contact</h2>
                <p className="text-gray-600">We'll check if this customer already exists in our system</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      setError('');
                    }}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center"
                    placeholder="10 digit phone number"
                    autoFocus
                  />
                </div>

                <button
                  onClick={checkCustomerExists}
                  disabled={checkingCustomer || contactNumber.length !== 10}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                >
                  {checkingCustomer ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">New Customer Information</h2>
              <p className="text-sm text-gray-600 mt-1">This is a new customer. Please fill in their details.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_contact"
                  value={formData.customer_contact}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {customerExists && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ Existing customer: <span className="font-semibold">{formData.customer_name}</span>
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Product/Item Details</h2>
              <button
                onClick={addProduct}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="space-y-4">
              {formData.products.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Product {index + 1}</h3>
                    {formData.products.length > 1 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={product.product_name}
                        onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="e.g., iPhone 12, Samsung TV"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Problem Description
                      </label>
                      <textarea
                        value={product.problem_description}
                        onChange={(e) => handleProductChange(index, 'problem_description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the issue..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accessories Given
                      </label>
                      <input
                        type="text"
                        value={product.accessories_given}
                        onChange={(e) => handleProductChange(index, 'accessories_given', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Charger, Box, Earphones"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Details</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{formData.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium text-gray-900">{formData.customer_contact}</span>
                    </div>
                    {formData.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{formData.customer_email}</span>
                      </div>
                    )}
                    {formData.customer_address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-gray-900">{formData.customer_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Products ({formData.products.length})</h3>
                  <div className="space-y-3">
                    {formData.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="font-semibold text-gray-900 mb-2">{index + 1}. {product.product_name}</div>
                        {product.problem_description && (
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Problem:</span> {product.problem_description}
                          </div>
                        )}
                        {product.accessories_given && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Accessories:</span> {product.accessories_given}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Inquiry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// InquiryReceiptPDF Component
const InquiryReceiptPDF = ({ inquiryData, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (!inquiryData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Action Buttons - Hidden in print */}
      <div className="max-w-4xl mx-auto mb-4 flex gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Printer size={20} />
          Print Receipt
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Download size={20} />
          Download PDF
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            <X />
          </button>
        )}
      </div>

      {/* PDF Content - Optimized for A4 printing */}
      <div 
        ref={printRef}
        className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none"
        style={{ minHeight: '297mm' }}
      >
        <div className="p-8 print:p-12">
          {/* Header */}
          <div className="border-b-4 border-blue-600 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">
              INQUIRY RECEIPT
            </h1>
            <p className="text-center text-sm text-gray-600 mt-2">
              Product Acceptance Acknowledgment
            </p>
          </div>

          {/* Inquiry Info Row */}
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Inquiry Number</p>
              <p className="text-lg font-bold text-blue-600">
                {inquiryData.inquiry_no}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="text-lg font-semibold">
                {formatDate(inquiryData.inquiry_date || inquiryData.created_at)}
              </p>
              <p className="text-sm text-gray-500">
                {formatTime(inquiryData.inquiry_date || inquiryData.created_at)}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Name</p>
                <p className="font-semibold">
                  {inquiryData.customer?.customer_name || inquiryData.customer_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Contact</p>
                <p className="font-semibold">
                  {inquiryData.customer?.customer_contact || inquiryData.customer_contact}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-semibold text-sm">
                  {inquiryData.customer?.customer_email || inquiryData.customer_email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Address</p>
                <p className="font-semibold text-sm">
                  {inquiryData.customer?.customer_address || inquiryData.customer_address || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Products Received
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm w-12">
                    S.No
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                    Product Name
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                    Problem Description
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm">
                    Accessories Given
                  </th>
                </tr>
              </thead>
              <tbody>
                {(inquiryData.products || []).map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {product.product_name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {product.problem_description || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {product.accessories_given || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          {inquiryData.notes && inquiryData.notes !== 'NA' && inquiryData.notes.trim() !== '' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Notes:</h3>
              <p className="text-sm text-gray-700">{inquiryData.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="border-t border-gray-300 pt-4 mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Terms & Conditions:
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Please keep this receipt safe for product collection</li>
              <li>• Repairs will be completed within the estimated time frame</li>
              <li>• Additional charges may apply if extra parts are required</li>
              <li>• Products must be collected within 30 days of repair completion</li>
            </ul>
          </div>

          {/* Footer with Signature */}
          <div className="flex justify-between items-end pt-8 border-t-2 border-gray-300">
            <div>
              <p className="text-xs text-gray-600 mb-8">Customer Signature</p>
              <div className="border-t border-gray-400 w-48 pt-1">
                <p className="text-xs text-gray-500">Date: _____</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-8">Authorized Signature</p>
              <div className="border-t border-gray-400 w-48 pt-1">
                <p className="text-xs text-gray-500">Service Center Stamp</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
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
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-12 {
            padding: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};





