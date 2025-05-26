import mongoose, { Document, Schema } from 'mongoose';

export interface IFHIRResource extends Document {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

const FHIRResourceSchema = new Schema<IFHIRResource>(
  {
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    meta: {
      versionId: String,
      lastUpdated: String,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
FHIRResourceSchema.index({ resourceType: 1, id: 1 }, { unique: true });
FHIRResourceSchema.index({ 'data.identifier.value': 1 });
FHIRResourceSchema.index({ 'data.name.family': 1, 'data.name.given': 1 });

export const FHIRResource = mongoose.model<IFHIRResource>('FHIRResource', FHIRResourceSchema); 