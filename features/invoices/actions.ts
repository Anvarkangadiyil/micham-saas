"use server";

/**
 * PLANNING FOR INVOICE ACTIONS:
 * 1. Ensure DB connection and user authentication for all operations.
 * 2. Auto-increment invoice numbers by checking the count of existing user invoices (e.g. INV-1001).
 * 3. Implement soft delete (isDeleted: true, deletedAt: Date) for financial tracking.
 * 4. For mark-as-paid, calculate invoice totals and automatically create a corresponding Income record to keep financial tracking seamless.
 */

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Income from "@/models/Income";
import { invoiceFormSchema, type InvoiceFormValues } from "./schemas";
import { polishInvoiceLineItemDescription } from "@/services/gemini";
import { serialize } from "@/lib/utils";
import { checkDemoRestriction } from "@/lib/demo";

async function getSessionUserOrThrow() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please log in.");
  }
  return session.user.id;
}

/**
 * Fetches all invoices for the authenticated user (excludes deleted ones).
 */
export async function getInvoices() {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    // Ensure models are registered for populate
    Client.name;
    Project.name;

    const invoices = await Invoice.find({
      userId,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .populate("clientId", "name company")
      .populate("projectId", "name")
      .lean();

    return {
      success: true,
      data: serialize(
        invoices.map((inv) => ({
          ...inv,
          _id: (inv._id as any).toString(),
          clientId: inv.clientId
            ? {
                _id: (inv.clientId as any)._id.toString(),
                name: (inv.clientId as any).name,
                company: (inv.clientId as any).company,
              }
            : undefined,
          projectId: inv.projectId
            ? {
                _id: (inv.projectId as any)._id.toString(),
                name: (inv.projectId as any).name,
              }
            : undefined,
          issueDate: inv.issueDate.toISOString().split("T")[0],
          dueDate: inv.dueDate.toISOString().split("T")[0],
          lineItems: inv.lineItems.map((item: any) => ({
            ...item,
            _id: item._id?.toString(),
          })),
          createdAt: inv.createdAt?.toISOString(),
          updatedAt: inv.updatedAt?.toISOString(),
        }))
      ),
    };
  } catch (error: unknown) {
    console.error("getInvoices error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoices.",
    };
  }
}

/**
 * Fetches a single invoice by ID (checks ownership and exclusions).
 */
export async function getInvoiceById(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    // Ensure models are registered for populate
    Client.name;
    Project.name;

    const inv = await Invoice.findOne({
      _id: id,
      userId,
      isDeleted: { $ne: true },
    })
      .populate("clientId", "name email company notes")
      .populate("projectId", "name rateType status")
      .lean();

    if (!inv) {
      return { success: false, error: "Invoice not found." };
    }

    return {
      success: true,
      data: serialize({
        ...inv,
        _id: (inv._id as any).toString(),
        clientId: inv.clientId
          ? {
              _id: (inv.clientId as any)._id.toString(),
              name: (inv.clientId as any).name,
              email: (inv.clientId as any).email,
              company: (inv.clientId as any).company,
              notes: (inv.clientId as any).notes,
            }
          : undefined,
        projectId: inv.projectId
          ? {
              _id: (inv.projectId as any)._id.toString(),
              name: (inv.projectId as any).name,
              rateType: (inv.projectId as any).rateType,
              status: (inv.projectId as any).status,
            }
          : undefined,
        issueDate: inv.issueDate.toISOString().split("T")[0],
        dueDate: inv.dueDate.toISOString().split("T")[0],
        lineItems: inv.lineItems.map((item: any) => ({
          ...item,
          _id: item._id?.toString(),
        })),
        createdAt: inv.createdAt?.toISOString(),
        updatedAt: inv.updatedAt?.toISOString(),
      }),
    };
  } catch (error: unknown) {
    console.error("getInvoiceById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoice details.",
    };
  }
}

/**
 * Fetches a public read-only invoice by ID (NO authentication check).
 */
export async function getSharedInvoiceById(id: string) {
  try {
    await connectDB();

    // Ensure models are registered for populate
    Client.name;
    Project.name;

    const inv = await Invoice.findOne({
      _id: id,
      isDeleted: { $ne: true },
    })
      .populate("clientId", "name email company notes")
      .populate("projectId", "name rateType status")
      .lean();

    if (!inv) {
      return { success: false, error: "Invoice not found." };
    }

    // Fetch invoice owner's settings for currency display
    const user = await User.findById(inv.userId).lean();
    const currencySymbol = user?.currencySymbol || "$";

    return {
      success: true,
      data: serialize({
        ...inv,
        _id: (inv._id as any).toString(),
        clientId: inv.clientId
          ? {
              _id: (inv.clientId as any)._id.toString(),
              name: (inv.clientId as any).name,
              email: (inv.clientId as any).email,
              company: (inv.clientId as any).company,
              notes: (inv.clientId as any).notes,
            }
          : undefined,
        projectId: inv.projectId
          ? {
              _id: (inv.projectId as any)._id.toString(),
              name: (inv.projectId as any).name,
              rateType: (inv.projectId as any).rateType,
              status: (inv.projectId as any).status,
            }
          : undefined,
        issueDate: inv.issueDate.toISOString().split("T")[0],
        dueDate: inv.dueDate.toISOString().split("T")[0],
        lineItems: inv.lineItems.map((item: any) => ({
          ...item,
          _id: item._id?.toString(),
        })),
        createdAt: inv.createdAt?.toISOString(),
        updatedAt: inv.updatedAt?.toISOString(),
        currencySymbol,
      }),
    };
  } catch (error: unknown) {
    console.error("getSharedInvoiceById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch shared invoice.",
    };
  }
}

