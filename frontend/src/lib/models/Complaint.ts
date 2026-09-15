import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaintDoc extends Document {
  complaintNumber: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  departmentId: string;
  departmentName: string;
  departmentColor?: string;
  zoneId: string;
  zoneName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  priorityScore: number;
  severity: string;
  affectedCount: number;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  city: string;
  pincode?: string;
  images: string[];
  videos?: string[];
  slaDeadline: Date;
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
  reopenCount: number;
  upvotes: number;
  statusHistory: {
    fromStatus?: string;
    toStatus: string;
    changedBy: string;
    changedByName?: string;
    changedByRole?: string;
    notes?: string;
    proofImages?: string[];
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  verifiedAt?: Date;
}

const ComplaintSchema = new Schema<IComplaintDoc>(
  {
    complaintNumber: { type: String, required: true, unique: true, index: true },
    citizenId: { type: String, required: true, index: true },
    citizenName: { type: String, required: true },
    citizenPhone: { type: String },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    categoryCode: { type: String, required: true },
    departmentId: { type: String, required: true, index: true },
    departmentName: { type: String, required: true },
    departmentColor: { type: String, default: '#F97316' },
    zoneId: { type: String, required: true, index: true },
    zoneName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'REPORT_SUBMITTED',
        'VERIFIED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CITIZEN_VERIFIED',
        'REOPENED',
        'REJECTED',
        'ESCALATED',
      ],
      default: 'REPORT_SUBMITTED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    priorityScore: { type: Number, default: 50 },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    affectedCount: { type: Number, default: 1 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, default: 'Jaipur' },
    pincode: { type: String },
    images: [{ type: String }],
    videos: [{ type: String }],
    slaDeadline: { type: Date, required: true },
    slaBreached: { type: Boolean, default: false },
    isEmergency: { type: Boolean, default: false },
    assignedWorkerId: { type: String },
    assignedWorkerName: { type: String },
    workerPhone: { type: String },
    workOrderNotes: { type: String },
    resolutionProofImage: { type: String },
    resolutionNotes: { type: String },
    citizenRating: { type: Number },
    citizenFeedback: { type: String },
    reopenCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 1 },
    statusHistory: [
      {
        fromStatus: { type: String },
        toStatus: { type: String, required: true },
        changedBy: { type: String, required: true },
        changedByName: { type: String },
        changedByRole: { type: String },
        notes: { type: String },
        proofImages: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const ComplaintModel: Model<IComplaintDoc> =
  mongoose.models.Complaint || mongoose.model<IComplaintDoc>('Complaint', ComplaintSchema);
