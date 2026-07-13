import mongoose, { Document, Schema } from 'mongoose';

export interface IProgram extends Document {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  icon: string;
  features: string[];
  category: string;
  featured: boolean;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, default: '' },
    description: { type: String, required: true },
    longDescription: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: 'FaGraduationCap' },
    features: { type: [String], default: [] },
    category: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProgram>('Program', programSchema);
