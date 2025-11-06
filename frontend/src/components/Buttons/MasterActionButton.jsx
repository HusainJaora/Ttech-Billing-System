import React, { useState } from 'react';
import { Edit2, Eye, Trash2, X, AlertTriangle } from 'lucide-react';


export const MasterActions = ({
  onEdit,
  onView,
  onDelete,
  itemName = 'this item',
  showEdit = true,
  showView = true,
  showDelete = true,
  size = 'md',
  disabled = false
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await onDelete();
      setShowDeleteModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to delete. Please try again.';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setDeleteError('');
    }
  };

  // Size configurations
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5',
      icon: 'h-3.5 w-3.5'
    },
    md: {
      button: 'px-4 py-2',
      icon: 'h-4 w-4'
    },
    lg: {
      button: 'px-5 py-2.5',
      icon: 'h-5 w-5'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <>
      <div className="flex items-center justify-center space-x-2">
        {showEdit && onEdit && (
          <button
            onClick={onEdit}
            className={`inline-flex items-center space-x-2 ${currentSize.button} bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Edit"
            disabled={disabled || isDeleting}
          >
            <Edit2 className={currentSize.icon} />
          </button>
        )}

        {showView && onView && (
          <button
            onClick={onView}
            className={`inline-flex items-center space-x-2 ${currentSize.button} bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            title="View details"
            disabled={disabled || isDeleting}
          >
            <Eye className={currentSize.icon} />
          </button>
        )}

        {showDelete && onDelete && (
          <button
            onClick={handleDeleteClick}
            className={`inline-flex items-center space-x-2 ${currentSize.button} bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Delete"
            disabled={disabled || isDeleting}
          >
            <Trash2 className={currentSize.icon} />
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                  Are you sure you want to delete <span className="font-bold text-gray-900 break-all overflow-wrap-anywhere">"{itemName}"</span>?
                </p>
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