
export enum SystemStatus {
  ARMED_AWAY = 'Armed Away',
  ARMED_STAY = 'Armed Stay',
  DISARMED = 'Disarmed',
  ALARM_TRIGGERED = 'ALARM TRIGGERED',
  TROUBLE = 'Trouble',
  OFFLINE = 'Offline'
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum TicketStatus {
  OPEN = 'Open',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export enum JobType {
  SERVICE = 'Service',
  INSTALL = 'Install',
  MAINTENANCE = 'Maintenance'
}

export interface AlarmSystem {
  id: string;
  type: string; // e.g., "Honeywell Vista", "DSC PowerSeries"
  installDate: string;
  lastServiceDate: string;
  status: SystemStatus;
  zones: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contractValue: number; // Monthly Recurring Revenue
  systems: AlarmSystem[];
  notes: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  systemId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTech?: string; // Staff ID or Name
  createdAt: string;
  aiAnalysis?: {
    suggestedAction: string;
    estimatedTime: string;
    requiredParts: string[];
  };
  jobType?: JobType;
  scheduledDate?: string;
  estimatedDuration?: string;
  location?: string;
  requiredTools?: string[];
}

export interface AIAnalysisResult {
  priority: TicketPriority;
  category: string;
  suggestedAction: string;
  estimatedTime: string;
  requiredParts: string[];
}

// Inventory & Products

export interface StockHistoryEntry {
  date: string;
  stockLevel: number;
  change: number;
  type: 'Restock' | 'Sale' | 'Adjustment' | 'Return';
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  cost?: number; // Added
  warranty?: string; // Added
  stock: number;
  sku: string;
  image?: string;
  stockHistory?: StockHistoryEntry[];
  tags?: string[]; // 'Important', 'Popular', etc.
}

// Invoicing & Quotes

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export enum QuoteStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  expiryDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: QuoteStatus;
  notes?: string;
}

// Sales & Engineering

export enum Role {
  SALES = 'Sales',
  ENGINEER = 'Engineer',
  ADMIN = 'Admin',
  TECH = 'Technician'
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  activeLeads?: number;
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  SITE_SURVEY = 'Site Survey',
  ENGINEER_REVIEW = 'Engineer Review',
  QUOTE_SENT = 'Quote Sent',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}

export interface LeadHistoryEntry {
  date: string;
  action: string;
  user: string; // "Sales", "Engineering", "System"
  details?: string;
}

export interface Lead {
  id: string;
  customerName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: LeadStatus;
  assignedSalesId: string;
  assignedEngineerId?: string;
  notes: string;
  estimatedValue: number;
  requirements: string; // "Customer Quote Details" for review
  createdAt: string;
  history: LeadHistoryEntry[];
}