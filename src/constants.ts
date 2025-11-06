import { ProjectPhase, Lead, Broker, Plot, CostCategory, DocumentFolder, InventoryItem, UserRole, View, DPREntry, WorkProgress, Employee, PlotStatus, Message, Department } from './types';

// =================================================================
// Role Based Access Control (RBAC)
// =================================================================
export const ROLE_PERMISSIONS: Record<UserRole, View[]> = {
  [UserRole.CEO]: [
    View.Dashboard,
    View.SiteLayout,
    View.Financials,
    View.Sales,
    View.Timeline,
    View.SalesPipeline,
    View.Brokers,
    View.Inventory,
    View.DPR,
    View.Documents,
    View.Employees,
    View.Messaging,
  ],
  [UserRole.ProjectManager]: [
    View.Dashboard,
    View.SiteLayout,
    View.Financials,
    View.Sales,
    View.Timeline,
    View.SalesPipeline,
    View.Inventory,
    View.DPR,
    View.Documents,
    View.Messaging,
  ],
  [UserRole.Supervisor]: [
    View.Dashboard,
    View.SiteLayout,
    View.Timeline,
    View.Inventory,
    View.DPR,
    View.Messaging,
  ],
  [UserRole.StoreManager]: [
    View.Inventory,
    View.Messaging,
  ],
  [UserRole.HR]: [
    View.Dashboard,
    View.Brokers,
    View.Documents,
    View.Employees,
    View.Messaging,
  ],
};


// =================================================================
// General Project Constants
// =================================================================
export const TOTAL_PLOTS = 81;
export const PROJECT_AREA_ACRES = 7.5;
export const PROJECT_DURATION_MONTHS = 18; 

// =================================================================
// Financial Data (Based on Detailed BOQ)
// =================================================================
export const COST_BREAKDOWN_COLORS = {
    dark: { 
        land: '#b8860b',
        siteDev: '#c5a565', roads: '#e0c48a', water: '#a99268', 
        sewerage: '#8B734B', electrical: '#b89d6a', landscaping: '#d4b77f',
        compoundWall: '#9e8661', clubhouse: '#f2d499', profFees: '#ab916e',
        legal: '#9c845e',
        contingency: '#7a6b51', misc: '#c0a97c'
    },
    light: { 
        land: '#D2B48C',
        siteDev: '#B38E4C', roads: '#D0A964', water: '#987E5A', 
        sewerage: '#7A623D', electrical: '#a68c59', landscaping: '#c4a872',
        compoundWall: '#8e7751', clubhouse: '#e2c589', profFees: '#9b825e',
        legal: '#8c7550',
        contingency: '#6a5b41', misc: '#b0996c'
    }
}

export const COST_BREAKDOWN: (Omit<CostCategory, 'color' | 'department'> & { colorKey: keyof typeof COST_BREAKDOWN_COLORS['dark'], department: Department })[] = [
  { name: 'Land Acquisition', value: 172500000, actual: 172500000, colorKey: 'land', department: 'Management' },
  { name: 'Site Development', value: 2400000, actual: 700000, colorKey: 'siteDev', department: 'Site Operations' },
  { name: 'Roads & Infrastructure', value: 21000000, actual: 7000000, colorKey: 'roads', department: 'Engineering' },
  { name: 'Water Supply', value: 4500000, actual: 1300000, colorKey: 'water', department: 'Engineering' },
  { name: 'Sewerage & Drainage', value: 3500000, actual: 1000000, colorKey: 'sewerage', department: 'Engineering' },
  { name: 'Electrical Works', value: 4400000, actual: 1300000, colorKey: 'electrical', department: 'Engineering' },
  { name: 'Landscaping & Parks', value: 5200000, actual: 1500000, colorKey: 'landscaping', department: 'Site Operations' },
  { name: 'Compound Wall & Security', value: 1300000, actual: 400000, colorKey: 'compoundWall', department: 'Site Operations' },
  { name: 'Clubhouse/Amenities', value: 1100000, actual: 300000, colorKey: 'clubhouse', department: 'Engineering' },
  { name: 'Professional Fees', value: 1800000, actual: 500000, colorKey: 'profFees', department: 'Management' },
  { name: 'Legal & Govt. Duties', value: 5200000, actual: 1400000, colorKey: 'legal', department: 'Management' },
  { name: 'Contingency', value: 3100000, actual: 0, colorKey: 'contingency', department: 'Management' },
  { name: 'Miscellaneous', value: 3500000, actual: 1000000, colorKey: 'misc', department: 'HR & Admin' },
];

