import React, { useState } from 'react';
import { 
  Save, Bell, Globe, Shield, Database, Mail, Building, 
  Download, RefreshCw, CheckCircle, AlertTriangle, Smartphone, 
  CreditCard, Server, UserCheck, Lock
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations' | 'security' | 'data'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock State for Form Fields
  const [formData, setFormData] = useState({
    companyName: 'SecureLogic CRM',
    supportEmail: 'support@securelogic.com',
    supportPhone: '(555) 012-3456',
    address: '123 Security Blvd, Tech City',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    emailAlerts: true,
    smsDispatch: true,
    marketingEmails: false,
    autoInvoiceReminders: true,
    maintenanceReminders: true,
    stripeKey: 'pk_live_.......................',
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ];

  return (
    <div className="p-8 h-full flex flex-col relative bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">System Settings</h2>
          <p className="text-slate-500 mt-1">Configure global preferences and system behavior.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {showSuccess && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <CheckCircle size={16} /> Settings saved successfully
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 h-fit overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-4 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
          <div className="p-8 max-w-4xl">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Company Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                      <input 
                        type="email" 
                        value={formData.supportEmail}
                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone</label>
                      <input 
                        type="text" 
                        value={formData.supportPhone}
                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Office Address</label>
                      <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Regional Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                      <select 
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                      <select 
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                        <option value="Europe/London">London</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
                      <select 
                        value={formData.dateFormat}
                        onChange={(e) => handleChange('dateFormat', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Alert Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Email Notifications</p>
                          <p className="text-sm text-slate-500">Receive tickets and critical alerts via email.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.emailAlerts} onChange={(e) => handleChange('emailAlerts', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">SMS Dispatch</p>
                          <p className="text-sm text-slate-500">Send text messages to technicians for urgent jobs.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.smsDispatch} onChange={(e) => handleChange('smsDispatch', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Automated Reminders</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="autoInvoice"
                        checked={formData.autoInvoiceReminders}
                        onChange={(e) => handleChange('autoInvoiceReminders', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="autoInvoice">
                        <span className="block font-medium text-slate-800">Invoice Payment Reminders</span>
                        <span className="block text-sm text-slate-500">Automatically send emails 7 days before due date and on due date.</span>
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="maintenance"
                        checked={formData.maintenanceReminders}
                        onChange={(e) => handleChange('maintenanceReminders', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="maintenance">
                        <span className="block font-medium text-slate-800">Service & Maintenance Due</span>
                        <span className="block text-sm text-slate-500">Notify customers when annual maintenance or battery replacement is required.</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Settings */}
            {activeTab === 'integrations' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Connected Services</h3>
                  
                  <div className="space-y-6">
                    {/* Google AI */}
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <Server size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">Google Gemini AI</h4>
                            <p className="text-xs text-slate-500">Powers ticket analysis and summaries.</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Connected
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        API Key configured via environment variables.
                      </div>
                    </div>

                    {/* Stripe */}
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <CreditCard size={24} className="text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">Stripe Payments</h4>
                            <p className="text-xs text-slate-500">Handles subscription billing and invoices.</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Live Mode
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secret Key</label>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            value={formData.stripeKey} 
                            readOnly
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-500 font-mono"
                          />
                          <button className="text-blue-600 text-sm font-medium hover:underline">Update</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Access Control</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Two-Factor Authentication (2FA)</p>
                          <p className="text-sm text-slate-500">Require 2FA for all Admin and Engineer accounts.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.twoFactorAuth} onChange={(e) => handleChange('twoFactorAuth', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserCheck size={16} /> Password Policy
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Password Expiry (Days)</label>
                            <input 
                              type="number" 
                              value={formData.passwordExpiry}
                              onChange={(e) => handleChange('passwordExpiry', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-2 text-sm"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Session Timeout (Minutes)</label>
                            <input 
                              type="number" 
                              value={formData.sessionTimeout}
                              onChange={(e) => handleChange('sessionTimeout', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded p-2 text-sm"
                            />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Settings */}
            {activeTab === 'data' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Data Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <Download size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">Export Customer Data</h4>
                        <p className="text-sm text-slate-500 mb-4">Download a CSV file containing all customer profiles, systems, and contact info.</p>
                        <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                            Download CSV
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                            <Database size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">Export Financials</h4>
                        <p className="text-sm text-slate-500 mb-4">Download invoice history and revenue reports for the current fiscal year.</p>
                        <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                            Generate Report
                        </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                   <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={20} /> Danger Zone
                   </h3>
                   <p className="text-sm text-red-700 mb-4">
                      These actions are irreversible. Please proceed with caution.
                   </p>
                   <div className="flex gap-4">
                      <button className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 border border-red-200 transition-colors">
                          Reset System Configuration
                      </button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;