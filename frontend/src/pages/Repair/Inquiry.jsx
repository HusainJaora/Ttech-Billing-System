import { useState } from 'react';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
import { Plus, Trash2, Save, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

// export const  Inquiry= () =>{
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [inquiryDetails, setInquiryDetails] = useState(null);

//   const [formData, setFormData] = useState({
//     customer_name: '',
//     customer_contact: '',
//     customer_email: '',
//     customer_address: '',
//     notes: '',
//     products: [
//       {
//         product_name: '',
//         problem_description: '',
//         accessories_given: ''
//       }
//     ]
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError('');
//   };

//   const handleProductChange = (index, field, value) => {
//     const updatedProducts = [...formData.products];
//     updatedProducts[index][field] = value;
//     setFormData(prev => ({
//       ...prev,
//       products: updatedProducts
//     }));
//     setError('');
//   };

//   const addProduct = () => {
//     setFormData(prev => ({
//       ...prev,
//       products: [
//         ...prev.products,
//         {
//           product_name: '',
//           problem_description: '',
//           accessories_given: ''
//         }
//       ]
//     }));
//   };

//   const removeProduct = (index) => {
//     if (formData.products.length > 1) {
//       const updatedProducts = formData.products.filter((_, i) => i !== index);
//       setFormData(prev => ({
//         ...prev,
//         products: updatedProducts
//       }));
//     }
//   };

//   const validateStep1 = () => {
//     if (!formData.customer_name.trim()) {
//       setError('Customer name is required');
//       return false;
//     }
//     if (!formData.customer_contact.trim()) {
//       setError('Customer contact is required');
//       return false;
//     }
//     if (!/^[0-9]{10}$/.test(formData.customer_contact)) {
//       setError('Phone number must be exactly 10 digits');
//       return false;
//     }
//     return true;
//   };

//   const validateStep2 = () => {
//     if (formData.products.length === 0) {
//       setError('At least one product is required');
//       return false;
//     }
//     for (let i = 0; i < formData.products.length; i++) {
//       if (!formData.products[i].product_name.trim()) {
//         setError(`Product name is required for item ${i + 1}`);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (currentStep === 1 && validateStep1()) {
//       setCurrentStep(2);
//       setError('');
//     } else if (currentStep === 2 && validateStep2()) {
//       setCurrentStep(3);
//       setError('');
//     }
//   };

//   const handleBack = () => {
//     setCurrentStep(prev => prev - 1);
//     setError('');
//   };

//   const handleSubmit = async () => {
//     if (!validateStep2()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const response = await axiosInstance.post(ENDPOINTS.INQUIRY.ADD_INQUIRY, formData);
//       setInquiryDetails(response.data);
//       setSuccess(true);
//     } catch (err) {
//       console.error('Error creating inquiry:', err);
//       setError(err.response?.data?.error || 'Failed to create inquiry');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       customer_name: '',
//       customer_contact: '',
//       customer_email: '',
//       customer_address: '',
//       notes: '',
//       products: [
//         {
//           product_name: '',
//           problem_description: '',
//           accessories_given: ''
//         }
//       ]
//     });
//     setCurrentStep(1);
//     setError('');
//     setSuccess(false);
//     setInquiryDetails(null);
//   };

//   if (success && inquiryDetails) {
//     return (
//       <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-6">
//         <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
//           <div className="text-center">
//             <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Created Successfully!</h2>
//             <p className="text-gray-600 mb-6">Your inquiry has been registered in the system</p>
//           </div>

//           <div className="bg-gray-50 rounded-lg p-6 space-y-3 mb-6">
//             <div className="flex justify-between">
//               <span className="font-medium text-gray-700">Inquiry Number:</span>
//               <span className="font-bold text-blue-600">{inquiryDetails.inquiry_no}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="font-medium text-gray-700">Customer:</span>
//               <span className="text-gray-900">{inquiryDetails.customer?.customer_name}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="font-medium text-gray-700">Contact:</span>
//               <span className="text-gray-900">{inquiryDetails.customer?.customer_contact}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="font-medium text-gray-700">Products:</span>
//               <span className="text-gray-900">{inquiryDetails.products?.length} item(s)</span>
//             </div>
//           </div>

//           <button
//             onClick={handleReset}
//             className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             Create Another Inquiry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 overflow-auto bg-gray-50">
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900">Add New Inquiry</h1>
//           <p className="text-gray-600 mt-1">Create a new repair inquiry with customer and product details</p>
//         </div>

//         {/* Progress Steps */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center flex-1">
//               <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} font-semibold`}>
//                 1
//               </div>
//               <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
//             </div>
//             <div className="flex items-center flex-1">
//               <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} font-semibold`}>
//                 2
//               </div>
//               <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
//             </div>
//             <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} font-semibold`}>
//               3
//             </div>
//           </div>
//           <div className="flex justify-between mt-2 text-sm">
//             <span className={`${currentStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Customer Details</span>
//             <span className={`${currentStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Product Details</span>
//             <span className={`${currentStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Review & Submit</span>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <span className="text-red-800">{error}</span>
//           </div>
//         )}

//         {/* Step 1: Customer Details */}
//         {currentStep === 1 && (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Customer Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="customer_name"
//                   value={formData.customer_name}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                   placeholder="Enter customer name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Contact Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="customer_contact"
//                   value={formData.customer_contact}
//                   onChange={handleInputChange}
//                   maxLength={10}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                   placeholder="10 digit phone number"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   name="customer_email"
//                   value={formData.customer_email}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                   placeholder="customer@example.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Address
//                 </label>
//                 <textarea
//                   name="customer_address"
//                   value={formData.customer_address}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                   placeholder="Enter address"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={handleNext}
//                 className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 Next: Product Details
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Product Details */}
//         {currentStep === 2 && (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-semibold text-gray-900">Product/Item Details</h2>
//               <button
//                 onClick={addProduct}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Plus className="w-4 h-4" />
//                 Add Product
//               </button>
//             </div>