export const TOTAL_PROJECT_BUDGET = COST_BREAKDOWN.reduce((sum, item) => sum + item.value, 0);
export const CURRENT_SPEND = COST_BREAKDOWN.reduce((sum, item) => sum + item.actual, 0);

export const FUNDING_SOURCES_COLORS = {
    dark: { internal: '#c5a565', advance: '#e0c48a' },
    light: { internal: '#B38E4C', advance: '#D0A964' }
}

export const FUNDING_SOURCES = [
  { name: 'Internal Capital', value: 60, colorKey: 'internal' }, 
  { name: 'Advance Booking Revenue', value: 40, colorKey: 'advance' }, 
];

// FIX: Completed the CASH_FLOW_DATA array with more data points and net flow calculations.
// Simplified Placeholder Cashflow
export const CASH_FLOW_DATA = [
    { month: 'Q1 \'26', outflow: 5000000, inflow: 0, net: -5000000 },
    { month: 'Q2 \'26', outflow: 8000000, inflow: 10000000, net: 2000000 },
    { month: 'Q3 \'26', outflow: 4000000, inflow: 12000000, net: 8000000 },
    { month: 'Q4 \'26', outflow: 3000000, inflow: 15000000, net: 12000000 },
    { month: 'Q1 \'27', outflow: 2000000, inflow: 10000000, net: 8000000 },
];

// =================================================================
// Plot Sales Data (Existing data retained for sales UI)
// =================================================================
export const SALES_TIERS_COLORS = {
  dark: { founder: '#c5a565', early: '#e0c48a', standard: '#a99268' },
  light: { founder: '#B38E4C', early: '#D0A964', standard: '#987E5A' }
};

export const SALES_TIERS = [
  { name: 'Founder\'s Tier', soldSqFt: 35000, targetSqFt: 35000, pricePerSqFt: 2100, colorKey: 'founder' }, 
  { name: 'Early Investor Tier', soldSqFt: 70000, targetSqFt: 70000, pricePerSqFt: 2700, colorKey: 'early' },
  { name: 'Standard Tier', soldSqFt: 15000, targetSqFt: 60000, pricePerSqFt: 3000, colorKey: 'standard' },
];
export const TOTAL_PLOTTED_AREA_SQFT = 139230;

export const SALES_VELOCITY_DATA = [
  { month: 'Dec \'25', "Sq.Ft. Sold": 35000 },
  { month: 'Jan \'26', "Sq.Ft. Sold": 40000 },
  { month: 'Feb \'26', "Sq.Ft. Sold": 30000 },
  { month: 'Mar \'26', "Sq.Ft. Sold": 15000 },
];

export const PLOT_INVENTORY_COLORS = {
    dark: { available: '#a99268', booked: '#e0c48a', sold: '#c5a565' },
    light: { available: '#987E5A', booked: '#D0A964', sold: '#B38E4C' }
}

export const PLOT_INVENTORY_DATA = [
    { name: 'Available', value: 19, colorKey: 'available'}, 
    { name: 'Booked', value: 24, colorKey: 'booked'}, 
    { name: 'Sold', value: 38, colorKey: 'sold'}, 
];

