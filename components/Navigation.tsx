import React from 'react';
import { LayoutDashboard, Users, AlertCircle, Settings, ShieldCheck, Package, FileText, FileBarChart, Briefcase, HardHat, UserCog, Calendar, LogOut } from 'lucide-react';
import { Role, Staff } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Staff;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  
  // Define all nav items
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.ADMIN] },
    { id: 'schedule', label: 'Schedule', icon: Calendar, roles: [Role.ADMIN, Role.TECH, Role.ENGINEER] },
    { id: 'customers', label: 'Customers', icon: Users, roles: [Role.ADMIN, Role.SALES, Role.ENGINEER] },
    { id: 'tickets', label: 'Service Tickets', icon: AlertCircle, roles: [Role.ADMIN, Role.TECH, Role.ENGINEER] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: [Role.ADMIN, Role.TECH, Role.ENGINEER] },
    { id: 'quotes', label: 'Quotes', icon: FileBarChart, roles: [Role.ADMIN, Role.SALES, Role.ENGINEER] },
    { id: 'invoices', label: 'Invoices', icon: FileText, roles: [Role.ADMIN] },
    { id: 'sales', label: 'Sales Team', icon: Briefcase, roles: [Role.ADMIN, Role.SALES, Role.ENGINEER] },
    { id: 'engineers', label: 'Engineering', icon: HardHat, roles: [Role.ADMIN, Role.ENGINEER] },
    { id: 'team', label: 'Team Directory', icon: UserCog, roles: [Role.ADMIN] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [Role.ADMIN] },
  ];

  // Filter based on role
  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.SALES: return 'bg-blue-500';
      case Role.ENGINEER: return 'bg-purple-500';
      case Role.ADMIN: return 'bg-red-500';
      case Role.TECH: return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full shadow-xl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <ShieldCheck className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">SecureLogic</h1>
          <p className="text-xs text-slate-400">CRM & Dispatch</p>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
            </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all duration-200"
        >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;