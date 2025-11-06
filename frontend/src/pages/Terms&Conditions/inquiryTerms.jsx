import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
import { 
  FileText, AlertCircle, CheckCircle, Plus, Edit2, Trash2, 
  Save, X, Sparkles, List, Clock, Calendar, AlertTriangle 
} from 'lucide-react';

// Inquiry Terms & Conditions Page Component
export const InquiryTermsConditions = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Add/Edit states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTerms, setNewTerms] = useState(['']);
  const [editingTerm, setEditingTerm] = useState(null);
  const [editTermText, setEditTermText] = useState('');
  
  // Validation & Actions
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get(ENDPOINTS.INQUIRY_TERMS_CONDITIONS.GET_TERM);
      const sortedTerms = (response.data.terms || []).sort((a, b) => {
        const dateA = new Date(`${a.created_date} ${a.created_time || '00:00:00'}`);
        const dateB = new Date(`${b.created_date} ${b.created_time || '00:00:00'}`);
        return dateB - dateA;
      });
      setTerms(sortedTerms);
    } catch (err) {
      console.error('Error fetching terms:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch terms';
      if (!errorMessage.toLowerCase().includes('not found')) {
        showNotification('error', errorMessage);
      }
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleAddTermField = () => {
    if (newTerms.length < 4) {
      setNewTerms([...newTerms, '']);
    } else {
      showNotification('error', 'Maximum 4 terms can be added at once');
    }
  };

  const handleRemoveTermField = (index) => {
    const updatedTerms = newTerms.filter((_, i) => i !== index);
    setNewTerms(updatedTerms.length > 0 ? updatedTerms : ['']);
    
    // Clear error for this field
    if (errors[`term_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`term_${index}`];
        return newErrors;
      });
    }
  };

  const handleTermChange = (index, value) => {
    const updatedTerms = [...newTerms];
    updatedTerms[index] = value;
    setNewTerms(updatedTerms);
    
    if (errors[`term_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`term_${index}`];
        return newErrors;
      });
    }
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const validateAddTerms = () => {
    const newErrors = {};
    const nonEmptyTerms = newTerms.filter(term => term.trim());
    
    if (nonEmptyTerms.length === 0) {
      newErrors.general = 'At least one term is required';
    }
    
    newTerms.forEach((term, index) => {
      if (term.trim() && term.trim().length < 4) {
        newErrors[`term_${index}`] = 'Term must be at least 4 characters';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTerms = async () => {
    if (!validateAddTerms()) return;

    const validTerms = newTerms.filter(term => term.trim());
    
    if (terms.length + validTerms.length > 4) {
      showNotification('error', `You can only add ${4 - terms.length} more term(s)`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.INQUIRY_TERMS_CONDITIONS.ADD_TERM,
        { terms: validTerms }
      );
      
      showNotification('success', response.data.message || 'Terms added successfully');
      setShowAddModal(false);
      setNewTerms(['']);
      setErrors({});
      await fetchTerms();
    } catch (error) {
      console.error('Error adding terms:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add terms';
      showNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTerm = (term) => {
    setEditingTerm(term.terms_id);
    setEditTermText(term.term_text);
  };

  const handleCancelEdit = () => {
    setEditingTerm(null);
    setEditTermText('');
  };

  const handleUpdateTerm = async (termId) => {
    if (!editTermText.trim()) {
      showNotification('error', 'Term text cannot be empty');
      return;
    }

    if (editTermText.trim().length < 4) {
      showNotification('error', 'Term must be at least 4 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.put(
        `${ENDPOINTS.INQUIRY_TERMS_CONDITIONS.UPDATE_TERM}/${termId}`,
        { term_text: editTermText }
      );
      
      showNotification('success', response.data.message || 'Term updated successfully');
      setEditingTerm(null);
      setEditTermText('');
      await fetchTerms();
    } catch (error) {
      console.error('Error updating term:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update term';
      showNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (term) => {
    setTermToDelete(term);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!termToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.INQUIRY_TERMS_CONDITIONS.DELETE_TERM}/${termToDelete.terms_id}`
      );
      
      showNotification('success', response.data.message || 'Term deleted successfully');
      setShowDeleteModal(false);
      setTermToDelete(null);
      await fetchTerms();
    } catch (error) {
      console.error('Error deleting term:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete term';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setTermToDelete(null);
      setDeleteError('');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading terms & conditions...</p>
        </div>
      </div>
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                  Inquiry Terms & Conditions List
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                  Manage your inquiry terms (Max: 4 terms)
                </p>
              </div>
            </div>
            {terms.length < 4 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Add Terms</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

       

        {/* Terms List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">    
          <div className="p-6">
            {terms.length > 0 ? (
              <div className="space-y-4">
                {terms.map((term, index) => (
                  <div
                    key={term.terms_id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all bg-gradient-to-r from-gray-50 to-white"
                  >
                    {editingTerm === term.terms_id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Edit Term {index + 1}
                          </label>
                          <textarea
                            value={editTermText}
                            onChange={(e) => setEditTermText(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm"
                            placeholder="Enter term text (minimum 4 characters)"
                          />
                        </div>
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={handleCancelEdit}
                            disabled={submitting}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                          >
                            <X className="h-4 w-4 inline mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateTerm(term.terms_id)}
                            disabled={submitting}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium disabled:opacity-50 flex items-center space-x-2"
                          >
                            {submitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                Term {index + 1}
                              </span>
                            </div>
                            <p className="text-gray-800 text-base leading-relaxed">{term.term_text}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTerm(term)}
                              className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
                              title="Edit term"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(term)}
                              disabled={isDeleting}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                              title="Delete term"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-xs text-gray-500 border-t pt-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(term.created_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(term.created_time)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No terms & conditions yet</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first term</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add First Term</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Terms Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Terms & Conditions
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm">
                    You can add up to {4 - terms.length} more term(s)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTerms(['']);
                    setErrors({});
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {errors.general && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              {newTerms.map((term, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      Term {index + 1}
                      {newTerms.length > 1 && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">(Optional)</span>
                      )}
                    </label>
                    {newTerms.length > 1 && (
                      <button
                        onClick={() => handleRemoveTermField(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    rows="4"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm ${
                      errors[`term_${index}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter term text (minimum 4 characters)"
                  />
                  {errors[`term_${index}`] && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors[`term_${index}`]}</span>
                    </p>
                  )}
                </div>
              ))}

              {newTerms.length < 4 && newTerms.length < (4 - terms.length) && (
                <button
                  onClick={handleAddTermField}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-medium flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Term</span>
                </button>
              )}

              <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTerms(['']);
                    setErrors({});
                  }}
                  disabled={submitting}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTerms}
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-medium disabled:opacity-50 flex items-center space-x-2 shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding Terms...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Add Terms</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && termToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden" style={{ maxWidth: '28rem' }}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <AlertTriangle className="h-8 w-8 text-white flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold">Confirm Delete</h3>
                    <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={cancelDelete}
                  className="p-2 hover:bg-red-600 rounded-lg transition flex-shrink-0"
                  disabled={isDeleting}
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {deleteError && (
                <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800 break-words flex-1 min-w-0">{deleteError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-gray-700 break-words overflow-hidden">
                  Are you sure you want to delete this term?
                </p>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-800 break-words">{termToDelete.term_text}</p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg overflow-hidden">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold text-red-800">Warning</p>
                      <p className="text-sm text-red-700 mt-1 break-words overflow-hidden">
                        This action is permanent and cannot be reversed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={cancelDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium disabled:opacity-50 border border-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

