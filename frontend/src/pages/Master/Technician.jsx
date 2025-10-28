import { useState, useContext, useEffect, memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import ENDPOINTS from '../../api/endpoint';
import { AuthContext } from '../../context/AuthContext';
import { Wrench, AlertCircle, CheckCircle, Phone, User, Eye, RefreshCw, Sparkles, ArrowLeft, Edit2, Save } from 'lucide-react';
import { SearchActionBar } from '../../components/SearchActionBar';
import { ExportButton } from '../../components/ExportButton';
import { Pagination } from '../../components/Pagination';
import {MasterActions} from '../../components/Buttons/MasterActionButton';

// Add Technician Component
export const Technician = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    technician_name: '',
    technician_phone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.technician_name.trim()) {
      newErrors.technician_name = 'Technician name is required';
    }

    if (!formData.technician_phone.trim()) {
      newErrors.technician_phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.technician_phone)) {
      newErrors.technician_phone = 'Phone number must be 10 digits';
    }

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
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(ENDPOINTS.TECHNICIAN.ADD_TECHNICIAN, {
        technician_name: formData.technician_name,
        technician_phone: formData.technician_phone
      });
      showNotification('success', response.data.message || 'Technician added successfully');

      setFormData({
        technician_name: '',
        technician_phone: ''
      });

    } catch (error) {
      console.error('Error creating technician:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message ||
        'Failed to create technician. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
  
      <>
        <header className="bg-white shadow-lg border-b border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-12 lg:ml-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                    Add Technician
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                    Create a new technician record
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Technician Information
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">Fill in the details below to add a new technician</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="group">
                <label htmlFor="technician_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>Technician Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  id="technician_name"
                  name="technician_name"
                  value={formData.technician_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                    errors.technician_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  placeholder="Enter technician name"
                />
                {errors.technician_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.technician_name}</span>
                  </p>
                )}
              </div>

              <div className="group">
                <label htmlFor="technician_phone" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  <span>Phone Number <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  id="technician_phone"
                  name="technician_phone"
                  value={formData.technician_phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                    errors.technician_phone ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {errors.technician_phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.technician_phone}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => setFormData({
                    technician_name: '',
                    technician_phone: ''
                  })}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
                  disabled={loading}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding Technician...</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4" />
                      <span>Add Technician</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900">Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    
  );
};  

 // Technician List Component
// export const TechnicianList = () => {
//   const navigate = useNavigate();
//   const [technicians, setTechnicians] = useState([]);
//   const [filteredTechnicians, setFilteredTechnicians] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const ITEMS_PER_PAGE = 20;

//   useEffect(() => {
//     fetchTechnicians();
//   }, []);

//   useEffect(() => {
//     filterTechnicians();
//   }, [searchTerm, technicians]);

//   const fetchTechnicians = async (isManualRefresh = false) => {
//     try {
//       if (!isManualRefresh) {
//         setLoading(true);
//       } else {
//         setIsRefreshing(true);
//       }
      
//       const response = await axiosInstance.get(ENDPOINTS.TECHNICIAN.TECHNICIAN_LIST);
//       const sortedTechnicians = (response.data.technicians || []).sort((a, b) => {
//         return b.technician_id - a.technician_id;
//       });
//       setTechnicians(sortedTechnicians);
//       setError(null);
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.response?.data?.error || '';
      
