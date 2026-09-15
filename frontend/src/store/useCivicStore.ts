import { create } from 'zustand';
import { 
  User, 
  UserRole, 
  Complaint, 
  Department, 
  Ministry,
  MinistryDirective,
  CityZone, 
  ComplaintCategory, 
  FieldWorker, 
  StatusHistoryItem, 
  ComplaintComment, 
  NotificationItem, 
  CityHealthScore, 
  EmergencyAlert,
  ComplaintStatus,
  PriorityLevel,
  SeverityLevel,
  DigiLockerVerificationRecord
} from '@/types';
import { calculateDeterministicPriority } from '@/lib/utils';

// Initial Mock Seed Data (Synced with Database Migrations & MongoDB collections)
const INITIAL_USERS: Record<UserRole, User> = {
  CITIZEN: {
    id: 'c1000000-0000-0000-0000-000000000001',
    email: 'citizen@civicpulse.gov.in',
    firstName: 'Rahul',
    lastName: 'Sharma',
    phone: '+91-9829012345',
    role: 'CITIZEN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    reputationPoints: 145,
    zoneId: 'b1000000-0000-0000-0000-000000000001',
    zoneName: 'Mansarovar Zone',
    isVerified: true,
    digiLockerVerified: true,
    govIdType: 'AADHAAR',
    govIdNumber: 'XXXX-XXXX-4921',
  },
  OFFICIAL: {
    id: 'c1000000-0000-0000-0000-000000000002',
    email: 'official@civicpulse.gov.in',
    firstName: 'Rajesh Kumar',
    lastName: 'Sharma',
    phone: '+91-141-2740001',
    role: 'OFFICIAL',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    departmentId: 'a1000000-0000-0000-0000-000000000001',
    departmentName: 'Roads & Infrastructure',
    employeeId: 'JMC-ENG-2024-089',
    designation: 'Executive Engineer (Roads)',
    isVerified: true,
    digiLockerVerified: true,
    digiLockerDocId: 'DL-JMC-OFF-99201',
    officerCadre: 'State Engineering Service (SES Rajasthan)',
  },
  MINISTRY: {
    id: 'c1000000-0000-0000-0000-000000000003',
    email: 'ministry@civicpulse.gov.in',
    firstName: 'Dr. Jogaram',
    lastName: 'IAS',
    phone: '+91-141-2227280',
    role: 'MINISTRY',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    ministryId: 'min-dlb-raj',
    ministryName: 'Department of Local Self Government (DLB Rajasthan)',
    designation: 'Principal Secretary (Urban Development)',
    isVerified: true,
    digiLockerVerified: true,
    digiLockerDocId: 'DL-IAS-CADRE-RAJ-1998',
    officerCadre: 'Indian Administrative Service (IAS)',
  },
  FIELD_WORKER: {
    id: 'c1000000-0000-0000-0000-000000000004',
    email: 'worker@civicpulse.gov.in',
    firstName: 'Amit',
    lastName: 'Kumar',
    phone: '+91-9414056789',
    role: 'FIELD_WORKER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    departmentId: 'a1000000-0000-0000-0000-000000000001',
    departmentName: 'Roads & Infrastructure',
    employeeId: 'FW-ROADS-042',
    designation: 'Lead Pothole Repair Tech',
    isVerified: true,
  },
  ADMIN: {
    id: 'c1000000-0000-0000-0000-000000000006',
    email: 'admin@civicpulse.gov.in',
    firstName: 'Vikramaditya',
    lastName: 'Rathore',
    phone: '+91-141-2740000',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    designation: 'Municipal Commissioner (Jaipur)',
    isVerified: true,
    digiLockerVerified: true,
  },
};

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', name: 'Roads & Infrastructure', code: 'ROADS', description: 'Road maintenance, potholes, and pavements', headName: 'Rajesh Kumar Sharma', phone: '+91-141-2740001', email: 'roads@jaipur.gov.in', colorHex: '#F97316', activeComplaintsCount: 14, resolvedCount: 182, slaComplianceRate: 92, totalBudgetCr: 85.0, workforceCount: 210 },
  { id: 'a1000000-0000-0000-0000-000000000002', name: 'Sanitation & Waste Mgmt', code: 'SANITATION', description: 'Garbage disposal, cleanliness, dump clearing', headName: 'Priya Meena', phone: '+91-141-2740002', email: 'sanitation@jaipur.gov.in', colorHex: '#22C55E', activeComplaintsCount: 22, resolvedCount: 310, slaComplianceRate: 88, totalBudgetCr: 65.0, workforceCount: 380 },
  { id: 'a1000000-0000-0000-0000-000000000003', name: 'Water Supply Department', code: 'WATER', description: 'Water pipeline maintenance, leakage, pressure', headName: 'Suresh Verma', phone: '+91-141-2740003', email: 'water@jaipur.gov.in', colorHex: '#3B82F6', activeComplaintsCount: 9, resolvedCount: 140, slaComplianceRate: 95, totalBudgetCr: 110.0, workforceCount: 145 },
  { id: 'a1000000-0000-0000-0000-000000000004', name: 'Drainage & Sewage', code: 'DRAINAGE', description: 'Stormwater drains, sewage overflow', headName: 'Anita Gupta', phone: '+91-141-2740004', email: 'drainage@jaipur.gov.in', colorHex: '#8B5CF6', activeComplaintsCount: 11, resolvedCount: 95, slaComplianceRate: 84, totalBudgetCr: 45.0, workforceCount: 90 },
  { id: 'a1000000-0000-0000-0000-000000000005', name: 'Electrical Department', code: 'ELECTRICAL', description: 'Streetlights, electrical hazards, transformers', headName: 'Vikram Singh Rathore', phone: '+91-141-2740005', email: 'electrical@jaipur.gov.in', colorHex: '#EAB308', activeComplaintsCount: 7, resolvedCount: 220, slaComplianceRate: 96, totalBudgetCr: 38.0, workforceCount: 110 },
  { id: 'a1000000-0000-0000-0000-000000000006', name: 'Traffic Management', code: 'TRAFFIC', description: 'Traffic signals, zebra crossings, signboards', headName: 'Deepak Yadav', phone: '+91-141-2740006', email: 'traffic@jaipur.gov.in', colorHex: '#F59E0B', activeComplaintsCount: 5, resolvedCount: 78, slaComplianceRate: 91, totalBudgetCr: 28.0, workforceCount: 80 },
  { id: 'a1000000-0000-0000-0000-000000000007', name: 'Parks & Recreation', code: 'PARKS', description: 'Public parks, fallen trees, playgrounds', headName: 'Sunita Agarwal', phone: '+91-141-2740007', email: 'parks@jaipur.gov.in', colorHex: '#16A34A', activeComplaintsCount: 4, resolvedCount: 65, slaComplianceRate: 94, totalBudgetCr: 20.0, workforceCount: 60 },
  { id: 'a1000000-0000-0000-0000-000000000008', name: 'Emergency Response', code: 'EMERGENCY', description: 'Disaster response, building collapses, flash floods', headName: 'Col. Manoj Kapoor (Rtd)', phone: '+91-141-2740008', email: 'emergency@jaipur.gov.in', colorHex: '#EF4444', activeComplaintsCount: 2, resolvedCount: 45, slaComplianceRate: 99, totalBudgetCr: 30.0, workforceCount: 75 },
];

