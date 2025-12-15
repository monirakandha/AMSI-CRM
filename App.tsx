import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import TicketSystem from './components/TicketSystem';
import ProductInventory from './components/ProductInventory';
import InvoiceList from './components/InvoiceList';
import QuoteList from './components/QuoteList';
import SalesTeam from './components/SalesTeam';
import EngineerSection from './components/EngineerSection';
import TeamDirectory from './components/TeamDirectory';
import Settings from './components/Settings';
import JobCalendar from './components/JobCalendar';
import Login from './components/Login';
import SubscriptionManager from './components/SubscriptionManager';
import UserProfile from './components/UserProfile';

import { MOCK_CUSTOMERS, MOCK_TICKETS, MOCK_PRODUCTS, MOCK_INVOICES, MOCK_QUOTES, MOCK_STAFF, MOCK_LEADS, MOCK_SUBSCRIPTIONS } from './constants';
import { Customer, Ticket, Product, Invoice, Quote, Staff, Lead, Role, Subscription } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Navigation Params State (for deep linking to customer details)
  const [navParams, setNavParams] = useState<{ customerId?: string, tab?: string } | null>(null);

  // Data State
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);

  // App Settings State
  const [companySettings, setCompanySettings] = useState({
    name: 'amsi',
    logo: 'https://i.ibb.co/9r93Qwh/amsi.png' 
  });

  // Authentication Handler
  const handleLogin = (user: Staff) => {
    setCurrentUser(user);
    // Set initial tab based on role
    switch (user.role) {
      case Role.ADMIN: setActiveTab('dashboard'); break;
      case Role.SALES: setActiveTab('sales'); break;
      case Role.ENGINEER: setActiveTab('engineers'); break;
      case Role.TECH: setActiveTab('schedule'); break;
      default: setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleNavigateToCustomer = (customerId: string, tab: string = 'overview') => {
      setNavParams({ customerId, tab });
      setActiveTab('customers');
  };

  // Permission Logic
  const canAccess = (tab: string): boolean => {
    if (!currentUser) return false;
    if (tab === 'profile') return true; // Everyone can access their profile
    if (currentUser.role === Role.ADMIN) return true;

    const permissions: Record<Role, string[]> = {
      [Role.SALES]: ['sales', 'customers', 'quotes'],
      [Role.ENGINEER]: ['engineers', 'quotes', 'sales', 'tickets', 'inventory', 'schedule', 'customers'],
      [Role.TECH]: ['schedule', 'tickets', 'inventory'],
      [Role.ADMIN]: [] // Handled above
    };

    return permissions[currentUser.role]?.includes(tab) || false;
  };

  const renderContent = () => {
    if (!canAccess(activeTab)) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
                <h3 className="text-xl font-medium text-red-500">Access Denied</h3>
                <p>You do not have permission to view this module.</p>
            </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard customers={customers} tickets={tickets} invoices={invoices} />;
      case 'schedule':
        return (
            <JobCalendar 
                tickets={tickets} 
                staff={staff} 
                customers={customers} 
                setTickets={setTickets} 
            />
        );
      case 'customers':
        return (
          <CustomerList 
            customers={customers} 
            setCustomers={setCustomers}
            tickets={tickets} 
            invoices={invoices} 
            quotes={quotes} 
            setTickets={setTickets}
            currentUser={currentUser!}
            staff={staff}
            initialCustomerId={navParams?.customerId}
            initialTab={navParams?.tab}
            onConsumeNavParams={() => setNavParams(null)}
          />
        );
      case 'tickets':
        return <TicketSystem tickets={tickets} customers={customers} setCustomers={setCustomers} setTickets={setTickets} staff={staff} currentUser={currentUser!} />;
      case 'inventory':
        return <ProductInventory products={products} setProducts={setProducts} />;
      case 'quotes':
        return (
          <QuoteList 
            quotes={quotes} 
            customers={customers} 
            products={products} 
            setQuotes={setQuotes} 
            setCustomers={setCustomers}
            setInvoices={setInvoices}
            setActiveTab={setActiveTab}
            onNavigateToCustomer={handleNavigateToCustomer}
          />
        );
      case 'invoices':
        return <InvoiceList invoices={invoices} customers={customers} products={products} setInvoices={setInvoices} setCustomers={setCustomers} />;
      case 'subscriptions':
        return <SubscriptionManager subscriptions={subscriptions} customers={customers} setSubscriptions={setSubscriptions} setInvoices={setInvoices} />;
      case 'sales':
        return <SalesTeam staff={staff} leads={leads} setLeads={setLeads} customers={customers} setCustomers={setCustomers} />;
      case 'engineers':
        return <EngineerSection staff={staff} leads={leads} setLeads={setLeads} tickets={tickets} />;
      case 'team':
        return <TeamDirectory staff={staff} setStaff={setStaff} />;
      case 'settings':
        return <Settings companySettings={companySettings} setCompanySettings={setCompanySettings} />;
      case 'profile':
        return <UserProfile currentUser={currentUser!} setCurrentUser={setCurrentUser} />;
      default:
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                    <h3 className="text-xl font-medium">Coming Soon</h3>
                    <p>This module is under development.</p>
                </div>
            </div>
        );
    }
  };

  // If not logged in, show login screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
        companySettings={companySettings}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;