//             <div className="space-y-4">
//               {formData.products.map((product, index) => (
//                 <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-semibold text-gray-900">Product {index + 1}</h3>
//                     {formData.products.length > 1 && (
//                       <button
//                         onClick={() => removeProduct(index)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>

//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Product Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={product.product_name}
//                         onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
//                         placeholder="e.g., iPhone 12, Samsung TV"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Problem Description
//                       </label>
//                       <textarea
//                         value={product.problem_description}
//                         onChange={(e) => handleProductChange(index, 'problem_description', e.target.value)}
//                         rows={2}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Describe the issue..."
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Accessories Given
//                       </label>
//                       <input
//                         type="text"
//                         value={product.accessories_given}
//                         onChange={(e) => handleProductChange(index, 'accessories_given', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="e.g., Charger, Box, Earphones"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-between mt-6">
//               <button
//                 onClick={handleBack}
//                 className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 Back
//               </button>
//               <button
//                 onClick={handleNext}
//                 className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 Next: Review
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Review & Submit */}
//         {currentStep === 3 && (
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Details</h2>
              
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3 text-lg">Customer Information</h3>
//                   <div className="bg-gray-50 rounded-lg p-4 space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Name:</span>
//                       <span className="font-medium text-gray-900">{formData.customer_name}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Contact:</span>
//                       <span className="font-medium text-gray-900">{formData.customer_contact}</span>
//                     </div>
//                     {formData.customer_email && (
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Email:</span>
//                         <span className="font-medium text-gray-900">{formData.customer_email}</span>
//                       </div>
//                     )}
//                     {formData.customer_address && (
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Address:</span>
//                         <span className="font-medium text-gray-900">{formData.customer_address}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3 text-lg">Products ({formData.products.length})</h3>
//                   <div className="space-y-3">
//                     {formData.products.map((product, index) => (
//                       <div key={index} className="bg-gray-50 rounded-lg p-4">
//                         <div className="font-semibold text-gray-900 mb-2">{index + 1}. {product.product_name}</div>
//                         {product.problem_description && (
//                           <div className="text-sm text-gray-600 mb-1">
//                             <span className="font-medium">Problem:</span> {product.problem_description}
//                           </div>
//                         )}
//                         {product.accessories_given && (
//                           <div className="text-sm text-gray-600">
//                             <span className="font-medium">Accessories:</span> {product.accessories_given}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Notes (Optional)
//                   </label>
//                   <textarea
//                     name="notes"
//                     value={formData.notes}
//                     onChange={handleInputChange}
//                     rows={4}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Any additional information..."
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-between">
//               <button
//                 onClick={handleBack}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 Back
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
//               >
//                 <Save className="w-5 h-5" />
//                 {loading ? 'Creating...' : 'Create Inquiry'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

export const Inquiry = () => {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for contact lookup
  const [loading, setLoading] = useState(false);
  const [checkingCustomer, setCheckingCustomer] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [inquiryDetails, setInquiryDetails] = useState(null);
  const [customerExists, setCustomerExists] = useState(false);
  const [contactNumber, setContactNumber] = useState('');

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

  const handleBack = () => {
    if (currentStep === 1) {
      // Go back to contact lookup
      setCurrentStep(0);
      setContactNumber('');
      setCustomerExists(false);
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
  };

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

          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Another Inquiry
          </button>
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

        {/* Progress Steps */}
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

        {/* Step 0: Contact Number Lookup */}
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

        {/* Step 1: Customer Details (Only for new customers) */}
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
                Next: Product Details
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Product Details */}
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
                Next: Review
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
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
}