import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import {Dashboard,OutstandingInvoices} from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import CreateUser from './pages/admin/CreateUser';
import {Technician, TechnicianList, EditTechnician, TechnicianDetail} from './pages/Master/Technician';
import {Customer, CustomerList, CustomerDetail, EditCustomer} from './pages/Customer';
import { EditSupplier, Supplier, SupplierDetail, SupplierList } from './pages/Master/Supplier';
import { EditProductCategory, ProductCategory, ProductCategoryList } from './pages/Master/ProductCategories';
import { Inquiry } from './pages/Repair/Inquiry';
import ProfilePage from './pages/userProfile/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* All Protected Routes with MainLayout - Sidebar persists for ALL pages */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoices/outstanding" element={<OutstandingInvoices />} />
            
            {/* User Profile */}
            <Route path="/settings/profile" element={<ProfilePage />} />
            
            {/* Customer Routes */}
            <Route path="/customers/add" element={<Customer />} />
            <Route path="/customers/list" element={<CustomerList />} />
            <Route path="/customers/edit/:customerId" element={<EditCustomer />} />
            <Route path="/customers/detail/:customerId" element={<CustomerDetail />} />
            
            {/* Technician Routes */}
            <Route path="/master/add-technician" element={<Technician />} />
            <Route path="/master/edit-technician/:technicianId" element={<EditTechnician />} />
            <Route path="/master/technician/list" element={<TechnicianList />} />
            <Route path="/technicians/detail/:technicianId" element={<TechnicianDetail />} />

            {/* Supplier Routes */}
            <Route path="/master/add-supplier" element={<Supplier />} />
            <Route path="/master/edit-supplier/:supplierId" element={<EditSupplier />} />
            <Route path="/suppliers/detail/:supplierId" element={<SupplierDetail />} />
            <Route path="/master/supplier/list" element={<SupplierList />} />


            {/* Product Categories Route */}
            <Route path="/master/add-product-category" element={<ProductCategory />} />
            <Route path="/master/product-categories/list" element={<ProductCategoryList/>} />
            <Route path="/master/edit-product-category/:product_category_id" element={<EditProductCategory />} />

            {/* Inquiry Route */}
            
            <Route path="/repair/inquiry" element={<Inquiry/>} />
            
        
           
          </Route>
           {/* Admin Routes - These need admin check inside components or separate wrapper */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/create-user" element={<ProtectedRoute requireAdmin={true}><CreateUser /></ProtectedRoute>} />
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
