export type UserRole = 'CITIZEN' | 'OFFICIAL' | 'MINISTRY' | 'FIELD_WORKER' | 'ADMIN';

export type ComplaintStatus =
  | 'REPORT_SUBMITTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CITIZEN_VERIFIED'
  | 'REOPENED'
  | 'REJECTED'
  | 'ESCALATED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  departmentId?: string;
  departmentName?: string;
  zoneId?: string;
  zoneName?: string;
  ministryId?: string;
  ministryName?: string;
  designation?: string;
  employeeId?: string;
  reputationPoints?: number;
  // DigiLocker / Legal Gov Verification
  isVerified?: boolean;
  digiLockerVerified?: boolean;
  digiLockerDocId?: string;
  digiLockerVerifiedAt?: string;
  officerCadre?: string;
  govIdNumber?: string;
  govIdType?: 'AADHAAR' | 'GOV_EMPLOYEE_ID' | 'OFFICER_SERVICE_CARD' | 'MINISTERIAL_CREDENTIAL';
  token?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  phone: string;
  email: string;
  colorHex: string;
  activeComplaintsCount?: number;
  resolvedCount?: number;
  slaComplianceRate?: number;
  totalBudgetCr?: number;
  workforceCount?: number;
}

export interface Ministry {
  id: string;
  name: string;
  code: string;
  jurisdiction: 'CENTRAL' | 'STATE';
  ministerInCharge: string;
  secretaryName: string;
  contactEmail: string;
  phone: string;
  monitoredDepartments: string[];
  totalAllocatedBudgetCr: number;
  complianceRating: number;
  activeDirectivesCount: number;
  description: string;
}

export interface MinistryDirective {
  id: string;
  ministryId: string;
  title: string;
  description: string;
  priority: 'ROUTINE' | 'HIGH_PRIORITY' | 'URGENT_CRISIS';
  issuedAt: string;
  targetDepartmentCode: string;
  status: 'PENDING_ACKNOWLEDGEMENT' | 'IN_COMPLIANCE' | 'COMPLETED';
}

export interface CityZone {
  id: string;
  name: string;
  code: string;
  population: number;
  areaSqkm: number;
  healthScore?: number;
  openIssuesCount?: number;
  criticalPotholesCount?: number;
  waterSupplyCoveragePct?: number;
  sanitationFrequencyPerWeek?: number;
  zonalOfficerName?: string;
  zonalOfficeContact?: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  defaultPriority: PriorityLevel;
  slaHours: number;
  categoryWeight: number;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  categoryId: string;
  categoryName?: string;
  categoryCode?: string;
  departmentId?: string;
  departmentName?: string;
  departmentColor?: string;
  zoneId?: string;
  zoneName?: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  priorityScore?: number;
  severity: SeverityLevel;
  affectedCount: number;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  city: string;
  pincode?: string;
  images: string[];
  videos?: string[];
  slaDeadline: string;
  slaBreached: boolean;
  isEmergency: boolean;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  workerPhone?: string;
  workOrderNotes?: string;
  resolutionProofImage?: string;
  resolutionNotes?: string;
  citizenRating?: number;
  citizenFeedback?: string;
  reopenCount?: number;
  upvotes?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  verifiedAt?: string;
}

export interface StatusHistoryItem {
  id: string;
  complaintId: string;
  fromStatus?: ComplaintStatus;
  toStatus: ComplaintStatus;
  changedBy: string;
  changedByName?: string;
  changedByRole?: UserRole;
  notes?: string;
  proofImages?: string[];
  createdAt: string;
}

export interface ComplaintComment {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface FieldWorker {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  employeeId: string;
  specialization: string;
  isAvailable: boolean;
  latitude: number;
  longitude: number;
  totalTasks: number;
  completedTasks: number;
  rating: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CityHealthScore {
  overallScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'CRITICAL';
  metrics: {
    slaComplianceRate: number; // 0-100
    averageResolutionTimeHours: number;
    citizenSatisfactionRate: number; // 0-100
    openCriticalIssues: number;
    backlogIndex: number; // 0-100
  };
  zoneScores: {
    zoneId: string;
    zoneName: string;
    score: number;
    activeCount: number;
  }[];
}

export interface PriorityRule {
  id: string;
  name: string;
  categoryCode?: string;
  severity?: SeverityLevel;
  minAffected: number;
  locationType?: string;
  complaintAgeDays?: number;
  priorityResult: PriorityLevel;
  isActive: boolean;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  activatedAt: string;
  activatedBy: string;
}

export interface DigiLockerVerificationRecord {
  id: string;
  userId: string;
  applicantName: string;
  applicantRole: UserRole;
  govIdType: string;
  govIdNumberMasked: string;
  issuingAuthority: string;
  verificationHash: string;
  digiLockerTxnId: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  verifiedAt: string;
  documents: {
    docType: string;
    uri: string;
    verifiedOnChain: boolean;
  }[];
}
