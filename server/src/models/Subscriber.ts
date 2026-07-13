import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  name: string;
  subscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, default: '' },
    subscribed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriber>('Subscriber', subscriberSchema);