// =================================================================
// CRM & Sales Data
// =================================================================
export const SALES_PIPELINE_DATA: Lead[] = [
  { id: 1, name: 'Aarav Sharma', status: 'Contacted', source: 'Website', lastContacted: '2026-02-14', interest: '2-3 plots, corner preferred', value: 8500000, brokerId: 1, activities: [{id: 'act1', type: 'Call', date: '2026-02-14', notes: 'Initial call, interested in premium plots.', agent: 'Ria'}] },
  { id: 2, name: 'Priya Patel', status: 'New Lead', source: 'Broker', lastContacted: '2026-02-15', interest: 'Investment purpose, small size plot', value: 4500000, brokerId: 2 },
  { id: 3, name: 'Rohan Verma', status: 'Site Visit Scheduled', source: 'Social Media', lastContacted: '2026-02-12', interest: 'Plot A-05 specifically', value: 6000000, activities: [{id: 'act2', type: 'Email', date: '2026-02-12', notes: 'Scheduled site visit for Saturday.', agent: 'Ria'}] },
  { id: 4, name: 'Sunita Gupta', status: 'Negotiation', source: 'Referral', lastContacted: '2026-02-10', interest: 'Wants a deal on two adjacent plots', value: 12000000, brokerId: 1 },
  { id: 5, name: 'Vikram Singh', status: 'Booked', source: 'Website', lastContacted: '2026-01-25', interest: 'Park facing plot', value: 7500000 },
  { id: 6, name: 'Anjali Desai', status: 'Converted', source: 'Broker', lastContacted: '2025-12-20', interest: 'Founder\'s tier plot', value: 7350000, brokerId: 3 },
  { id: 7, name: 'Manish Kumar', status: 'Lost', source: 'Walk-in', lastContacted: '2026-02-01', interest: 'Budget constraints', value: 5000000 },
];

export const BROKER_DATA: Broker[] = [
  { id: 1, name: 'SK Properties', reraNo: 'UPRERAPRJ12345', contactPerson: 'Suresh Kumar', phone: '9876543210', email: 'suresh@skprop.com', status: 'Active', commissionRate: 2.5, dealsClosed: 5, totalBusiness: 45000000 },
  { id: 2, name: 'Gupta Realtors', reraNo: 'UPRERAPRJ67890', contactPerson: 'Anil Gupta', phone: '9123456780', email: 'anil@guptarealtors.in', status: 'Active', commissionRate: 2, dealsClosed: 8, totalBusiness: 60000000 },
  { id: 3, name: 'Verma & Associates', reraNo: 'UPRERAPRJ11223', contactPerson: 'Rakesh Verma', phone: '8765432109', email: 'rakesh@verma.com', status: 'Inactive', commissionRate: 2.5, dealsClosed: 2, totalBusiness: 15000000 },
  { id: 4, name: 'Cityscape Brokers', reraNo: 'UPRERAPRJ44556', contactPerson: 'Priya Singh', phone: '7890123456', email: 'priya@cityscape.com', status: 'Active', commissionRate: 3, dealsClosed: 12, totalBusiness: 95000000 },
];

const plotMatrix = [
    { size: 920, count: 4 },
    { size: 1035, count: 20 },
    { size: 1100, count: 12 },
    { size: 1200, count: 1 },
    { size: 1350, count: 5 },
    { size: 2000, count: 6 },
    { size: 2100, count: 14 },
    { size: 1600, count: 2 },
    { size: 2450, count: 4 },
    { size: 1800, count: 2 },
    { size: 1500, count: 2 },
    { size: 3200, count: 6 },
    { size: 4500, count: 3 },
];

let plotCounter = 0;
export const PLOT_DATA: Plot[] = plotMatrix.flatMap(({ size, count }) => {
  return Array.from({ length: count }, () => {
    plotCounter++;
    const i = plotCounter - 1;
    const plotId = `A-${String(plotCounter).padStart(2, '0')}`;
    
    // Proportional status based on new total of 81 plots
    // Sold: 38, Booked: 24, Available: 19
    const status: PlotStatus = i < 38 ? 'Sold' : i < 62 ? 'Booked' : 'Available';
    
    let buyerId: number | undefined;
    if (status === 'Booked') buyerId = 5;
    if (status === 'Sold') buyerId = 6;
    
    return {
        id: plotId,
        size: size,
        status: status,
        pricePerSqFt: 2500 + (i % 4) * 200,
        isCorner: i % 10 === 0,
        isParkFacing: i % 7 === 0,
        buyerId: buyerId,
        brokerId: i % 5 === 0 ? [1,2,3,4][i%4] : undefined,
    };
  });
});

