import mongoose, { Schema, type Model } from "mongoose";

export interface IClient {
  name: string;
  email?: string;
  company?: string;
  notes?: string;
  userId: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: false,
    },
    company: {
      type: String,
      trim: true,
      required: false,
    },
    notes: {
      type: String,
      trim: true,
      required: false,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

clientSchema.index({ userId: 1, isDeleted: 1 });

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", clientSchema);

export default Client;
