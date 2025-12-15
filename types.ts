
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

export interface CustomerNote {
  id: string;
  content: string;
  author: string;
  authorId?: string; // Added authorId to link to Staff
  date: string;
  attachment?: string;
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
  noteHistory?: CustomerNote[];
  image?: string; // Added image field
}

export interface TicketHistoryEntry {
  date: string;
  action: string;
  user: string;
  details?: string;
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
  history?: TicketHistoryEntry[];
  notes?: string; // Added notes field for job schedule
  noteTitle?: string; // Added note title
  photos?: string[]; // Added photos for job completion
  signature?: string; // Added signature for job completion
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

// Subscriptions & Plans

export enum SubscriptionStatus {
    ACTIVE = 'Active',
    PAST_DUE = 'Past Due',
    CANCELLED = 'Cancelled'
}

export enum BillingCycle {
    MONTHLY = 'Monthly',
    QUARTERLY = 'Quarterly',
    ANNUALLY = 'Annually'
}

export interface Subscription {
    id: string;
    customerId: string;
    planName: string;
    amount: number;
    billingCycle: BillingCycle;
    startDate: string;
    nextBillingDate: string;
    status: SubscriptionStatus;
    lastPaymentStatus: 'Success' | 'Failed';
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
  address?: string;
  image?: string;
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
