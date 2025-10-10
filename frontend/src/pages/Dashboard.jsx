// import { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import axiosInstance from '../api/axios';
// import { User, LogOut, RefreshCw } from 'lucide-react';
// import DashboardComponent from '../components/Dashboard';

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { user, logout } = useContext(AuthContext);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   // Auto-refresh interval in milliseconds (4 minutes = 240000ms)
//   const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes

//   useEffect(() => {
//     fetchDashboardData();

//     // Set up auto-refresh interval
//     const intervalId = setInterval(() => {
//       fetchDashboardData(true); // true indicates auto-refresh
//     }, REFRESH_INTERVAL);

//     // Cleanup interval on component unmount
//     return () => clearInterval(intervalId);
//   }, []);

//   const fetchDashboardData = async (isAutoRefresh = false) => {
//     try {
//       if (!isAutoRefresh) {
//         setLoading(true);
//       } else {
//         setIsRefreshing(true);
//       }
      
//       const response = await axiosInstance.get('/dashboard');
//       setDashboardData(response.data);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch dashboard data');
//       console.error('Dashboard fetch error:', err);
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   const handleManualRefresh = () => {
//     fetchDashboardData();
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   const handleRepairStatusClick = async (status) => {
//     try {
//       const response = await axiosInstance.get(`/dashboard/repair-by-status/${status}`);
//       console.log(`${status} repairs:`, response.data);
//       alert(`${status} repairs fetched. Check console for details.`);
//     } catch (err) {
//       console.error(`Error fetching ${status} repairs:`, err);
//       alert(`No ${status} repairs found or error occurred.`);
//     }
//   };

//   const handleOutstandingClick = async () => {
//     try {
//       const response = await axiosInstance.get('/dashboard/outstanding-invoices');
//       console.log('Outstanding invoices:', response.data);
//       alert('Outstanding invoices fetched. Check console for details.');
//     } catch (err) {
//       console.error('Error fetching outstanding invoices:', err);
//       alert('No outstanding invoices found or error occurred.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
//                 <User className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
//                 <p className="text-sm text-gray-600">Welcome back, {user?.username}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               {/* Manual Refresh Button */}
//               <button
//                 onClick={handleManualRefresh}
//                 disabled={isRefreshing}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
//                 title="Refresh dashboard"
//               >
//                 <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
//               >
//                 <LogOut className="h-4 w-4" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Dashboard Component */}
//       <DashboardComponent
//         dashboardData={dashboardData}
//         loading={loading}
//         error={error}
//         isRefreshing={isRefreshing}
//         onRefresh={fetchDashboardData}
//         onRepairStatusClick={handleRepairStatusClick}
//         onOutstandingClick={handleOutstandingClick}
//       />
//     </div>
//   );
// }

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { RefreshCw } from 'lucide-react';
import DashboardComponent from '../components/Dashboard';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const REFRESH_INTERVAL = 4 * 60 * 1000;

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await axiosInstance.get('/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardData();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleRepairStatusClick = async (status) => {
    try {
      const response = await axiosInstance.get(`/dashboard/repair-by-status/${status}`);
      console.log(`${status} repairs:`, response.data);
      alert(`${status} repairs fetched. Check console for details.`);
    } catch (err) {
      console.error(`Error fetching ${status} repairs:`, err);
      alert(`No ${status} repairs found or error occurred.`);
    }
  };

  const handleOutstandingClick = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/outstanding-invoices');
      console.log('Outstanding invoices:', response.data);
      alert('Outstanding invoices fetched. Check console for details.');
    } catch (err) {
      console.error('Error fetching outstanding invoices:', err);
      alert('No outstanding invoices found or error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar 
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        currentUser={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - adjusted for sidebar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ml-12 lg:ml-0">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Manual Refresh Button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                  title="Refresh dashboard"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Component */}
        <DashboardComponent
          dashboardData={dashboardData}
          loading={loading}
          error={error}
          isRefreshing={isRefreshing}
          onRefresh={fetchDashboardData}
          onRepairStatusClick={handleRepairStatusClick}
          onOutstandingClick={handleOutstandingClick}
        />
      </div>
    </div>
  );
}