// FIX: Removed incorrect import of 'View' from './App' which was causing a circular dependency.
// The 'View' enum is defined and exported from this file.

export enum View {
  Dashboard = 'Dashboard',
  SiteLayout = 'Site Layout',
  Financials = 'Financials',
  Sales = 'Sales',
  Timeline = 'Project Timeline',
  SalesPipeline = 'Sales Pipeline',
  Brokers = 'Broker Management',
  Documents = 'Documents',
  Inventory = 'Inventory',
  DPR = 'Daily Progress Report',
  Employees = 'Employee Management',
  Messaging = 'Messaging',
}

export enum UserRole {
  CEO = 'CEO',
  ProjectManager = 'Project Manager',
  Supervisor = 'Supervisor',
  StoreManager = 'Store Manager',
  HR = 'HR',
}

export enum NotificationType {
  Alert,
  Info,
  Success,
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  date: Date;
  read: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectPhase {
  phase: number;
  title: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  keyActions: { name: string; details: { id: string; text: string; completed: boolean }[] }[];
  deliverables: string[];
  tasks?: Task[];
}

export type LeadStatus = 'New Lead' | 'Contacted' | 'Site Visit Scheduled' | 'Negotiation' | 'Booked' | 'Converted' | 'Lost';

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  notes: string;
  agent: string;
}

export interface Lead {
  id: number;
  name: string;
  status: LeadStatus;
  source: string;
  lastContacted: string;
  interest: string;
  value: number;
  brokerId?: number;
  activities?: Activity[];
}

export interface Broker {
  id: number;
  name: string;
  reraNo: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  commissionRate: number; // Percentage
  dealsClosed: number;
  totalBusiness: number; // in INR
}

export type PlotStatus = 'Available' | 'Booked' | 'Sold';

export interface Plot {
  id: string; // e.g., 'A-01'
  size: number; // in sq. ft.
  status: PlotStatus;
  pricePerSqFt: number;
  buyerId?: number; // Corresponds to a Lead ID
  brokerId?: number; // Corresponds to a Broker ID
  isCorner?: boolean;
  isParkFacing?: boolean;
}

export interface CostCategory {
  name: string;
  value: number; // Budgeted Value
  actual: number; // Actual Spend
  color: string;
  department: Department;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'JPG' | 'PNG';
  size: string; // e.g., '2.3 MB'
  uploadDate: string;
  linkedTo?: string; // e.g., Plot ID 'A-01' or Lead ID '3'
}

export interface DocumentFolder {
  id: string;
  name: string;
  documents: ProjectDocument[];
}

export type InventoryCategory = 'Civil Works' | 'Electrical' | 'Plumbing' | 'Finishing' | 'Machinery';
export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    unit: 'Bags' | 'Tons' | 'Meters' | 'Liters' | 'Units' | 'Hours';
    quantityInStock: number;
    reorderLevel: number;
    supplier: string;
    lastOrdered: string; // YYYY-MM-DD
}

export interface WorkProgress {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}


export interface DPREntry {
  id: string;
  date: string; // YYYY-MM-DD
  weather: 'Sunny' | 'Cloudy' | 'Rainy' | 'Windy';
  manpower: {
    supervisors: number;
    skilledWorkers: number;
    unskilledWorkers: number;
  };
  workProgress: WorkProgress[];
  materialsConsumed: Array<{ itemId: string; quantity: number; unit: InventoryItem['unit'] }>;
  equipmentUsed: Array<{ equipmentName: string; hours: number }>;
  hindrances: string;
  submittedBy: string; // Name of submitter
}

export type Department = 'Management' | 'Engineering' | 'Sales' | 'HR & Admin' | 'Site Operations';

export interface Employee {
  id: string; // e.g., 'EMP-001'
  name: string;
  photoUrl: string;
  role: string; // e.g., 'Senior Civil Engineer', 'Sales Executive'
  department: Department;
  email: string;
  phone: string;
  hireDate: string; // 'YYYY-MM-DD'
  salary: number; // Monthly salary in INR
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface Message {
    id: string;
    senderId: string; // Employee ID
    receiverId: string; // Employee ID
    text: string;
    timestamp: string; // ISO 8601 string
    read: boolean;
}