import mongoose, { Schema, type Model } from "mongoose";

export interface ILineItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface IInvoice {
  userId: string;
  clientId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  lineItems: ILineItem[];
  status: "draft" | "sent" | "paid" | "overdue";
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const lineItemSchema = new Schema<ILineItem>({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lineItems: {
      type: [lineItemSchema],
      required: true,
      validate: {
        validator: function (items: ILineItem[]) {
          return items.length > 0;
        },
        message: "Invoice must have at least one line item.",
      },
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
      required: true,
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

invoiceSchema.index({ userId: 1, isDeleted: 1 });
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);

export default Invoice;
