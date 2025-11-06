import { useState, useEffect } from 'react';
import { Building2, Mail, MapPin, Phone, Building, CreditCard, Save, X, Upload, Image, Edit, Loader } from 'lucide-react';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';

// View Profile Component
function ViewProfile({ onEdit, profile }) {
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">No profile data available</p>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
            <p className="text-sm text-gray-600 mt-1">View your business information</p>
          </div>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>

        <div className="p-6 space-y-6">
          {profile.logo_url && (
            <div className="flex justify-center pb-6 border-b border-gray-200">
              <div className="text-center">
                <img
                  src={profile.logo_url}
                  alt="Business Logo"
                  className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200 mx-auto mb-2"
                />
                <p className="text-sm text-gray-500">Business Logo</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {profile.business_name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Mail className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Business Email</p>
                  <p className="text-base font-medium text-gray-900 mt-1 break-all">
                    {profile.business_email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Phone className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {profile.mobile_number || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {profile.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(profile.bank_name || profile.account_number || profile.ifsc_code || profile.branch_name) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.bank_name && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Building className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {profile.bank_name}
                      </p>
                    </div>
                  </div>
                )}

                {profile.account_number && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {profile.account_number}
                      </p>
                    </div>
                  </div>
                )}

                {profile.ifsc_code && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Building className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">IFSC Code</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {profile.ifsc_code}
                      </p>
                    </div>
                  </div>
                )}

                {profile.branch_name && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Branch Name</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {profile.branch_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(profile.created_at || profile.updated_at) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                {profile.created_at && (
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(profile.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
                {profile.updated_at && (
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {new Date(profile.updated_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Profile Component
function EditProfile({ onCancel, onSuccess, initialData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(initialData?.logo_url || null);
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    business_name: initialData?.business_name || '',
    business_email: initialData?.business_email || '',
    address: initialData?.address || '',
    mobile_number: initialData?.mobile_number || '',
    bank_name: initialData?.bank_name || '',
    account_number: initialData?.account_number || '',
    ifsc_code: initialData?.ifsc_code || '',
    branch_name: initialData?.branch_name || ''
  });

  const handleInputChange = (e) => {
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          logo: 'Please select an image file'
        }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'Image size should be less than 5MB'
        }));
        return;
      }

      setLogoFile(file);
      setErrors(prev => ({ ...prev, logo: '' }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(initialData?.logo_url || null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }

    if (!formData.business_email.trim()) {
      newErrors.business_email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
      newErrors.business_email = 'Invalid email format';
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Mobile number must be 10 digits';
    }

    if (formData.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      newErrors.ifsc_code = 'Invalid IFSC code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setSuccessMessage('');
      
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await axiosInstance.post(
        ENDPOINTS.USER_PROFILE.ADD_PROFILE,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccessMessage(response.data.message || 'Profile saved successfully!');
      
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error saving profile:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          submit: error.response?.data?.error || 'Failed to save profile. Please try again.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData ? 'Update your business information' : 'Set up your business profile'}
          </p>
        </div>

        {successMessage && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            {errors.logo && (
              <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.business_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter business name"
                />
              </div>
              {errors.business_name && (
                <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="business_email"
                  value={formData.business_email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.business_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="business@example.com"
                />
              </div>
              {errors.business_email && (
                <p className="mt-1 text-sm text-red-600">{errors.business_email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  maxLength="10"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.mobile_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10-digit mobile number"
                />
              </div>
              {errors.mobile_number && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Business address"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter account number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleInputChange}
                  maxLength="11"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.ifsc_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., SBIN0001234"
                />
                {errors.ifsc_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.ifsc_code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Profile Page Component
export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axiosInstance.get(ENDPOINTS.USER_PROFILE.GET_PROFILE);
      
      if (response.data) {
        setProfile(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
        setIsEditing(true);
      } else {
        setError('Failed to load profile. Please try again.');
        console.error('Error fetching profile:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setIsEditing(false);
    }
  };

  const handleSuccess = () => {
    fetchProfile();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isEditing ? (
        <EditProfile 
          onCancel={profile ? handleCancel : null} 
          onSuccess={handleSuccess}
          initialData={profile}
        />
      ) : (
        <ViewProfile 
          onEdit={handleEdit} 
          profile={profile}
        />
      )}
    </div>
  );
}