// =================================================================
// Project Management Data
// =================================================================

export const PROJECT_TIMELINE: ProjectPhase[] = [
  { 
    phase: 1, 
    title: "Pre-Launch & Approvals", 
    duration: "Nov '25 - Jan '26 (3 Months)", 
    startDate: new Date('2025-11-01'), 
    endDate: new Date('2026-01-31'), 
    keyActions: [
        { name: "Land Acquisition", details: [
            { id: 'land-acquisition-0', text: "Final payment processed", completed: true }, 
            { id: 'land-acquisition-1', text: "Title deed registered", completed: true }, 
            { id: 'land-acquisition-2', text: "Land mutation completed", completed: true }
        ] },
        { name: "Zila Panchayat Approval", details: [
            { id: 'approvals-0', text: "Submission of layout plan", completed: true }, 
            { id: 'approvals-1', text: "Public hearing completed", completed: true }, 
            { id: 'approvals-2', text: "Final approval letter received", completed: true }
        ] },
        { name: "UPRERA Registration", details: [
            { id: 'rera-0', text: "Application filed with all documents", completed: true }, 
            { id: 'rera-1', text: "Registration number obtained", completed: true }, 
            { id: 'rera-2', text: "Project details updated on UPRERA portal", completed: false }
        ] }
    ], 
    deliverables: ["Approved Site Plan", "RERA Certificate"], 
    tasks: [{id: 't1-1', text: 'Submit final layout to ZP', completed: true}] 
  },
  { 
    phase: 2, 
    title: "Infrastructure Development", 
    duration: "Feb '26 - Jun '26 (5 Months)", 
    startDate: new Date('2026-02-01'), 
    endDate: new Date('2026-06-30'), 
    keyActions: [
        { name: "Roads & Drainage", details: [
            { id: 'infrastructure-0', text: "WMM laying for main roads", completed: true }, 
            { id: 'infrastructure-1', text: "Curbstone installation", completed: false }, 
            { id: 'infrastructure-2', text: "Stormwater drain construction", completed: false }
        ] },
        { name: "Water & Sewer Lines", details: [
            { id: 'infrastructure-5', text: "Main water pipeline testing", completed: false }, 
            { id: 'infrastructure-3', text: "Sewer network laying", completed: false }, 
        ] },
        { name: "Electrical Infrastructure", details: [
            { id: 'infrastructure-4', text: "Laying of underground cables", completed: false }, 
            { id: 'utilities-3', text: "Transformer Yard Work", completed: false }, 
            { id: 'boundary-security-4', text: "Streetlight pole erection", completed: false }
        ] }
    ], 
    deliverables: ["Completed Road Network", "Functional Utilities"], 
    tasks: [{id: 't2-1', text: 'Award road contract', completed: true}, {id: 't2-2', text: 'Procure transformers', completed: false}] 
  },
  { 
    phase: 3, 
    title: "Landscaping & Amenities", 
    duration: "Jul '26 - Nov '26 (5 Months)", 
    startDate: new Date('2026-07-01'), 
    endDate: new Date('2026-11-30'), 
    keyActions: [
        { name: "Park Development", details: [
            { id: 'landscaping-0', text: "Topsoil filling and leveling", completed: false }, 
            { id: 'landscaping-1', text: "Planting of trees and shrubs", completed: false }, 
            { id: 'landscaping-3', text: "Installation of benches and play equipment", completed: false }
        ] },
        { name: "Clubhouse Construction", details: [
            { id: 'amenities-0', text: "Foundation and structural work", completed: false }, 
            { id: 'amenities-1', text: "Brickwork and plastering", completed: false }, 
            { id: 'amenities-4', text: "Interior finishing initiated", completed: false }
        ] },
        { name: "Boundary Wall", details: [
            { id: 'boundary-security-0', text: "Foundation work completed", completed: false }, 
            { id: 'boundary-security-1', text: "Brickwork up to 7ft height", completed: false }, 
            { id: 'boundary-security-5', text: "Plastering and coping", completed: false }
        ] }
    ], 
    deliverables: ["Landscaped Parks", "Operational Clubhouse"], 
    tasks: [] 
  },
  { 
    phase: 4, 
    title: "Handover & Completion", 
    duration: "Dec '26 - Apr '27 (5 Months)", 
    startDate: new Date('2026-12-01'), 
    endDate: new Date('2027-04-30'), 
    keyActions: [
        { name: "Plot Demarcation", details: [
            { id: 'completion-0', text: "Survey and marking of all plots", completed: false }, 
            { id: 'completion-1', text: "Installation of demarcation pillars", completed: false }, 
            { id: 'completion-2', text: "Verification of plot dimensions", completed: false }
        ] },
        { name: "Final Inspections", details: [
            { id: 'completion-3', text: "Internal quality check", completed: false }, 
            { id: 'completion-4', text: "Authority inspection for completion certificate", completed: false }, 
            { id: 'completion-5', text: "Utility connections final check", completed: false }
        ] },
        { name: "Possession Offered", details: [
            { id: 'completion-6', text: "Preparation of handover kits", completed: false }, 
            { id: 'completion-7', text: "Issuing possession letters to buyers", completed: false }, 
            { id: 'completion-8', text: "Initiating registry process", completed: false }
        ] }
    ], 
    deliverables: ["Handover Letters", "Project Completion Certificate"], 
    tasks: [] 
  },
];