const INITIAL_MINISTRIES: Ministry[] = [
  {
    id: 'min-mohua',
    name: 'Ministry of Housing and Urban Affairs (MoHUA)',
    code: 'MOHUA_CENTRAL',
    jurisdiction: 'CENTRAL',
    ministerInCharge: 'Manohar Lal Khattar',
    secretaryName: 'Srinivas Katikithala, IAS',
    contactEmail: 'secymohua@nic.in',
    phone: '+91-11-23061179',
    monitoredDepartments: ['ROADS', 'SANITATION', 'DRAINAGE', 'WATER'],
    totalAllocatedBudgetCr: 1250.0,
    complianceRating: 95.2,
    activeDirectivesCount: 6,
    description: 'Apex Central Ministry overseeing National Smart Cities Mission, AMRUT 2.0, and Swachh Bharat Urban across India.',
  },
  {
    id: 'min-dlb-raj',
    name: 'Department of Local Self Government (DLB Rajasthan)',
    code: 'DLB_RAJASTHAN',
    jurisdiction: 'STATE',
    ministerInCharge: 'Jhabar Singh Kharra',
    secretaryName: 'Dr. Jogaram, IAS',
    contactEmail: 'dlbrajasthan@rajasthan.gov.in',
    phone: '+91-141-2227280',
    monitoredDepartments: ['ROADS', 'SANITATION', 'WATER', 'DRAINAGE', 'ELECTRICAL', 'TRAFFIC', 'PARKS', 'EMERGENCY'],
    totalAllocatedBudgetCr: 450.0,
    complianceRating: 91.8,
    activeDirectivesCount: 4,
    description: 'State Urban Ministry directly administering municipal corporations and development authorities in Rajasthan.',
  },
];

const INITIAL_DIRECTIVES: MinistryDirective[] = [
  {
    id: 'dir-101',
    ministryId: 'min-mohua',
    title: 'Monsoon Zero-Waterlogging Drainage De-silting Drive',
    description: 'All primary trunk stormwater drains to be 100% de-silted and geotagged before July 15 under national urban flood protocol.',
    priority: 'HIGH_PRIORITY',
    issuedAt: '2026-05-10T10:00:00Z',
    targetDepartmentCode: 'DRAINAGE',
    status: 'IN_COMPLIANCE',
  },
  {
    id: 'dir-102',
    ministryId: 'min-dlb-raj',
    title: 'Mandatory 48-Hour Pothole Repair Guarantee in Heritage Zones',
    description: 'Heritage Walled City road repair SLA tightened to 48 hours to preserve tourist footfall and commercial transit corridors.',
    priority: 'URGENT_CRISIS',
    issuedAt: '2026-06-01T14:30:00Z',
    targetDepartmentCode: 'ROADS',
    status: 'IN_COMPLIANCE',
  },
  {
    id: 'dir-103',
    ministryId: 'min-mohua',
    title: 'Swachh Vayu Smart Sensor Air Quality Integration',
    description: 'Deploy real-time PM2.5 dust suppression mist cannons on major arterial rings in Malviya Nagar & Mansarovar.',
    priority: 'ROUTINE',
    issuedAt: '2026-06-15T09:00:00Z',
    targetDepartmentCode: 'SANITATION',
    status: 'PENDING_ACKNOWLEDGEMENT',
  },
];

