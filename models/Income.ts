import mongoose, { Schema, type Model } from "mongoose";

export interface IIncome {
  userId: string;
  amount: number;
  date: Date;
  clientId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  source: string;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const incomeSchema = new Schema<IIncome>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      required: false,
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

incomeSchema.index({ userId: 1, isDeleted: 1 });

const Income: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>("Income", incomeSchema);

export default Income;