export const RISK_ASSESSMENT_DATA = [
  { risk: 'Approval Delays', mitigation: 'Proactive follow-ups with authorities; liaison officer appointed.' },
  { risk: 'Construction Cost Overruns', mitigation: 'Fixed-price contracts with vendors; regular budget reviews.' },
  { risk: 'Sales Velocity Slowdown', mitigation: 'Aggressive marketing campaigns; flexible payment plans.' },
  { risk: 'Supply Chain Disruptions', mitigation: 'Multiple supplier tie-ups; buffer stock for critical items.' },
];

export const DOCUMENT_DATA: DocumentFolder[] = [
  { id: 'folder-1', name: 'Legal & Approvals', documents: [
    { id: 'doc-1', name: 'Land_Title_Deed.pdf', type: 'PDF', size: '2.1 MB', uploadDate: '2025-11-10', linkedTo: 'Land Acquisition' },
    { id: 'doc-2', 'name': 'ZP_Approval_Letter.pdf', type: 'PDF', size: '1.5 MB', uploadDate: '2025-11-28' },
    { id: 'doc-3', 'name': 'UPRERA_Certificate.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2026-01-14' },
    { id: 'doc-4', 'name': 'Environmental_Clearance.pdf', type: 'PDF', size: '3.5 MB', uploadDate: '2025-12-05' },
  ]},
  { id: 'folder-2', name: 'Sales Documents', documents: [
    { id: 'doc-5', name: 'Plot_A-01_Booking_Form.pdf', type: 'PDF', size: '0.8 MB', uploadDate: '2026-01-20', linkedTo: 'Plot A-01' },
    { id: 'doc-6', name: 'Plot_B-12_Agreement.docx', type: 'DOCX', size: '0.2 MB', uploadDate: '2026-02-01', linkedTo: 'Plot B-12' },
  ]},
  { id: 'folder-3', name: 'Marketing Materials', documents: [
    { id: 'doc-7', name: 'Project_Brochure_Final.pdf', type: 'PDF', size: '15.2 MB', uploadDate: '2025-12-15' },
    { id: 'doc-8', name: 'Site_Layout_HighRes.jpg', type: 'JPG', size: '8.7 MB', uploadDate: '2025-12-10' },
  ]}
];

// =================================================================
// Site & Operations Data
// =================================================================

