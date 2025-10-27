import { useState } from 'react';
import { 
  Menu,
  LayoutDashboard, 
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
  PackageSearch,
  Boxes,
  ClipboardList
} from 'lucide-react';

export default function Sidebar({ onNavigate, onLogout, currentUser, currentPath }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleNavigation = (path) => {
    onNavigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    // Close all expanded menus when navigating to a different section
    const targetMenu = menuItems.find(item => 
      item.submenu?.some(subItem => subItem.path === path)
    );
    
    // If navigating to a top-level item (like Dashboard) or a different submenu section
    // close all other expanded menus
    if (!targetMenu || targetMenu.path === path) {
      setExpandedMenus({});
    } else {
      // Keep only the target menu expanded
      setExpandedMenus({ [targetMenu.name]: true });
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
        { name: 'Supplier', icon: PackageSearch, path: '/master/supplier' },
        { name: 'Product Categories', icon: Boxes, path: '/master/categories' }
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
        { name: 'Terms & Conditions', icon: FileText, path: '/settings/terms' },
        { name: 'Logout', icon: LogOut, action: 'logout' }
      ]
    }
  ];

  // Check if current path matches any submenu item in this menu
  const isMenuActive = (item) => {
    if (item.path && currentPath === item.path) {
      return true;
    }
    if (item.submenu) {
      return item.submenu.some(subItem => {
        if (!subItem.path) return false;
        
        // Exact match
        if (currentPath === subItem.path) return true;
        
        // For child routes, we need to match the specific section
        // /master/technician/list should match /master/technician/edit/1
        // but /master/supplier should NOT match /master/technician/edit/1
        
        const subItemParts = subItem.path.split('/').filter(p => p);
        const currentParts = currentPath.split('/').filter(p => p);
        
        // Need at least as many parts as the subitem path
        if (currentParts.length < subItemParts.length - 1) return false;
        
        // For paths like /master/technician/list
        // We need to check that all parts match up to the second-to-last part
        // subItemParts: ['master', 'technician', 'list']
        // We want to match ['master', 'technician', 'edit', '1']
        // But NOT ['master', 'supplier']
        
        if (subItemParts.length === 2) {
          // For paths like /master/supplier (only 2 parts)
          // Only match exact or with additional segments after
          return currentParts[0] === subItemParts[0] && 
                 currentParts[1] === subItemParts[1];
        } else {
          // For paths like /master/technician/list (3+ parts)
          // Match up to second-to-last part
          for (let i = 0; i < subItemParts.length - 1; i++) {
            if (subItemParts[i] !== currentParts[i]) return false;
          }
          return true;
        }
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition group ${
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition group ${
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
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      
                      // Check if current path matches or is a child route of this submenu item
                      let isSubItemActive = subItem.path === currentPath;
                      
                      if (!isSubItemActive && subItem.path) {
                        const subItemParts = subItem.path.split('/').filter(p => p);
                        const currentParts = currentPath.split('/').filter(p => p);
                        
                        if (currentParts.length >= subItemParts.length - 1) {
                          if (subItemParts.length === 2) {
                            // For 2-part paths like /master/supplier
                            isSubItemActive = currentParts[0] === subItemParts[0] && 
                                            currentParts[1] === subItemParts[1];
                          } else {
                            // For 3+ part paths like /master/technician/list
                            let matches = true;
                            for (let i = 0; i < subItemParts.length - 1; i++) {
                              if (subItemParts[i] !== currentParts[i]) {
                                matches = false;
                                break;
                              }
                            }
                            isSubItemActive = matches;
                          }
                        }
                      }
                      
                      if (subItem.action === 'logout') {
                        return (
                          <button
                            key={subItem.name}
                            onClick={onLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <SubIcon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={subItem.name}
                          onClick={() => handleNavigation(subItem.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition ${
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