const INITIAL_CATEGORIES: ComplaintCategory[] = [
  { id: 'cat-1', name: 'Pothole & Road Damage', code: 'POTHOLE', description: 'Deep potholes and broken road surfaces', iconName: 'Activity', defaultPriority: 'HIGH', slaHours: 48, categoryWeight: 1.8 },
  { id: 'cat-2', name: 'Water Pipe Rupture / Leakage', code: 'WATER_LEAKAGE', description: 'Drinking water pipeline bursts and leaks', iconName: 'Droplets', defaultPriority: 'HIGH', slaHours: 24, categoryWeight: 1.9 },
  { id: 'cat-3', name: 'Garbage & Waste Accumulation', code: 'GARBAGE', description: 'Overflowing dustbins and unattended waste', iconName: 'Trash2', defaultPriority: 'MEDIUM', slaHours: 24, categoryWeight: 1.2 },
  { id: 'cat-4', name: 'Non-Functional Streetlight', code: 'STREETLIGHT', description: 'Broken street lamps and dark corridors', iconName: 'Lightbulb', defaultPriority: 'MEDIUM', slaHours: 48, categoryWeight: 1.1 },
  { id: 'cat-5', name: 'Drainage Overflow / Waterlogging', code: 'DRAINAGE', description: 'Blocked drains and street waterlogging', iconName: 'Waves', defaultPriority: 'HIGH', slaHours: 36, categoryWeight: 1.7 },
  { id: 'cat-6', name: 'Electrical Hazard / Exposed Wire', code: 'ELECTRICAL_HAZARD', description: 'Hanging live wires and open electric junction boxes', iconName: 'Zap', defaultPriority: 'CRITICAL', slaHours: 12, categoryWeight: 2.2 },
  { id: 'cat-7', name: 'Traffic Signal Failure', code: 'TRAFFIC_SIGNAL', description: 'Faulty traffic signals causing jam', iconName: 'AlertTriangle', defaultPriority: 'HIGH', slaHours: 12, categoryWeight: 2.0 },
  { id: 'cat-8', name: 'Fallen Tree / Blocked Way', code: 'FALLEN_TREE', description: 'Fallen trees or heavy branches blocking roads', iconName: 'Trees', defaultPriority: 'HIGH', slaHours: 18, categoryWeight: 1.5 },
];

const INITIAL_ZONES: CityZone[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Mansarovar Zone', code: 'ZONE_MANSAROVAR', population: 420000, areaSqkm: 32.5, healthScore: 86, openIssuesCount: 12, criticalPotholesCount: 4, waterSupplyCoveragePct: 96, sanitationFrequencyPerWeek: 7, zonalOfficerName: 'R. K. Meena', zonalOfficeContact: '+91-141-2741101' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'Malviya Nagar Zone', code: 'ZONE_MALVIYA', population: 350000, areaSqkm: 24.8, healthScore: 89, openIssuesCount: 8, criticalPotholesCount: 2, waterSupplyCoveragePct: 98, sanitationFrequencyPerWeek: 7, zonalOfficerName: 'Sunita Choudhary', zonalOfficeContact: '+91-141-2741102' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'Vaishali Nagar Zone', code: 'ZONE_VAISHALI', population: 290000, areaSqkm: 21.0, healthScore: 82, openIssuesCount: 15, criticalPotholesCount: 6, waterSupplyCoveragePct: 92, sanitationFrequencyPerWeek: 6, zonalOfficerName: 'Harish Tanwar', zonalOfficeContact: '+91-141-2741103' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'Walled City (Heritage)', code: 'ZONE_WALLED_CITY', population: 480000, areaSqkm: 14.2, healthScore: 78, openIssuesCount: 24, criticalPotholesCount: 9, waterSupplyCoveragePct: 88, sanitationFrequencyPerWeek: 6, zonalOfficerName: 'Kailash Chand', zonalOfficeContact: '+91-141-2741104' },
  { id: 'b1000000-0000-0000-0000-000000000005', name: 'C-Scheme & Civil Lines', code: 'ZONE_CSCHEME', population: 180000, areaSqkm: 18.5, healthScore: 94, openIssuesCount: 4, criticalPotholesCount: 1, waterSupplyCoveragePct: 99, sanitationFrequencyPerWeek: 7, zonalOfficerName: 'Anil Bhardwaj', zonalOfficeContact: '+91-141-2741105' },
];