export const INVENTORY_DATA: InventoryItem[] = [
  { id: 'INV-001', name: 'Cement (OPC 43 Grade)', category: 'Civil Works', unit: 'Bags', quantityInStock: 500, reorderLevel: 200, supplier: 'UltraTech Cement', lastOrdered: '2026-02-10' },
  { id: 'INV-002', name: 'TMT Steel Bars (8mm)', category: 'Civil Works', unit: 'Tons', quantityInStock: 15, reorderLevel: 10, supplier: 'Tata Tiscon', lastOrdered: '2026-01-25' },
  { id: 'INV-003', name: 'PVC Pipes (4 inch)', category: 'Plumbing', unit: 'Meters', quantityInStock: 800, reorderLevel: 300, supplier: 'Supreme Industries', lastOrdered: '2026-02-05' },
  { id: 'INV-004', name: 'Electrical Wire (2.5 sqmm)', category: 'Electrical', unit: 'Meters', quantityInStock: 2500, reorderLevel: 1000, supplier: 'Finolex Cables', lastOrdered: '2026-02-01' },
  { id: 'INV-005', name: 'Emulsion Paint (Exterior)', category: 'Finishing', unit: 'Liters', quantityInStock: 150, reorderLevel: 50, supplier: 'Asian Paints', lastOrdered: '2026-01-30' },
];

export const DPR_WORK_ITEMS: Record<string, string[]> = {
  "Site Preparation": ["Site Clearing", "Excavation Works", "Grading & Leveling", "Debris Removal"],
  "Infrastructure": ["Road Base Course", "Roadside Curbing", "Drainage System Installation", "Sewer Line Manhole Casting", "Electrical Conduit Laying", "Water Pipeline Testing"],
  "Utilities": ["Water Tank Foundation", "Septic Tank Excavation", "Main Electrical Panel Installation", "Transformer Yard Work"],
  "Landscaping": ["Topsoil Spreading", "Tree Plantation", "Park Area Curbing", "Jogging Track Leveling", "Park Irrigation Piping"],
  "Amenities": ["Clubhouse Foundation", "Clubhouse Brickwork", "Swimming Pool Excavation", "Community Hall Structure"],
  "Boundary & Security": ["Boundary Wall Foundation", "Boundary Wall Brickwork", "Fencing Installation", "Main Gate Pillar Construction", "Streetlight pole erection", "Plastering and coping"]
};

export const DPR_DATA: DPREntry[] = [
  {
    id: 'dpr-1', date: '2026-02-14', weather: 'Sunny',
    manpower: { supervisors: 2, skilledWorkers: 15, unskilledWorkers: 35 },
    workProgress: [
        { id: 'site-preparation-0', text: 'Site Clearing', completed: true, category: 'Site Preparation' },
        { id: 'site-preparation-1', text: 'Excavation Works', completed: true, category: 'Site Preparation' },
        { id: 'infrastructure-0', text: 'Road Base Course', completed: true, category: 'Infrastructure' },
        { id: 'infrastructure-1', text: 'Drainage System Installation', completed: false, category: 'Infrastructure' },
        { id: 'boundary-security-0', text: 'Boundary Wall Foundation', completed: false, category: 'Boundary & Security' }
    ],
    materialsConsumed: [ { itemId: 'INV-001', quantity: 50, unit: 'Bags' }, { itemId: 'INV-002', quantity: 2, unit: 'Tons' } ],
    equipmentUsed: [ { equipmentName: 'JCB', hours: 8 }, { equipmentName: 'Tractor', hours: 10 } ],
    hindrances: 'Minor delay due to temporary water logging in sector B.',
    submittedBy: 'Ravi Sharma (Supervisor)',
  },
   {
    id: 'dpr-2', date: '2026-02-13', weather: 'Cloudy',
    manpower: { supervisors: 2, skilledWorkers: 12, unskilledWorkers: 30 },
    workProgress: [
        { id: 'site-preparation-0', text: 'Site Clearing', completed: true, category: 'Site Preparation' },
        { id: 'site-preparation-1', text: 'Excavation Works', completed: false, category: 'Site Preparation' },
        { id: 'boundary-security-0', text: 'Boundary Wall Foundation', completed: false, category: 'Boundary & Security' }
    ],
    materialsConsumed: [ { itemId: 'INV-001', quantity: 20, unit: 'Bags' } ],
    equipmentUsed: [ { equipmentName: 'JCB', hours: 6 } ],
    hindrances: '',
    submittedBy: 'Ravi Sharma (Supervisor)',
  }
];

