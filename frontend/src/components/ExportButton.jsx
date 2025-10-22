import React, { useState } from 'react';
import { Download, X, Filter, CheckCircle, AlertCircle } from 'lucide-react';

export const ExportButton = ({ 
  endpoint,
  axiosInstance, 
  defaultFilters = {}, 
  buttonText = 'Export',
  buttonClassName = 'flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium',
  modalTitle = 'Export Data',
  fileNamePrefix = 'Export',
  filterFields = [],
  onExportSuccess,
  onExportError
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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
      const response = await axiosInstance.post(
        endpoint,
        filters,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowModal(false);
      setFilters(defaultFilters);

      const successMessage = `Export successful! File: ${filename}`;
      showNotification('success', successMessage);
      
      if (onExportSuccess) {
        onExportSuccess(filename);
      }
      
    } catch (error) {
      console.error('Export error:', error);

      let errorMessage = 'Failed to export. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'No data found matching your filters';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification('error', errorMessage);
      
      if (onExportError) {
        onExportError(error);
      }
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    if (!exporting) {
      setShowModal(false);
      setFilters(defaultFilters);
    }
  };

  const renderFilterField = (field) => {
    const { name, label, type, placeholder, options, gridSpan } = field;
    const spanClass = gridSpan === 2 ? 'col-span-2' : '';

    switch (type) {
      case 'text':
      case 'search':
        return (
          <div key={name} className={spanClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
              type="text"
              name={name}
              value={filters[name] || ''}
              onChange={handleFilterChange}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        );

      case 'date':
        return (
          <div key={name} className={spanClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
              type="date"
              name={name}
              value={filters[name] || ''}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        );

      case 'select':
        return (
          <div key={name} className={spanClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <select
              name={name}
              value={filters[name] || ''}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All</option>
              {options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={buttonClassName}
        title="Export to Excel"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{buttonText}</span>
      </button>

      {notification.show && (
        <div className={`fixed top-4 right-4 z-[60] max-w-md rounded-lg border-2 p-4 flex items-start space-x-3 shadow-lg ${
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
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={exporting}
                className="p-1 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {filterFields.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {filterFields.map(field => renderFilterField(field))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                    <Filter className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Apply filters to export specific data. Leave empty to export all.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-700">
                    Click export to download all data
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={exporting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
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
    </>
  );
};