const INITIAL_WORKERS: FieldWorker[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    userId: 'c1000000-0000-0000-0000-000000000004',
    name: 'Amit Kumar',
    email: 'worker@civicpulse.gov.in',
    phone: '+91-9414056789',
    departmentId: 'a1000000-0000-0000-0000-000000000001',
    departmentName: 'Roads & Infrastructure',
    employeeId: 'EMP-ROADS-042',
    specialization: 'Asphalt Repair & Heavy Pothole Patching',
    isAvailable: true,
    latitude: 26.8520,
    longitude: 75.7680,
    totalTasks: 28,
    completedTasks: 25,
    rating: 4.85,
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    userId: 'c1000000-0000-0000-0000-000000000005',
    name: 'Ramesh Verma',
    email: 'worker.water@civicpulse.gov.in',
    phone: '+91-9414088990',
    departmentId: 'a1000000-0000-0000-0000-000000000003',
    departmentName: 'Water Supply Department',
    employeeId: 'EMP-WATER-108',
    specialization: 'High Pressure Pipe Welding & Valve Replacement',
    isAvailable: true,
    latitude: 26.8620,
    longitude: 75.8050,
    totalTasks: 34,
    completedTasks: 31,
    rating: 4.70,
  }
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'f1000000-0000-0000-0000-000000000001',
    complaintNumber: 'CP-2026-00101',
    citizenId: 'c1000000-0000-0000-0000-000000000001',
    citizenName: 'Rahul Sharma',
    categoryId: 'cat-1',
    categoryName: 'Pothole & Road Damage',
    categoryCode: 'POTHOLE',
    departmentId: 'a1000000-0000-0000-0000-000000000001',
    departmentName: 'Roads & Infrastructure',
    departmentColor: '#F97316',
    zoneId: 'b1000000-0000-0000-0000-000000000001',
    zoneName: 'Mansarovar Zone',
    title: 'Dangerous 2-foot Deep Pothole on Main Madhyam Marg',
    description: 'Large deep pothole creating severe traffic hazard and multiple near-miss accidents right near the central market crossroad.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    severity: 'HIGH',
    affectedCount: 150,
    latitude: 26.8548,
    longitude: 75.7645,
    address: 'Near Crossroad 4, Madhyam Marg, Mansarovar',
    landmark: 'Opposite SBI Bank',
    city: 'Jaipur',
    pincode: '302020',
    images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'],
    slaDeadline: new Date(Date.now() + 18 * 3600000).toISOString(),
    slaBreached: false,
    isEmergency: false,
    assignedWorkerId: 'e1000000-0000-0000-0000-000000000001',
    assignedWorkerName: 'Amit Kumar',
    upvotes: 42,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000002',
    complaintNumber: 'CP-2026-00102',
    citizenId: 'c1000000-0000-0000-0000-000000000001',
    citizenName: 'Rahul Sharma',
    categoryId: 'cat-2',
    categoryName: 'Water Pipe Rupture / Leakage',
    categoryCode: 'WATER_LEAKAGE',
    departmentId: 'a1000000-0000-0000-0000-000000000003',
    departmentName: 'Water Supply Department',
    departmentColor: '#3B82F6',
    zoneId: 'b1000000-0000-0000-0000-000000000002',
    zoneName: 'Malviya Nagar Zone',
    title: 'Underground Main Pipeline Burst Flooding Road',
    description: 'Drinking water pipeline ruptured under sidewalk, thousands of liters overflowing onto the road causing low water pressure in sector 3.',
    status: 'ASSIGNED',
    priority: 'CRITICAL',
    severity: 'CRITICAL',
    affectedCount: 600,
    latitude: 26.8582,
    longitude: 75.8165,
    address: 'Sector 3, Gaurav Tower Road, Malviya Nagar',
    landmark: 'Near GT Central Mall',
    city: 'Jaipur',
    pincode: '302017',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'],
    slaDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
    slaBreached: false,
    isEmergency: false,
    assignedWorkerId: 'e1000000-0000-0000-0000-000000000002',
    assignedWorkerName: 'Ramesh Verma',
    upvotes: 89,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000003',
    complaintNumber: 'CP-2026-00103',
    citizenId: 'c1000000-0000-0000-0000-000000000001',
    citizenName: 'Rahul Sharma',
    categoryId: 'cat-3',
    categoryName: 'Garbage & Waste Accumulation',
    categoryCode: 'GARBAGE',
    departmentId: 'a1000000-0000-0000-0000-000000000002',
    departmentName: 'Sanitation & Waste Mgmt',
    departmentColor: '#22C55E',
    zoneId: 'b1000000-0000-0000-0000-000000000003',
    zoneName: 'Vaishali Nagar Zone',
    title: 'Uncollected Commercial Waste Accumulating on Queens Road',
    description: 'Garbage collection bin overflowing for 4 consecutive days, spreading foul odor and attracting stray cattle.',
    status: 'REPORT_SUBMITTED',
    priority: 'MEDIUM',
    severity: 'MEDIUM',
    affectedCount: 80,
    latitude: 26.9015,
    longitude: 75.7482,
    address: 'Queens Road, Vaishali Nagar',
    landmark: 'Near Community Park Gate 2',
    city: 'Jaipur',
    pincode: '302021',
    images: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80'],
    slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
    slaBreached: false,
    isEmergency: false,
    upvotes: 18,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000004',
    complaintNumber: 'CP-2026-00104',
    citizenId: 'c1000000-0000-0000-0000-000000000001',
    citizenName: 'Rahul Sharma',
    categoryId: 'cat-4',
    categoryName: 'Non-Functional Streetlight',
    categoryCode: 'STREETLIGHT',
    departmentId: 'a1000000-0000-0000-0000-000000000005',
    departmentName: 'Electrical Department',
    departmentColor: '#EAB308',
    zoneId: 'b1000000-0000-0000-0000-000000000004',
    zoneName: 'Walled City (Heritage)',
    title: 'Entire 500m Stretch of Johari Bazaar in Total Darkness',
    description: '6 consecutive sodium streetlight poles defective, posing safety concerns for pedestrians and night market shoppers.',
    status: 'RESOLVED',
    priority: 'HIGH',
    severity: 'HIGH',
    affectedCount: 320,
    latitude: 26.9205,
    longitude: 75.8285,
    address: 'Johari Bazaar, Near Hawa Mahal, Walled City',
    landmark: 'Opposite LMB Sweets',
    city: 'Jaipur',
    pincode: '302003',
    images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80'],
    slaDeadline: new Date(Date.now() - 2 * 3600000).toISOString(),
    slaBreached: false,
    isEmergency: false,
    assignedWorkerId: 'e1000000-0000-0000-0000-000000000001',
    assignedWorkerName: 'Amit Kumar',
    resolutionProofImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    resolutionNotes: 'Replaced faulty 150W LED transformer drivers and restored full street lighting.',
    upvotes: 64,
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  }
];

