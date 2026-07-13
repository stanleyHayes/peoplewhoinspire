import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  group: 'general' | 'seo' | 'social' | 'email' | 'appearance';
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: ['general', 'seo', 'social', 'email', 'appearance'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISetting>('Setting', settingSchema);
