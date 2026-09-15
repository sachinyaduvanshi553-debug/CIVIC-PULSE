import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  role: { type: String, required: true, enum: ['CITIZEN', 'WORKER', 'OFFICIAL', 'ADMIN'] },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  avatarUrl: { type: String },
  lastLoginAt: { type: Date }
}, {
  timestamps: true // adds createdAt, updatedAt
});

// Pre-save hook to hash password if it's modified
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    // Note: If you are setting an already hashed password, don't re-hash it!
    // This assumes plaintext password is set to passwordHash initially.
    // In a real app, you might have a separate virtual field for plaintext password.
    // Here we just check if it already looks like a bcrypt hash ($2...)
    if (!this.passwordHash.startsWith('$2')) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  } catch (error) {
    throw error;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