const INITIAL_HISTORY: StatusHistoryItem[] = [
  {
    id: 'h-1',
    complaintId: 'f1000000-0000-0000-0000-000000000001',
    fromStatus: undefined,
    toStatus: 'REPORT_SUBMITTED',
    changedBy: 'c1000000-0000-0000-0000-000000000001',
    changedByName: 'Rahul Sharma',
    changedByRole: 'CITIZEN',
    notes: 'Citizen filed issue via mobile app with GPS and photo.',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'h-2',
    complaintId: 'f1000000-0000-0000-0000-000000000001',
    fromStatus: 'REPORT_SUBMITTED',
    toStatus: 'VERIFIED',
    changedBy: 'c1000000-0000-0000-0000-000000000002',
    changedByName: 'Rajesh Kumar Sharma',
    changedByRole: 'OFFICIAL',
    notes: 'Official inspected traffic density. Priority set to HIGH.',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'h-3',
    complaintId: 'f1000000-0000-0000-0000-000000000001',
    fromStatus: 'VERIFIED',
    toStatus: 'ASSIGNED',
    changedBy: 'c1000000-0000-0000-0000-000000000002',
    changedByName: 'Rajesh Kumar Sharma',
    changedByRole: 'OFFICIAL',
    notes: 'Assigned to nearest available worker Amit Kumar with cold-mix asphalt.',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'h-4',
    complaintId: 'f1000000-0000-0000-0000-000000000001',
    fromStatus: 'ASSIGNED',
    toStatus: 'IN_PROGRESS',
    changedBy: 'c1000000-0000-0000-0000-000000000004',
    changedByName: 'Amit Kumar',
    changedByRole: 'FIELD_WORKER',
    notes: 'Work order accepted. Crew on site with asphalt roller and safety cones.',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'h-5',
    complaintId: 'f1000000-0000-0000-0000-000000000004',
    fromStatus: 'IN_PROGRESS',
    toStatus: 'RESOLVED',
    changedBy: 'c1000000-0000-0000-0000-000000000004',
    changedByName: 'Amit Kumar',
    changedByRole: 'FIELD_WORKER',
    notes: 'Replaced ballast and repaired wiring. Uploaded resolution proof photo.',
    proofImages: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const INITIAL_HEALTH: CityHealthScore = {
  overallScore: 87.4,
  status: 'GOOD',
  metrics: {
    slaComplianceRate: 91.8,
    averageResolutionTimeHours: 18.4,
    citizenSatisfactionRate: 88.5,
    openCriticalIssues: 4,
    backlogIndex: 12.2,
  },
  zoneScores: [
    { zoneId: 'b1000000-0000-0000-0000-000000000001', zoneName: 'Mansarovar', score: 86, activeCount: 12 },
    { zoneId: 'b1000000-0000-0000-0000-000000000002', zoneName: 'Malviya Nagar', score: 89, activeCount: 8 },
    { zoneId: 'b1000000-0000-0000-0000-000000000003', zoneName: 'Vaishali Nagar', score: 82, activeCount: 15 },
    { zoneId: 'b1000000-0000-0000-0000-000000000004', zoneName: 'Walled City', score: 78, activeCount: 24 },
    { zoneId: 'b1000000-0000-0000-0000-000000000005', zoneName: 'C-Scheme & Civil Lines', score: 94, activeCount: 4 },
  ],
};

interface CivicState {
  currentUser: User;
  token: string | null;
  departments: Department[];
  ministries: Ministry[];
  ministryDirectives: MinistryDirective[];
  categories: ComplaintCategory[];
  zones: CityZone[];
  workers: FieldWorker[];
  complaints: Complaint[];
  history: StatusHistoryItem[];
  comments: ComplaintComment[];
  notifications: NotificationItem[];
  cityHealth: CityHealthScore;
  healthScore: CityHealthScore;
  emergencyAlert: EmergencyAlert | null;
  verifications: DigiLockerVerificationRecord[];
  
  // Filters
  selectedZoneFilter: string | null;
  selectedDeptFilter: string | null;
  selectedStatusFilter: string | null;

  // Actions
  switchRole: (role: UserRole) => void;
  setUser: (user: User, token?: string) => void;
  logoutUser: () => void;
  addComplaint: (complaint: Partial<Complaint>) => Promise<Complaint>;
  reportComplaint: (data: Partial<Complaint> & { videos?: string[] }) => Complaint;
  assignWorker: (complaintId: string, workerId: string, instructions?: string) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, notes?: string) => void;
  workerStartJob: (complaintId: string) => void;
  workerResolveJob: (complaintId: string, proofUrl: string, notes?: string) => void;
  citizenVerifyAndClose: (complaintId: string, rating: number, feedback?: string) => void;
  citizenReopenComplaint: (complaintId: string, reason: string) => void;
  upvoteComplaint: (complaintId: string) => void;
  addComment: (complaintId: string, message: string, isInternal?: boolean) => void;
  toggleEmergencyAlert: (title: string, description: string, severity: 'MEDIUM' | 'HIGH' | 'CRITICAL') => void;
  deactivateEmergencyAlert: () => void;
  markNotificationRead: (id: string) => void;
  setZoneFilter: (zoneId: string | null) => void;
  setDeptFilter: (deptId: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  addVerificationRecord: (rec: DigiLockerVerificationRecord) => void;
  verifyComplaint: (complaintId: string, departmentId?: string) => void;
  assignComplaint: (complaintId: string, workerId: string, notes?: string) => void;
}

export const useCivicStore = create<CivicState>((set, get) => ({
  currentUser: INITIAL_USERS.CITIZEN,
  token: null,
  departments: INITIAL_DEPARTMENTS,
  ministries: INITIAL_MINISTRIES,
  ministryDirectives: INITIAL_DIRECTIVES,
  categories: INITIAL_CATEGORIES,
  zones: INITIAL_ZONES,
  workers: INITIAL_WORKERS,
  complaints: INITIAL_COMPLAINTS,
  history: INITIAL_HISTORY,
  comments: [],
  notifications: [
    {
      id: 'notif-1',
      userId: 'c1000000-0000-0000-0000-000000000001',
      type: 'STATUS_UPDATE',
      title: 'Complaint In Progress',
      message: 'Repair crew has arrived at Madhyam Marg for pothole repair.',
      complaintId: 'f1000000-0000-0000-0000-000000000001',
      isRead: false,
      createdAt: new Date().toISOString(),
    }
  ],
  cityHealth: INITIAL_HEALTH,
  healthScore: INITIAL_HEALTH,
  emergencyAlert: null,
  verifications: [
    {
      id: 'v-101',
      userId: 'c1000000-0000-0000-0000-000000000002',
      applicantName: 'Rajesh Kumar Sharma',
      applicantRole: 'OFFICIAL',
      govIdType: 'GOV_EMPLOYEE_ID',
      govIdNumberMasked: 'JMC-ENG-XXXX-089',
      issuingAuthority: 'Jaipur Municipal Corporation & DLB Rajasthan',
      verificationHash: '0x8f3c7e912b4a5d6f8a9e0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
      digiLockerTxnId: 'DL-TXN-2026-990812',
      status: 'VERIFIED',
      departmentOrMinistry: 'Roads & Infrastructure',
      verifiedAt: '2025-01-15T10:00:00Z',
      documents: [
        {
          docType: 'Official Gazetted Service Record',
          uri: 'digilocker://gov.in/rajasthan/dlb/services/089',
          verifiedOnChain: true,
        },
      ],
    },
    {
      id: 'v-102',
      userId: 'c1000000-0000-0000-0000-000000000003',
      applicantName: 'Dr. Jogaram, IAS',
      applicantRole: 'MINISTRY',
      govIdType: 'MINISTERIAL_CREDENTIAL',
      govIdNumberMasked: 'IAS-CADRE-XXXX-1998',
      issuingAuthority: 'DoPT Government of India / Government of Rajasthan',
      verificationHash: '0x7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d',
      digiLockerTxnId: 'DL-TXN-2026-778841',
      status: 'VERIFIED',
      departmentOrMinistry: 'Department of Local Self Government (DLB Rajasthan)',
      verifiedAt: '2024-11-20T11:30:00Z',
      documents: [
        {
          docType: 'IAS Executive Service Commission',
          uri: 'digilocker://dopt.gov.in/ias/executive_1998',
          verifiedOnChain: true,
        },
      ],
    },
  ],

  selectedZoneFilter: null,
  selectedDeptFilter: null,
  selectedStatusFilter: null,

  switchRole: (role: UserRole) => {
    const user = INITIAL_USERS[role];
    if (user) {
      set({ currentUser: user });
    }
  },

  setUser: (user: User, token?: string) => {
    set({ currentUser: user, token: token || null });
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('civicpulse_jwt_token', token);
      localStorage.setItem('civicpulse_user', JSON.stringify(user));
    }
  },

  logoutUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civicpulse_jwt_token');
      localStorage.removeItem('civicpulse_user');
    }
    set({ currentUser: INITIAL_USERS.CITIZEN, token: null });
  },

  addComplaint: async (complaintData) => {
    const state = get();
    const cat = state.categories.find((c) => c.id === complaintData.categoryId) || state.categories[0];
    const categoryWeight = cat?.categoryWeight || 1.5;
    const severity = complaintData.severity || 'MEDIUM';
    const affected = complaintData.affectedCount || 1;
    
    // Deterministic priority calculation
    const level = calculateDeterministicPriority(
      categoryWeight,
      severity,
      affected,
      false,
      0
    );
    // Compute numeric score
    const sevScoreMap: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const sevVal = sevScoreMap[severity] || 1;
    const crowdMult = affected > 500 ? 1.6 : affected > 100 ? 1.4 : affected > 25 ? 1.2 : 1.0;
    const score = Math.round((categoryWeight * 20) + (sevVal * 15) * crowdMult);

    const slaHours = level === 'CRITICAL' ? 12 : level === 'HIGH' ? 24 : level === 'MEDIUM' ? 48 : 72;
    const newId = `f-${Date.now()}`;
    const compNum = `CP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newComplaint: Complaint = {
      id: newId,
      complaintNumber: compNum,
      citizenId: state.currentUser.id,
      citizenName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      citizenPhone: state.currentUser.phone || '+91-9829012345',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryCode: cat.code,
      departmentId: complaintData.departmentId || state.departments[0].id,
      departmentName: complaintData.departmentName || state.departments[0].name,
      departmentColor: complaintData.departmentColor || state.departments[0].colorHex,
      zoneId: complaintData.zoneId || state.zones[0].id,
      zoneName: complaintData.zoneName || state.zones[0].name,
      title: complaintData.title || 'Civic Issue Reported',
      description: complaintData.description || '',
      status: 'REPORT_SUBMITTED',
      priority: level,
      priorityScore: score,
      severity,
      affectedCount: affected,
      latitude: complaintData.latitude || 26.8520,
      longitude: complaintData.longitude || 75.7680,
      address: complaintData.address || 'Mansarovar, Jaipur',
      landmark: complaintData.landmark,
      city: 'Jaipur',
      pincode: complaintData.pincode || '302020',
      images: complaintData.images || [],
      videos: complaintData.videos || [],
      slaDeadline: new Date(Date.now() + slaHours * 3600000).toISOString(),
      slaBreached: false,
      isEmergency: level === 'CRITICAL',
      upvotes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newHistoryItem: StatusHistoryItem = {
      id: `h-${Date.now()}`,
      complaintId: newId,
      toStatus: 'REPORT_SUBMITTED',
      changedBy: state.currentUser.id,
      changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      changedByRole: state.currentUser.role,
      notes: 'Initial issue reported with GPS and photo evidence.',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      complaints: [newComplaint, ...state.complaints],
      history: [...state.history, newHistoryItem],
    }));

    // Post to MongoDB backend API in background
    try {
      fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newComplaint,
          categoryWeight,
        }),
      }).catch((e) => console.log('API sync notice:', e));
    } catch (e) {
      // Offline fallback is already stored in client
    }

    return newComplaint;
  },

  // Synchronous reportComplaint used by ReportIssueWizard
  reportComplaint: (complaintData) => {
    const state = get();
    const cat = state.categories.find((c) => c.id === complaintData.categoryId) || state.categories[0];
    const categoryWeight = cat?.categoryWeight || 1.5;
    const severity = (complaintData.severity || 'MEDIUM') as SeverityLevel;
    const affected = complaintData.affectedCount || 100;

    const level = calculateDeterministicPriority(categoryWeight, severity, affected, !!state.emergencyAlert);
    const sevScoreMap: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const sevVal = sevScoreMap[severity] || 1;
    const crowdMult = affected > 500 ? 1.6 : affected > 100 ? 1.4 : affected > 25 ? 1.2 : 1.0;
    const score = Math.round((categoryWeight * 20) + (sevVal * 15) * crowdMult);
    const slaHours = level === 'CRITICAL' ? 12 : level === 'HIGH' ? 24 : level === 'MEDIUM' ? 48 : 72;

    const newId = `r-${Date.now()}`;
    const compNum = `CP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newComplaint: Complaint = {
      id: newId,
      complaintNumber: compNum,
      citizenId: state.currentUser.id,
      citizenName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      citizenPhone: state.currentUser.phone || '+91-9829012345',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryCode: cat.code,
      departmentId: complaintData.departmentId || state.departments[0].id,
      departmentName: complaintData.departmentName || state.departments[0].name,
      departmentColor: complaintData.departmentColor || state.departments[0].colorHex,
      zoneId: complaintData.zoneId || state.zones[0].id,
      zoneName: complaintData.zoneName || state.zones[0].name,
      title: complaintData.title || 'Civic Issue Reported',
      description: complaintData.description || '',
      status: 'REPORT_SUBMITTED',
      priority: level,
      priorityScore: score,
      severity,
      affectedCount: affected,
      latitude: complaintData.latitude || 26.8520,
      longitude: complaintData.longitude || 75.7680,
      address: complaintData.address || 'Mansarovar, Jaipur',
      landmark: complaintData.landmark,
      city: 'Jaipur',
      pincode: complaintData.pincode || '302020',
      images: complaintData.images || [],
      videos: complaintData.videos || [],
      slaDeadline: new Date(Date.now() + slaHours * 3600000).toISOString(),
      slaBreached: false,
      isEmergency: level === 'CRITICAL',
      upvotes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      complaints: [newComplaint, ...state.complaints],
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId: newId,
          toStatus: 'REPORT_SUBMITTED' as ComplaintStatus,
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: 'Issue reported with GPS coordinates and photographic/video evidence.',
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    // Background sync to API (non-blocking)
    try {
      fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newComplaint, categoryWeight }),
      }).catch((e) => console.log('API sync notice:', e));
    } catch (_) {}

    return newComplaint;
  },

  assignWorker: (complaintId, workerId, instructions) => {

    const state = get();
    const worker = state.workers.find((w) => w.id === workerId);
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'ASSIGNED',
              assignedWorkerId: workerId,
              assignedWorkerName: worker?.name || 'Assigned Crew',
              workerPhone: worker?.phone,
              workOrderNotes: instructions,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          fromStatus: 'VERIFIED',
          toStatus: 'ASSIGNED',
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: instructions ? `Assigned to ${worker?.name}. Notes: ${instructions}` : `Assigned to field worker ${worker?.name}`,
          createdAt: new Date().toISOString(),
        }
      ]
    }));
  },

  updateComplaintStatus: (complaintId, status, notes) => {
    const state = get();
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId ? { ...c, status, updatedAt: new Date().toISOString() } : c
      ),
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          toStatus: status,
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: notes || `Status updated to ${status}`,
          createdAt: new Date().toISOString(),
        }
      ]
    }));
  },

  workerStartJob: (complaintId) => {
    const state = get();
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId ? { ...c, status: 'IN_PROGRESS', updatedAt: new Date().toISOString() } : c
      ),
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_PROGRESS',
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: 'Worker arrived at location and commenced field operations.',
          createdAt: new Date().toISOString(),
        }
      ]
    }));
  },

  workerResolveJob: (complaintId, proofUrl, notes) => {
    const state = get();
    const proof = proofUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80';
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'RESOLVED',
              resolutionProofImage: proof,
              resolutionNotes: notes,
              resolvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          fromStatus: 'IN_PROGRESS',
          toStatus: 'RESOLVED',
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: notes || 'Field repairs completed. Photographic evidence submitted for citizen verification.',
          proofImages: [proof],
          createdAt: new Date().toISOString(),
        }
      ]
    }));
  },

  citizenVerifyAndClose: (complaintId, rating, feedback) => {
    const state = get();
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? { ...c, status: 'CITIZEN_VERIFIED', citizenRating: rating, citizenFeedback: feedback, verifiedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : c
      ),
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          fromStatus: 'RESOLVED',
          toStatus: 'CITIZEN_VERIFIED',
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: `Citizen verified resolution! Rating: ${rating}/5. ${feedback ? `Feedback: "${feedback}"` : ''}`,
          createdAt: new Date().toISOString(),
        }
      ]
    }));
  },

  citizenReopenComplaint: (complaintId, reason) => {
    const state = get();
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? { ...c, status: 'REOPENED', priority: 'HIGH', reopenCount: (c.reopenCount || 0) + 1, updatedAt: new Date().toISOString() }
          : c
      ),
      history: [
        ...state.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          fromStatus: 'RESOLVED',
          toStatus: 'REOPENED',
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: `Citizen reopened complaint. Reason: "${reason}". Priority automatically bumped.`,
          createdAt: new Date().toISOString(),
        }
      ]
    }));
  },

  upvoteComplaint: (complaintId) => {
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? { ...c, upvotes: (c.upvotes || 0) + 1, affectedCount: c.affectedCount + 1 }
          : c
      ),
    }));
  },

  addComment: (complaintId, message, isInternal = false) => {
    const state = get();
    const newComment: ComplaintComment = {
      id: `comm-${Date.now()}`,
      complaintId,
      userId: state.currentUser.id,
      userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      userRole: state.currentUser.role,
      message,
      isInternal,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ comments: [...state.comments, newComment] }));
  },

  toggleEmergencyAlert: (title, description, severity) => {
    const state = get();
    const alert: EmergencyAlert = {
      id: `emerg-${Date.now()}`,
      title,
      description,
      severity,
      isActive: true,
      activatedAt: new Date().toISOString(),
      activatedBy: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
    };
    set({ emergencyAlert: alert });
  },

  deactivateEmergencyAlert: () => {
    set({ emergencyAlert: null });
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  setZoneFilter: (zoneId) => set({ selectedZoneFilter: zoneId }),
  setDeptFilter: (deptId) => set({ selectedDeptFilter: deptId }),
  setStatusFilter: (status) => set({ selectedStatusFilter: status }),

  addVerificationRecord: (rec) => {
    set((state) => ({
      verifications: [rec, ...state.verifications],
    }));
  },

  // Official portal: verify a submitted complaint
  verifyComplaint: (complaintId, departmentId) => {
    const state = get();
    set((s) => ({
      complaints: s.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: 'VERIFIED' as ComplaintStatus,
              departmentId: departmentId || c.departmentId,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      history: [
        ...s.history,
        {
          id: `h-${Date.now()}`,
          complaintId,
          fromStatus: 'REPORT_SUBMITTED' as ComplaintStatus,
          toStatus: 'VERIFIED' as ComplaintStatus,
          changedBy: state.currentUser.id,
          changedByName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
          changedByRole: state.currentUser.role,
          notes: 'Complaint verified and routed to relevant department.',
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  },

  // Official portal: assign complaint to a field worker (alias of assignWorker)
  assignComplaint: (complaintId, workerId, notes) => {
    get().assignWorker(complaintId, workerId, notes);
  },
}));

