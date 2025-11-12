import { useState,useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
// import { Plus, Trash2, Save, ArrowRight, ArrowLeft, CheckCircle, Printer, Download, X } from 'lucide-react';
import {
  Download,
  X,
  Printer,
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  AlertCircle, 
  Eye, 
  Edit2, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  ClipboardList,
  Calendar,
  User,
  Phone,
  Wrench
} from 'lucide-react';

import { SearchActionBar } from '../../components/SearchActionBar';
import { ExportButton } from '../../components/ExportButton';
import { Pagination } from '../../components/Pagination';





export const InquiryList = () => {
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
  
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchInquiries();
    fetchTechnicians();
  }, []);

  useEffect(() => {
    filterInquiries();
    setCurrentPage(1);
  }, [searchTerm, inquiries]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    fetchInquiries(true);
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
                     onClick={() => navigate(`/inquiries/detail/${inquiry.inquiry_id}`)}
                     className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-xsfont-medium"
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
          onClick={() => navigate(`/inquiries/edit/${inquiry.inquiry_id}`)}
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

        {inquiry.status.toLowerCase() === 'technician assigned' && (
          <button
            onClick={() => handleStatusClick(inquiry.inquiry_id, 'done')}
            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-xs font-medium"
            title="Mark as done"
          >
            <CheckCircle className="h-3.5 w-3.5" />
          </button>
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

    {inquiry.status.toLowerCase() === 'done' && (
      <button
        onClick={() => navigate(`/quotations/create?inquiry_id=${inquiry.inquiry_id}`)}
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
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose a technician...</option>
                {technicians.map((tech) => (
                  <option key={tech.technician_id} value={tech.technician_id}>
                    {tech.technician_name} - {tech.technician_phone}
                  </option>
                ))}
              </select>
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
          />             </div>
             </div>
)} 
  </>

);};

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
  if (showReceipt) {
    return (
      <InquiryReceipt 
        inquiryId={inquiryDetails.inquiry_id} 
        onClose={() => {
          setShowReceipt(false);
          handleReset();
        }}
      />
    );
  }

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
            onClick={() => setShowReceipt(true)}
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




