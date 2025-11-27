import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axiosInstance from '../api/axios';
import  ENDPOINTS  from '../api/endpoint';


export const CustomerForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  showContactLookup = false,
  isEditing = false,
  submitButtonText = 'Save Customer',
  title = 'Customer Information',
  autoFocusContact = true
}) => {
  // Form state
  const [formData, setFormData] = useState({
    customer_name: initialData.customer_name || '',
    customer_contact: initialData.customer_contact || '',
    customer_email: initialData.customer_email || '',
    customer_address: initialData.customer_address || ''
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [showForm, setShowForm] = useState(!showContactLookup || isEditing);
  const [contactNumber, setContactNumber] = useState(initialData.customer_contact || '');

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        customer_name: initialData.customer_name || '',
        customer_contact: initialData.customer_contact || '',
        customer_email: initialData.customer_email || '',
        customer_address: initialData.customer_address || ''
      });
    }
  }, [initialData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    
    if (!formData.customer_contact.trim()) {
      newErrors.customer_contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.customer_contact)) {
      newErrors.customer_contact = 'Contact number must be exactly 10 digits';
    }
    
    if (formData.customer_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        setFormData({
          customer_name: response.data.customer.customer_name || '',
          customer_contact: contactNumber,
          customer_email: response.data.customer.customer_email || '',
          customer_address: response.data.customer.customer_address || ''
        });
        setShowForm(true);
      } else {
        setCustomerExists(false);
        setFormData(prev => ({ ...prev, customer_contact: contactNumber }));
        setShowForm(true);
      }
    } catch (err) {
      console.error('Error checking customer:', err);
      setCustomerExists(false);
      setFormData(prev => ({ ...prev, customer_contact: contactNumber }));
      setShowForm(true);
    } finally {
      setCheckingCustomer(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle back button (from form to contact lookup)
  const handleBack = () => {
    setShowForm(false);
    setContactNumber('');
    setFormData({
      customer_name: '',
      customer_contact: '',
      customer_email: '',
      customer_address: ''
    });
    setErrors({});
    setCustomerExists(false);
  };

  // Render contact lookup screen
  if (showContactLookup && !showForm && !isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Enter Customer Contact
          </h2>
          <p className="text-indigo-100 mt-1 text-sm">
            We'll check if this customer already exists in our system
          </p>
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
                autoFocus={autoFocusContact}
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
                  <Loader className="animate-spin h-5 w-5" />
                  <span>Checking...</span>
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render main form
  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <User className="h-5 w-5 mr-2" />
            {title}
          </h2>
          {customerExists && (
            <p className="text-indigo-100 mt-1 text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Existing customer found
            </p>
          )}
          {!customerExists && showContactLookup && (
            <p className="text-indigo-100 mt-1 text-sm">
              New customer - please fill in their details
            </p>
          )}
        </div>

        <div className="p-8 space-y-6">
          {/* Contact Number */}
          <div className="group">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="h-4 w-4 text-indigo-500" />
              <span>Contact Number <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              name="customer_contact"
              value={formData.customer_contact}
              onChange={handleChange}
              maxLength={10}
              disabled={showContactLookup}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all shadow-sm ${
                showContactLookup
                  ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed'
                  : errors.customer_contact
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  : 'border-gray-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="10 digit phone number"
            />
            {errors.customer_contact && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.customer_contact}</span>
              </p>
            )}
          </div>

          {/* Customer Name */}
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

          {/* Email */}
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

          {/* Address */}
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
            {showContactLookup && !isEditing ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
              >
                Back
              </button>
            ) : onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
              >
                Cancel
              </button>
            ) : (
              <div></div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{submitButtonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CustomerForm;