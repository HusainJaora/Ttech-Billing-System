

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Wrench,
  Calendar,
  User,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { revenue, sixMonths, OutstandingTotal, RepairStatusCounts, TodaysInvoices } = dashboardData;

  // Format data for line chart
  const chartData = sixMonths.monthlyRevenue.map(item => ({
    month: item.month,
    revenue: Number(item.monthly_revenue)
  }));

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</p>
          <p className="text-sm text-indigo-600">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                revenue.revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {revenue.revenueGrowthPercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(revenue.revenueGrowthPercent)}%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue (This Month)</h3>
            <p className="text-3xl font-bold text-gray-900">₹{revenue.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">vs last month</p>
          </div>

          {/* Outstanding Card */}
          <div 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md transition"
            onClick={handleOutstandingClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                OutstandingTotal.outstandingChangePercent >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {OutstandingTotal.outstandingChangePercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(OutstandingTotal.outstandingChangePercent)}%</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Outstanding</h3>
            <p className="text-3xl font-bold text-gray-900">₹{OutstandingTotal.totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Click to view details</p>
          </div>

          {/* Today's Invoices Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Invoices</h3>
            <p className="text-3xl font-bold text-gray-900">{TodaysInvoices.count}</p>
            <p className="text-xs text-gray-500 mt-2">Generated today</p>
          </div>
        </div>

        {/* Revenue Chart & Repair Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 6-Month Revenue Line Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Repair Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Repair Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {RepairStatusCounts.repairStatusCounts.map((item, index) => {
                const colors = {
                  'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
                  'Completed': 'bg-green-100 text-green-700 border-green-200',
                  'Delivered': 'bg-purple-100 text-purple-700 border-purple-200'
                };

                return (
                  <div
                    key={index}
                    onClick={() => handleRepairStatusClick(item.status)}
                    className={`${colors[item.status]} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Wrench className="h-5 w-5" />
                      <h4 className="font-semibold text-sm">{item.status}</h4>
                    </div>
                    <p className="text-3xl font-bold">{item.status_count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Today's Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            {TodaysInvoices.data.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {TodaysInvoices.data.map((invoice) => {
                    const statusColors = {
                      'ISSUED': 'bg-yellow-100 text-yellow-800',
                      'PAID': 'bg-green-100 text-green-800',
                      'PARTIALLY_PAID': 'bg-blue-100 text-blue-800',
                      'CANCELLED': 'bg-red-100 text-red-800',
                      'DRAFT': 'bg-gray-100 text-gray-800'
                    };

                    return (
                      <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoice_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status]}`}>
                            {invoice.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{Number(invoice.grand_total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{Number(invoice.amount_due).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.created_time}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No invoices generated today</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

