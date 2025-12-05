import { Customer, SystemStatus, Ticket, TicketPriority, TicketStatus, Product, Invoice, InvoiceStatus, Quote, QuoteStatus, Staff, Role, Lead, LeadStatus } from "./types";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUST-001",
    name: "Acme Corp Logistics",
    email: "ops@acmelogistics.com",
    phone: "(555) 123-4567",
    address: "88 Industrial Way, Springfield",
    contractValue: 250,
    notes: "High security warehouse. Strict access control protocols.",
    systems: [
      {
        id: "SYS-A1",
        type: "Honeywell Vista 128BPT",
        installDate: "2021-05-12",
        lastServiceDate: "2023-11-20",
        status: SystemStatus.ARMED_STAY,
        zones: 64
      }
    ]
  },
  {
    id: "CUST-002",
    name: "Dr. Sarah Bennett",
    email: "s.bennett@example.com",
    phone: "(555) 987-6543",
    address: "42 Maple Drive, Suburbia",
    contractValue: 45,
    notes: "Residential client. Has a dog, motion sensors are pet immune.",
    systems: [
      {
        id: "SYS-B2",
        type: "DSC Neo",
        installDate: "2022-08-15",
        lastServiceDate: "2024-01-10",
        status: SystemStatus.DISARMED,
        zones: 8
      }
    ]
  },
  {
    id: "CUST-003",
    name: "TechStart Hub",
    email: "facilities@techstart.io",
    phone: "(555) 444-3322",
    address: "101 Innovation Blvd, Downtown",
    contractValue: 150,
    notes: "Frequent false alarms on Zone 3 (Rear Door).",
    systems: [
      {
        id: "SYS-C3",
        type: "Qolsys IQ Panel 4",
        installDate: "2023-02-01",
        lastServiceDate: "2024-03-01",
        status: SystemStatus.TROUBLE,
        zones: 32
      }
    ]
  }
];