// =================================================================
// HR & Employee Data
// =================================================================

export const EMPLOYEE_DATA: Employee[] = [
  { id: 'EMP-001', name: 'Rajesh Mehra', photoUrl: 'https://picsum.photos/seed/1/100', role: 'Senior Project Manager', department: 'Management', email: 'rajesh.m@example.com', phone: '9876543210', hireDate: '2025-10-15', salary: 150000, status: 'Active' },
  { id: 'EMP-002', name: 'Sunita Sharma', photoUrl: 'https://picsum.photos/seed/2/100', role: 'Lead Sales Executive', department: 'Sales', email: 'sunita.s@example.com', phone: '9123456789', hireDate: '2025-11-01', salary: 85000, status: 'Active' },
  { id: 'EMP-003', name: 'Amit Kumar', photoUrl: 'https://picsum.photos/seed/3/100', role: 'Site Supervisor', department: 'Site Operations', email: 'amit.k@example.com', phone: '8765432109', hireDate: '2025-11-20', salary: 60000, status: 'On Leave' },
  { id: 'EMP-004', name: 'Priya Patel', photoUrl: 'https://picsum.photos/seed/4/100', role: 'HR Manager', department: 'HR & Admin', email: 'priya.p@example.com', phone: '7890123456', hireDate: '2025-10-25', salary: 95000, status: 'Active' },
  { id: 'EMP-005', name: 'Vikram Singh', photoUrl: 'https://picsum.photos/seed/5/100', role: 'Senior Civil Engineer', department: 'Engineering', email: 'vikram.s@example.com', phone: '9988776655', hireDate: '2025-11-05', salary: 120000, status: 'Active' },
];


// =================================================================
// Messaging Data
// =================================================================
export const MESSAGE_DATA: Message[] = [
  { id: 'msg-1', senderId: 'EMP-001', receiverId: 'EMP-003', text: 'Amit, can you send over the DPR for today?', timestamp: '2026-02-14T10:00:00Z', read: true },
  { id: 'msg-2', senderId: 'EMP-003', receiverId: 'EMP-001', text: 'Yes sir, just finalizing the material consumption. Will submit it in 15 minutes.', timestamp: '2026-02-14T10:01:00Z', read: true },
  { id: 'msg-3', senderId: 'EMP-001', receiverId: 'EMP-003', text: 'Excellent. Also, check the stock for OPC 43 grade cement. I saw an alert.', timestamp: '2026-02-14T10:02:00Z', read: true },
  { id: 'msg-4', senderId: 'EMP-003', receiverId: 'EMP-001', text: 'Will do.', timestamp: '2026-02-14T10:03:00Z', read: false },
  
  { id: 'msg-5', senderId: 'EMP-002', receiverId: 'EMP-001', text: 'Rajesh, the client for A-25 is asking for a small discount. What should I quote?', timestamp: '2026-02-13T15:30:00Z', read: true },
  { id: 'msg-6', senderId: 'EMP-001', receiverId: 'EMP-002', text: 'We can offer a 2% discount on the base price if they book this week. Not more.', timestamp: '2026-02-13T15:35:00Z', read: true },
  
  { id: 'msg-7', senderId: 'EMP-004', receiverId: 'EMP-001', text: 'The payroll for February has been processed.', timestamp: '2026-02-15T11:00:00Z', read: false },
  
  { id: 'msg-8', senderId: 'EMP-005', receiverId: 'EMP-003', text: 'The latest structural drawings for the clubhouse are in the documents folder. Please refer to version 2.1.', timestamp: '2026-02-12T09:00:00Z', read: true },
];