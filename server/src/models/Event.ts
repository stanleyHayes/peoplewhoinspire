import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  endDate: Date;
  location: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  image: string;
  registrationLink: string;
  /** YouTube (or other) recording link for past sessions — "Watch Recording". */
  recordingLink: string;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, default: '' },
    type: { type: String, enum: ['in-person', 'virtual', 'hybrid'], default: 'virtual' },
    image: { type: String, default: '' },
    registrationLink: { type: String, default: '' },
    recordingLink: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', eventSchema);