/**
 * Creates a new invoice.
 */
export async function createInvoice(values: InvoiceFormValues) {
  try {
    const validated = invoiceFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid invoice fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("create invoice");
    await connectDB();

    // Verify client belongs to user
    const client = await Client.findOne({ _id: validated.data.clientId, userId, isDeleted: { $ne: true } });
    if (!client) {
      return { success: false, error: "Client not found or unauthorized." };
    }

    // Verify project belongs to user if provided
    if (validated.data.projectId) {
      const project = await Project.findOne({ _id: validated.data.projectId, userId, isDeleted: { $ne: true } });
      if (!project) {
        return { success: false, error: "Project not found or unauthorized." };
      }
    }

    // Generate auto-increment invoice number INV-XXXX
    const count = await Invoice.countDocuments({ userId });
    const invoiceNumber = `INV-${1001 + count}`;

    const newInvoice = new Invoice({
      ...validated.data,
      invoiceNumber,
      userId,
      issueDate: new Date(validated.data.issueDate),
      dueDate: new Date(validated.data.dueDate),
      projectId: validated.data.projectId ? validated.data.projectId : undefined,
    });

    await newInvoice.save();

    revalidatePath("/invoices");
    return {
      success: true,
      data: serialize({
        ...newInvoice.toObject(),
        _id: newInvoice._id.toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("createInvoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice.",
    };
  }
}

/**
 * Updates an existing invoice.
 */
export async function updateInvoice(id: string, values: InvoiceFormValues) {
  try {
    const validated = invoiceFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid invoice fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("update invoice");
    await connectDB();

    // Verify client belongs to user
    const client = await Client.findOne({ _id: validated.data.clientId, userId, isDeleted: { $ne: true } });
    if (!client) {
      return { success: false, error: "Client not found or unauthorized." };
    }

    // Verify project belongs to user if provided
    if (validated.data.projectId) {
      const project = await Project.findOne({ _id: validated.data.projectId, userId, isDeleted: { $ne: true } });
      if (!project) {
        return { success: false, error: "Project not found or unauthorized." };
      }
    }

    const updated = await Invoice.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      {
        $set: {
          clientId: validated.data.clientId,
          projectId: validated.data.projectId ? validated.data.projectId : null,
          issueDate: new Date(validated.data.issueDate),
          dueDate: new Date(validated.data.dueDate),
          lineItems: validated.data.lineItems,
          status: validated.data.status,
          notes: validated.data.notes || "",
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return { success: false, error: "Invoice not found or unauthorized." };
    }

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    return {
      success: true,
      data: serialize({
        ...updated,
        _id: (updated._id as any).toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("updateInvoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice.",
    };
  }
}

/**
 * Soft deletes an invoice.
 */
export async function deleteInvoice(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("delete invoice");
    await connectDB();

    const deleted = await Invoice.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deleted) {
      return { success: false, error: "Invoice not found or unauthorized." };
    }

    revalidatePath("/invoices");
    return { success: true, message: "Invoice deleted successfully." };
  } catch (error: unknown) {
    console.error("deleteInvoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete invoice.",
    };
  }
}

/**
 * Marks an invoice as paid and optionally creates a corresponding Income record.
 */
export async function markInvoiceAsPaid(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("mark invoice as paid");
    await connectDB();

    const invoice = await Invoice.findOne({ _id: id, userId, isDeleted: { $ne: true } });
    if (!invoice) {
      return { success: false, error: "Invoice not found or unauthorized." };
    }

    if (invoice.status === "paid") {
      return { success: false, error: "Invoice is already marked as paid." };
    }

    // Calculate total amount
    const totalAmount = invoice.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );

    // Update invoice status
    invoice.status = "paid";
    await invoice.save();

    // Create corresponding Income record
    const incomeSource = `Invoice ${invoice.invoiceNumber}`;
    const newIncome = new Income({
      userId,
      amount: totalAmount,
      date: new Date(),
      clientId: invoice.clientId,
      projectId: invoice.projectId || undefined,
      source: incomeSource,
      notes: `Automatically generated from paid invoice ${invoice.invoiceNumber}.`,
    });
    await newIncome.save();

    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    
    return {
      success: true,
      message: "Invoice marked as paid and corresponding income recorded.",
    };
  } catch (error: unknown) {
    console.error("markInvoiceAsPaid error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark invoice as paid.",
    };
  }
}

/**
 * Polishes rough invoice line item notes using AI.
 */
export async function polishInvoiceDescriptionAction(roughNotes: string) {
  try {
    await getSessionUserOrThrow();
    await checkDemoRestriction("polish description");
    const polished = await polishInvoiceLineItemDescription(roughNotes);
    return { success: true, polished };
  } catch (error: unknown) {
    console.error("polishInvoiceDescriptionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to polish description.",
      polished: roughNotes,
    };
  }
}