//       if (errorMessage.toLowerCase().includes('no technician found') || 
//           errorMessage.toLowerCase().includes('technician not found') ||
//           err.response?.status === 400) {
//         setTechnicians([]);
//         setError(null);
//         console.log('No technicians available');
//       } else {
//         setError(errorMessage || 'Failed to fetch technicians');
//         console.error('Technician fetch error:', err);
//       }
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   const filterTechnicians = () => {
//     if (!searchTerm.trim()) {
//       setFilteredTechnicians(technicians);
//       setCurrentPage(1);
//       return;
//     }

//     const term = searchTerm.toLowerCase().trim();
//     const filtered = technicians.filter(technician => {
//       const name = (technician.technician_name || '').toLowerCase();
//       const phone = (technician.technician_phone || '').toString();
//       return name.includes(term) || phone.includes(term);
//     });
//     setFilteredTechnicians(filtered);
//     setCurrentPage(1);
//   };

//   const totalPages = Math.ceil(filteredTechnicians.length / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const endIndex = startIndex + ITEMS_PER_PAGE;
//   const currentTechnicians = filteredTechnicians.slice(startIndex, endIndex);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleManualRefresh = () => {
//     fetchTechnicians(true);
//   };

//   const handleViewTechnician = (technicianId) => {
//     navigate(`/technicians/detail/${technicianId}`);
//   };

//   const handleEditTechnician = (technicianId) => {
//     navigate(`/master/edit-technician/${technicianId}`);
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   if (loading && technicians.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600 font-medium">Loading technicians...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
    
//       <>
//         <header className="bg-white shadow-sm border-b border-gray-200">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4 ml-12 lg:ml-0">
//                 <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
//                   <Wrench className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">Technician List</h1>
//                   <p className="text-sm text-gray-600">
//                     Total {filteredTechnicians.length} technician{filteredTechnicians.length !== 1 ? 's' : ''}
//                     {filteredTechnicians.length > 0 && ` • Page ${currentPage} of ${totalPages}`}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <button
//                   onClick={handleManualRefresh}
//                   disabled={isRefreshing}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
//                   title="Refresh technician list"
//                 >
//                   <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
//                 </button>

//                 {/* Integrated ExportButton Component */}
//                 {ENDPOINTS.TECHNICIAN?.EXPORT_TECHNICIAN && (
//                   <ExportButton
//                     endpoint={ENDPOINTS.TECHNICIAN.EXPORT_TECHNICIAN}
//                     axiosInstance={axiosInstance}
//                     defaultFilters={{ q: '', from_date: '', to_date: '' }}
//                     buttonText="Export"
//                     modalTitle="Export Technicians"
//                     fileNamePrefix="Technician_List"
//                     filterFields={[
//                       {
//                         name: 'q',
//                         label: 'Search (Name or Phone)',
//                         type: 'text',
//                         placeholder: 'Optional search term',
//                         gridSpan: 2
//                       },
//                       {
//                         name: 'from_date',
//                         label: 'From Date',
//                         type: 'date'
//                       },
//                       {
//                         name: 'to_date',
//                         label: 'To Date',
//                         type: 'date'
//                       }
//                     ]}
//                     onExportSuccess={(filename) => {
//                       console.log('Export successful:', filename);
//                     }}
//                     onExportError={(error) => {
//                       console.error('Export failed:', error);
//                     }}
//                   />
//                 )}

//                 <button
//                   onClick={() => navigate('/master/add-technician')}
//                   className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//                 >
//                   <Wrench className="h-4 w-4" />
//                   <span className="hidden sm:inline">Add Technician</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {isRefreshing && (
//             <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
//               <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
//               <span className="text-sm text-blue-700">Refreshing technician list...</span>
//             </div>
//           )}

//           {error && (
//             <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
//               <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-red-800">{error}</p>
//               </div>
//               <button
//                 onClick={handleManualRefresh}
//                 className="text-sm text-red-600 hover:text-red-800 font-medium"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//             <SearchActionBar
//               searchValue={searchTerm}
//               onSearchChange={handleSearchChange}
//               placeholder="Search by name or phone number..."
//             />
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               {currentTechnicians.length > 0 ? (
//                 <>
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b border-gray-200">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Sr. No.
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Name
//                         </th>
//                         <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {currentTechnicians.map((technician) => {
//                         const serialNumber = technicians.length - technicians.findIndex(t => t.technician_id === technician.technician_id);
//                         return (
//                           <tr
//                             key={technician.technician_id}
//                             className="hover:bg-gray-50 transition"
//                           >
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span className="text-sm font-medium text-gray-700">
//                                 {serialNumber}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex items-center space-x-3">
//                                 <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
//                                   <Wrench className="h-5 w-5 text-indigo-600" />
//                                 </div>
//                                 <div>
//                                   <p className="text-sm font-medium text-gray-900">
//                                     {technician.technician_name}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-center">
//                               <div className="flex items-center justify-center space-x-2">
//                                 <button
//                                   onClick={() => handleEditTechnician(technician.technician_id)}
//                                   className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition font-medium"
//                                   title="Edit technician"
//                                 >
//                                   <Edit2 className="h-4 w-4" />
//                                 </button>
//                                 <button
//                                   onClick={() => handleViewTechnician(technician.technician_id)}
//                                   className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium"
//                                   title="View technician details"
//                                 >
//                                   <Eye className="h-4 w-4" />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>

//                   <Pagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     totalItems={filteredTechnicians.length}
//                     itemsPerPage={ITEMS_PER_PAGE}
//                     onPageChange={handlePageChange}
//                     showInfo={true}
//                     itemLabel="technicians"
//                   />
//                 </>
//               ) : (
//                 <div className="text-center py-16">
//                   <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                     {searchTerm ? 'No technicians found' : 'No technicians yet'}
//                   </h3>
//                   <p className="text-gray-500 mb-6">
//                     {searchTerm
//                       ? 'Try adjusting your search terms'
//                       : 'Get started by adding your first technician'
//                     }
//                   </p>
//                   {!searchTerm && (
//                     <button
//                       onClick={() => navigate('/master/add-technician')}
//                       className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
//                     >
//                       <Wrench className="h-5 w-5" />
//                       <span>Add First Technician</span>
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </>
    
//   );
// };

export const TechnicianList = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchTechnicians();
  }, []);

  useEffect(() => {
    filterTechnicians();
  }, [searchTerm, technicians]);

  const fetchTechnicians = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(ENDPOINTS.TECHNICIAN.TECHNICIAN_LIST);
      const sortedTechnicians = (response.data.technicians || []).sort((a, b) => {
        return b.technician_id - a.technician_id;
      });
      setTechnicians(sortedTechnicians);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || '';
      
      if (errorMessage.toLowerCase().includes('no technician found') || 
          errorMessage.toLowerCase().includes('technician not found') ||
          err.response?.status === 400) {
        setTechnicians([]);
        setError(null);
        console.log('No technicians available');
      } else {
        setError(errorMessage || 'Failed to fetch technicians');
        console.error('Technician fetch error:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterTechnicians = () => {
    if (!searchTerm.trim()) {
      setFilteredTechnicians(technicians);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = technicians.filter(technician => {
      const name = (technician.technician_name || '').toLowerCase();
      const phone = (technician.technician_phone || '').toString();
      return name.includes(term) || phone.includes(term);
    });
    setFilteredTechnicians(filtered);
    setCurrentPage(1);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleDeleteTechnician = async (technicianId, technicianName) => {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.TECHNICIAN.DELETE_TECHNICIAN}/${technicianId}`
      );
      
      showNotification('success', 
        response.data.message || 'Technician deleted successfully'
      );
      
      // Refresh the technician list
      fetchTechnicians();
    } catch (error) {
      console.error('Error deleting technician:', error);
      throw error; // Let MasterActions handle the error display
    }
  };

  const totalPages = Math.ceil(filteredTechnicians.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTechnicians = filteredTechnicians.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    fetchTechnicians(true);
  };

  const handleViewTechnician = (technicianId) => {
    navigate(`/technicians/detail/${technicianId}`);
  };

  const handleEditTechnician = (technicianId) => {
    navigate(`/master/edit-technician/${technicianId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && technicians.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading technicians...</p>
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
                <Wrench className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Technician List</h1>
                <p className="text-sm text-gray-600">
                  Total {filteredTechnicians.length} technician{filteredTechnicians.length !== 1 ? 's' : ''}
                  {filteredTechnicians.length > 0 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh technician list"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Integrated ExportButton Component */}
              {ENDPOINTS.TECHNICIAN?.EXPORT_TECHNICIAN && (
                <ExportButton
                  endpoint={ENDPOINTS.TECHNICIAN.EXPORT_TECHNICIAN}
                  axiosInstance={axiosInstance}
                  defaultFilters={{ q: '', from_date: '', to_date: '' }}
                  buttonText="Export"
                  modalTitle="Export Technicians"
                  fileNamePrefix="Technician_List"
                  filterFields={[
                    {
                      name: 'q',
                      label: 'Search (Name or Phone)',
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
                  onExportSuccess={(filename) => {
                    console.log('Export successful:', filename);
                  }}
                  onExportError={(error) => {
                    console.error('Export failed:', error);
                  }}
                />
              )}

              <button
                onClick={() => navigate('/master/add-technician')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Add Technician</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isRefreshing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">Refreshing technician list...</span>
          </div>
        )}

        {/* Notification Display */}
        {notification.show && (
          <div className={`mb-6 rounded-xl border-2 p-4 flex items-start space-x-3 shadow-lg animate-in slide-in-from-top ${
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
            onSearchChange={handleSearchChange}
            placeholder="Search by name or phone number..."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {currentTechnicians.length > 0 ? (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTechnicians.map((technician) => {
                      const serialNumber = technicians.length - technicians.findIndex(t => t.technician_id === technician.technician_id);
                      return (
                        <tr
                          key={technician.technician_id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">
                              {serialNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Wrench className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {technician.technician_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <MasterActions
                              onEdit={() => handleEditTechnician(technician.technician_id)}
                              onView={() => handleViewTechnician(technician.technician_id)}
                              onDelete={() => handleDeleteTechnician(
                                technician.technician_id, 
                                technician.technician_name
                              )}
                              itemName={technician.technician_name}
                              size="md"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTechnicians.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  itemLabel="technicians"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No technicians found' : 'No technicians yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first technician'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/master/add-technician')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    <Wrench className="h-5 w-5" />
                    <span>Add First Technician</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

 // Edit Technician Component
export const EditTechnician = () => {
  const navigate = useNavigate();
  const { technicianId } = useParams();
  const [formData, setFormData] = useState({
    technician_name: '',
    technician_phone: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchTechnicianData();
  }, [technicianId]);

  const fetchTechnicianData = async () => {
    try {
       console.log('Fetching technician data for ID:', technicianId);
       console.log('Endpoint:', `${ENDPOINTS.TECHNICIAN.TECHNICIAN_DETAIL}/${technicianId}`);
      setLoading(true);
      const response = await axiosInstance.get(
        `${ENDPOINTS.TECHNICIAN.TECHNICIAN_DETAIL}/${technicianId}`
      );
      
      const technicianData = {
        technician_name: response.data.technician.technician_name || '',
        technician_phone: response.data.technician.technician_phone || ''
      };
      
      setFormData(technicianData);
      setOriginalData(technicianData);
    } catch (error) {
      console.error('Error fetching technician:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch technician details';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.technician_name.trim()) {
      newErrors.technician_name = 'Technician name is required';
    }

    if (!formData.technician_phone.trim()) {
      newErrors.technician_phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.technician_phone)) {
      newErrors.technician_phone = 'Phone number must be 10 digits';
    }

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
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.put(
        `${ENDPOINTS.TECHNICIAN.UPDATE_TECHNICIAN}/${technicianId}`,
        formData
      );
      
      showNotification('success', response.data.message || 'Technician updated successfully');
      
      setTimeout(() => {
        navigate(`/technicians/detail/${technicianId}`);
      }, 1500);

    } catch (error) {
      console.error('Error updating technician:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update technician. Please try again.';
      showNotification('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/master/technician/list`);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading technician details...</p>
        </div>
      </div>
    );
  }

  return (
   
     
      
      < >
        {/* Header with gradient */}
        <header className="bg-white shadow-lg border-b border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-12 lg:ml-0">
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <Edit2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                    Edit Technician
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                    Update technician information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Notification with animation */}
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

          {/* Form Card with enhanced styling */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Technician Information
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">Update the details below to modify technician information</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Technician Name */}
              <div className="group">
                <label htmlFor="technician_name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>Technician Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  id="technician_name"
                  name="technician_name"
                  value={formData.technician_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                    errors.technician_name ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  placeholder="Enter technician name"
                />
                {errors.technician_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.technician_name}</span>
                  </p>
                )}
              </div>

              {/* Technician Phone */}
              <div className="group">
                <label htmlFor="technician_phone" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  <span>Phone Number <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  id="technician_phone"
                  name="technician_phone"
                  value={formData.technician_phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm ${
                    errors.technician_phone ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {errors.technician_phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.technician_phone}</span>
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm transform hover:scale-105"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !hasChanges()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transform hover:scale-105"
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
          </div>

          {/* Info Card with enhanced styling */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900">Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
                  The Save button will be disabled if no changes are made.
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    
  );
};


// // Technician Detail Component
export const TechnicianDetail = () => {
  const navigate = useNavigate();
  const { technicianId } = useParams(); 
  const [technicianData, setTechnicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTechnicianDetail();
  }, [technicianId]);

  const fetchTechnicianDetail = async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get(
        `${ENDPOINTS.TECHNICIAN.TECHNICIAN_DETAIL}/${technicianId}`
      );
      
      setTechnicianData(response.data.technician);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to fetch technician details';
      setError(errorMessage);
      console.error('Technician detail fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/master/edit-technician/${technicianId}`);
  };

  if (loading && !technicianData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading technician details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Technician</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/technicians/list')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Technician List
            </button>
          </div>
        </div>
    );
  }

  return (
    

      <div >
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-12 lg:ml-0">
                <button
                  onClick={() => navigate('/master/technician/list')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{technicianData?.technician_name}</h1>
                  <p className="text-sm text-gray-600">Technician Details</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isRefreshing && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Refreshing technician details...</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Technician Name</p>
                  <p className="text-base text-gray-900">{technicianData?.technician_name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base text-gray-900">{technicianData?.technician_phone}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    
  );
};
