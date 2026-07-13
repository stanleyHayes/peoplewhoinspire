import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'invited';
  avatar?: string;
  lastLogin?: Date;
  invitedBy?: mongoose.Types.ObjectId;
  inviteToken?: string;
  inviteExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'editor', 'viewer'],
      default: 'viewer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'invited'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    inviteToken: {
      type: String,
    },
    inviteExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
