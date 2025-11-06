import { useState } from 'react';
import { 
  Menu,
  LayoutDashboard,
  Building2,
  Network, 
  X, 
  ChevronDown, 
  ChevronRight,
  Users,
  Wrench,
  ShoppingCart,
  Settings,
  FileText,
  UserPlus,
  List,
  CreditCard,
  FileSpreadsheet,
  User,
  LogOut,
  ClipboardList
} from 'lucide-react';

export default function Sidebar({ onNavigate, onLogout, currentUser, currentPath }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSubmenus, setExpandedSubmenus] = useState({});

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuName];
      // Close all other menus and toggle this one
      return isCurrentlyExpanded ? {} : { [menuName]: true };
    });
    // Close all submenus when switching parent menus
    setExpandedSubmenus({});
  };

  const toggleSubmenu = (submenuName) => {
    setExpandedSubmenus(prev => {
      const isCurrentlyExpanded = prev[submenuName];
      // Close all other submenus and toggle this one
      return isCurrentlyExpanded ? {} : { [submenuName]: true };
    });
  };

  const handleNavigation = (path) => {
    onNavigate(path);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      name: 'Master',
      icon: List,
      submenu: [
        { name: 'Technician', icon: Users, path: '/master/technician/list' },
        { name: 'Supplier', icon: Building2, path: '/master/supplier/list' },
        { name: 'Product Categories', icon: Network, path: '/master/product-categories/list' }
      ]
    },
    {
      name: 'Customers',
      icon: Users,
      submenu: [
        { name: 'Customer List', icon: List, path: '/customers/list' },
        { name: 'Add Customer', icon: UserPlus, path: '/customers/add' }
      ]
    },
    {
      name: 'Repair',
      icon: Wrench,
      submenu: [
        { name: 'Inquiry', icon: ClipboardList, path: '/repair/inquiry' },
        { name: 'Repair List', icon: List, path: '/repair/list' }
      ]
    },
    {
      name: 'Sales',
      icon: ShoppingCart,
      submenu: [
        { name: 'Invoice', icon: FileText, path: '/sales/invoice' },
        { name: 'Payments', icon: CreditCard, path: '/sales/payments' },
        { name: 'Quotations', icon: FileSpreadsheet, path: '/sales/quotations' }
      ]
    },
    {
      name: 'Settings',
      icon: Settings,
      submenu: [
        { name: 'User Profile', icon: User, path: '/settings/profile' },
        { 
          name: 'Terms & Conditions', 
          icon: FileText, 
          submenu: [
            { name: 'Inquiry Terms', icon: ClipboardList, path: '/settings/terms/inquiry' },
            { name: 'Invoice Terms', icon: FileText, path: '/settings/terms/invoice' },
            { name: 'Quotation Terms', icon: FileSpreadsheet, path: '/settings/terms/quotation' }
          ]
        },
        { name: 'Logout', icon: LogOut, action: 'logout' }
      ]
    }
  ];

  // Helper function to check if a path is active (exact match only for menu items)
  const isPathActive = (itemPath, currentPath) => {
    if (!itemPath || !currentPath) return false;
    
    // Exact match only
    return currentPath === itemPath;
  };

  // Check if current path matches any submenu item in this menu
  const isMenuActive = (item) => {
    if (item.path && currentPath === item.path) {
      return true;
    }
    if (item.submenu) {
      return item.submenu.some(subItem => {
        // Check direct match
        if (isPathActive(subItem.path, currentPath)) return true;
        
        // Check nested submenus
        if (subItem.submenu) {
          return subItem.submenu.some(nestedItem => 
            isPathActive(nestedItem.path, currentPath)
          );
        }
        
        return false;
      });
    }
    return false;
  };

  return (
    <>
      {/* Hamburger Button - Fixed position on mobile */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-md bg-white/30 z-30 transition"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
          w-64 border-r border-gray-200
        `}
      >
        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.name];
            const isActive = isMenuActive(item);

            return (
              <div key={item.name}>
                {/* Main Menu Item */}
                {item.path ? (
                  // Direct navigation item (Dashboard)
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </button>
                ) : (
                  // Menu with submenu
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                                          {isExpanded ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </button>
                )}

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubExpanded = expandedSubmenus[subItem.name];
                      
                      // Check if this specific submenu item is active
                      const isSubItemActive = isPathActive(subItem.path, currentPath);
                      
                      if (subItem.action === 'logout') {
                        return (
                          <button
                            key={subItem.name}
                            onClick={onLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <SubIcon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </button>
                        );
                      }

                      // If submenu has nested items (like Terms & Conditions)
                      if (subItem.submenu) {
                        return (
                          <div key={subItem.name}>
                            <button
                              onClick={() => toggleSubmenu(subItem.name)}
                              className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isSubItemActive
                                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <SubIcon className="h-4 w-4" />
                                <span>{subItem.name}</span>
                              </div>
                              {isSubExpanded ? (
                                <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                              )}
                            </button>
                            
                            {/* Nested submenu - Only show when expanded */}
                            {isSubExpanded && subItem.submenu && (
                              <div className="mt-1 ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {subItem.submenu.map((nestedItem) => {
                                  const NestedIcon = nestedItem.icon;
                                  const isNestedActive = isPathActive(nestedItem.path, currentPath);
                                  
                                  return (
                                    <button
                                      key={nestedItem.name}
                                      onClick={() => handleNavigation(nestedItem.path)}
                                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                        isNestedActive
                                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                      }`}
                                    >
                                      <NestedIcon className="h-4 w-4" />
                                      <span>{nestedItem.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={subItem.name}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isSubItemActive
                              ? 'bg-indigo-100 text-indigo-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span>{subItem.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Repair Management
          </p>
        </div>
      </aside>
    </>
  );
}