export const MOCK_STAFF: Staff[] = [
    { id: "ST-001", name: "John Salesman", role: Role.SALES, email: "john@securelogic.com", phone: "555-001-0001", activeLeads: 5 },
    { id: "ST-002", name: "Jane Closer", role: Role.SALES, email: "jane@securelogic.com", phone: "555-001-0002", activeLeads: 8 },
    { id: "ENG-001", name: "Robert Engineer", role: Role.ENGINEER, email: "rob@securelogic.com", phone: "555-002-0001" },
    { id: "ENG-002", name: "Emily Tech", role: Role.ENGINEER, email: "emily@securelogic.com", phone: "555-002-0002" },
    { id: "TECH-001", name: "Mike Repairman", role: Role.TECH, email: "mike@securelogic.com", phone: "555-003-0001" },
    { id: "TECH-002", name: "Sarah Installer", role: Role.TECH, email: "sarah.i@securelogic.com", phone: "555-003-0002" }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-101",
    customerId: "CUST-003",
    systemId: "SYS-C3",
    title: "Persistent Low Battery",
    description: "Panel beeping every 4 hours showing 'System Low Bat'. Power cycle didn't fix.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    createdAt: "2024-05-20T09:00:00Z",
    aiAnalysis: {
      suggestedAction: "Replace backup battery (12V 7Ah). Check charging circuit voltage.",
      estimatedTime: "30 mins",
      requiredParts: ["12V 7Ah Battery"]
    }
  },
  {
    id: "TKT-102",
    customerId: "CUST-001",
    systemId: "SYS-A1",
    title: "Zone 5 Open Fault",
    description: "Warehouse bay door contact showing open even when closed. Magnet appears aligned.",
    status: TicketStatus.ASSIGNED,
    assignedTech: "TECH-001",
    priority: TicketPriority.HIGH,
    createdAt: "2024-05-21T14:30:00Z"
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "PRD-001",
    name: "12V 7Ah Sealed Lead Acid Battery",
    category: "Power",
    description: "High-performance sealed lead-acid battery designed for alarm control panels. Maintenance-free operation with a 3-5 year lifespan. Dimensions: 5.94\" x 2.56\" x 3.70\".",
    price: 24.99,
    stock: 42,
    sku: "BAT-1270",
    stockHistory: [
      { date: "2024-05-01", stockLevel: 20, change: 20, type: "Restock", note: "Vendor shipment received" },
      { date: "2024-05-05", stockLevel: 18, change: -2, type: "Sale", note: "Invoice #1002" },
      { date: "2024-05-10", stockLevel: 15, change: -3, type: "Sale", note: "Service Install" },
      { date: "2024-05-15", stockLevel: 45, change: 30, type: "Restock", note: "Bulk order" },
      { date: "2024-05-20", stockLevel: 42, change: -3, type: "Sale", note: "Counter sales" }
    ],
    tags: ['Popular', 'Important']
  },
  {
    id: "PRD-002",
    name: "Wireless Door/Window Contact",
    category: "Sensors",
    description: "Slim profile wireless magnetic contact. Features 2-mile range, 5-year battery life, and rare earth magnet. Compatible with PowerG systems.",
    price: 34.50,
    stock: 15,
    sku: "SEN-DW-01",
    stockHistory: [
      { date: "2024-05-01", stockLevel: 10, change: 0, type: "Adjustment", note: "Inventory count" },
      { date: "2024-05-12", stockLevel: 60, change: 50, type: "Restock" },
      { date: "2024-05-18", stockLevel: 15, change: -45, type: "Sale", note: "Project Install - Acme Corp" }
    ],
    tags: ['Popular']
  },
  {
    id: "PRD-003",
    name: "PIR Motion Detector (Pet Immune)",
    category: "Sensors",
    description: "Passive infrared motion sensor with pet immunity up to 40lbs. Digital signal processing prevents false alarms. 40x40 ft coverage area.",
    price: 45.00,
    stock: 8,
    sku: "SEN-PIR-PET",
    stockHistory: [
      { date: "2024-04-20", stockLevel: 12, change: 0, type: "Adjustment" },
      { date: "2024-05-02", stockLevel: 8, change: -4, type: "Sale" }
    ]
  },
  {
    id: "PRD-004",
    name: "LTE Cellular Communicator",
    category: "Communication",
    description: "Universal dual-path LTE cellular communicator. Works with AT&T and Verizon networks. Connects to any contact ID capable panel.",
    price: 189.00,
    stock: 5,
    sku: "COM-LTE-U",
    stockHistory: [
      { date: "2024-05-01", stockLevel: 5, change: 0, type: "Adjustment" }
    ],
    tags: ['Important']
  },
  {
    id: "PRD-005",
    name: "Service Call - Standard",
    category: "Services",
    description: "Standard service rate for on-site technician labor (1st hour). Includes trip charge and basic diagnosis.",
    price: 125.00,
    stock: 999,
    sku: "SVC-STD"
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-2024-001",
    customerId: "CUST-002",
    customerName: "Dr. Sarah Bennett",
    date: "2024-05-15",
    dueDate: "2024-05-30",
    status: InvoiceStatus.PAID,
    subtotal: 169.99,
    tax: 13.60,
    totalAmount: 183.59,
    items: [
      { id: "1", productId: "PRD-005", productName: "Service Call - Standard", quantity: 1, unitPrice: 125.00, total: 125.00 },
      { id: "2", productId: "PRD-001", productName: "12V 7Ah Sealed Lead Acid Battery", quantity: 1, unitPrice: 24.99, total: 24.99 },
      { id: "3", productId: "MISC", productName: "Battery Disposal Fee", quantity: 1, unitPrice: 20.00, total: 20.00 }
    ]
  },
  {
    id: "INV-2024-002",
    customerId: "CUST-001",
    customerName: "Acme Corp Logistics",
    date: "2024-05-20",
    dueDate: "2024-06-04",
    status: InvoiceStatus.SENT,
    subtotal: 378.00,
    tax: 30.24,
    totalAmount: 408.24,
    items: [
      { id: "1", productId: "PRD-004", productName: "LTE Cellular Communicator", quantity: 2, unitPrice: 189.00, total: 378.00 }
    ]
  }
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: "Q-1001",
    customerId: "CUST-003",
    customerName: "TechStart Hub",
    date: "2024-05-25",
    expiryDate: "2024-06-25",
    status: QuoteStatus.SENT,
    subtotal: 1200.00,
    tax: 96.00,
    totalAmount: 1296.00,
    items: [
        { id: "1", productId: "SYS", productName: "System Upgrade Package", quantity: 1, unitPrice: 1200.00, total: 1200.00 }
    ],
    notes: "Upgrade to main lobby panel."
  }
];

export const MOCK_LEADS: Lead[] = [
    {
        id: "L-2024-55",
        customerName: "Metro Diner",
        contactName: "Bill Chef",
        email: "bill@metrodiner.com",
        phone: "555-999-8888",
        address: "12 Main St",
        status: LeadStatus.ENGINEER_REVIEW,
        assignedSalesId: "ST-001",
        assignedEngineerId: "ENG-001",
        estimatedValue: 3500,
        requirements: "Needs 4 cameras, 1 NVR, and alarm system for back door and front entrance. Quote needs review for cable run lengths.",
        notes: "Customer is concerned about monthly fees.",
        createdAt: "2024-05-18T10:00:00Z",
        history: [
            { date: "2024-05-18T10:00:00Z", action: "Lead Created", user: "John Salesman", details: "Initial contact made via phone." },
            { date: "2024-05-19T14:30:00Z", action: "Status Change", user: "John Salesman", details: "Moved to Site Survey." },
            { date: "2024-05-20T11:00:00Z", action: "Status Change", user: "John Salesman", details: "Submitted for Engineer Review." }
        ]
    },
    {
        id: "L-2024-58",
        customerName: "Warehouse 13",
        contactName: "Artie N.",
        email: "artie@warehouse13.com",
        phone: "555-777-6666",
        address: "51 Area Way",
        status: LeadStatus.NEW,
        assignedSalesId: "ST-002",
        estimatedValue: 15000,
        requirements: "Full facility access control and fire integration.",
        notes: "Big potential contract.",
        createdAt: "2024-05-22T14:00:00Z",
        history: [
            { date: "2024-05-22T14:00:00Z", action: "Lead Created", user: "Jane Closer", details: "Lead imported from web form." }
        ]
    }
];