import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDoc extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CITIZEN' | 'OFFICIAL' | 'MINISTRY' | 'FIELD_WORKER' | 'ADMIN';
  avatarUrl?: string;
  departmentId?: string;
  departmentName?: string;
  zoneId?: string;
  zoneName?: string;
  ministryId?: string;
  ministryName?: string;
  designation?: string;
  employeeId?: string;
  reputationPoints: number;
  isVerified: boolean;
  digiLockerVerified: boolean;
  digiLockerDocId?: string;
  digiLockerVerifiedAt?: Date;
  officerCadre?: string;
  govIdNumber?: string;
  govIdType?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { 
      type: String, 
      enum: ['CITIZEN', 'OFFICIAL', 'MINISTRY', 'FIELD_WORKER', 'ADMIN'], 
      default: 'CITIZEN' 
    },
    avatarUrl: { type: String },
    departmentId: { type: String },
    departmentName: { type: String },
    zoneId: { type: String },
    zoneName: { type: String },
    ministryId: { type: String },
    ministryName: { type: String },
    designation: { type: String },
    employeeId: { type: String },
    reputationPoints: { type: Number, default: 100 },
    isVerified: { type: Boolean, default: false },
    digiLockerVerified: { type: Boolean, default: false },
    digiLockerDocId: { type: String },
    digiLockerVerifiedAt: { type: Date },
    officerCadre: { type: String },
    govIdNumber: { type: String },
    govIdType: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
// NOTE: Mongoose 7+ async pre hooks must NOT take/call next() — throw to signal errors instead.
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
