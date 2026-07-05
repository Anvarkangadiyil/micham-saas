"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Client from "@/models/Client";
import Project from "@/models/Project";
import { uploadReceipt } from "@/services/cloudinary";
import { suggestExpenseCategory } from "@/services/gemini";
import { expenseFormSchema, type ExpenseFormValues } from "./schemas";
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
 * Fetches all active expense records for the authenticated user, populating client and project details.
 */
export async function getExpenses() {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    // Ensure models are registered for populate
    Client.name;
    Project.name;

    const expenses = await Expense.find({
      userId,
      isDeleted: { $ne: true },
    })
      .sort({ date: -1 })
      .populate("clientId", "name")
      .populate("projectId", "name")
      .lean();

    return {
      success: true,
      data: serialize(
        expenses.map((expense) => ({
          ...expense,
          _id: (expense._id as any).toString(),
          clientId: expense.clientId
            ? {
                _id: (expense.clientId as any)._id.toString(),
                name: (expense.clientId as any).name,
              }
            : undefined,
          projectId: expense.projectId
            ? {
                _id: (expense.projectId as any)._id.toString(),
                name: (expense.projectId as any).name,
              }
            : undefined,
          date: expense.date.toISOString().split("T")[0],
          createdAt: expense.createdAt?.toISOString(),
          updatedAt: expense.updatedAt?.toISOString(),
        }))
      ),
    };
  } catch (error: unknown) {
    console.error("getExpenses error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch expenses.",
    };
  }
}

/**
 * Creates a new expense record.
 * 
 * PLANNING:
 * 1. Validate fields via Zod.
 * 2. Authenticate the user and retrieve userId.
 * 3. Generate a UUID for compatibility, resolve references, and save the document.
 */
export async function createExpense(values: ExpenseFormValues) {
  try {
    const validated = expenseFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid expense fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("create expense");
    await connectDB();

    const { amount, category, description, date, clientId, projectId, receiptUrl, notes } = validated.data;

    const newExpense = new Expense({
      id: uuidv4(), // Keep unique UUID for compatibility
      userId,
      amount,
      category,
      description,
      date: new Date(date),
      clientId: clientId ? clientId : undefined,
      projectId: projectId ? projectId : undefined,
      receiptUrl: receiptUrl || undefined,
      notes: notes || undefined,
    });

    await newExpense.save();

    revalidatePath("/");
    return {
      success: true,
      data: serialize({
        ...newExpense.toObject(),
        _id: newExpense._id.toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("createExpense error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense.",
    };
  }
}

/**
 * Updates an expense record.
 * 
 * PLANNING:
 * 1. Validate fields.
 * 2. Verify ownership of the expense record by the user.
 * 3. Update the record with new values.
 */
export async function updateExpense(id: string, values: ExpenseFormValues) {
  try {
    const validated = expenseFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid expense fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("update expense");
    await connectDB();

    const { amount, category, description, date, clientId, projectId, receiptUrl, notes } = validated.data;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      {
        $set: {
          amount,
          category,
          description,
          date: new Date(date),
          clientId: clientId ? clientId : null,
          projectId: projectId ? projectId : null,
          receiptUrl: receiptUrl || null,
          notes: notes || null,
        },
      },
      { new: true }
    ).lean();

    if (!updatedExpense) {
      return { success: false, error: "Expense not found or unauthorized." };
    }

    revalidatePath("/");
    return {
      success: true,
      data: serialize({
        ...updatedExpense,
        _id: (updatedExpense._id as any).toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("updateExpense error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expense.",
    };
  }
}

/**
 * Soft deletes an expense record.
 * 
 * PLANNING:
 * 1. Verify user session and ownership of the expense record.
 * 2. Soft-delete by setting isDeleted: true and deletedAt: now.
 */
export async function deleteExpense(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("delete expense");
    await connectDB();

    const deletedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deletedExpense) {
      return { success: false, error: "Expense not found or unauthorized." };
    }

    revalidatePath("/");
    return { success: true, message: "Expense deleted successfully." };
  } catch (error: unknown) {
    console.error("deleteExpense error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense.",
    };
  }
}

/**
 * Uploads a receipt image.
 * 
 * PLANNING:
 * 1. Authenticate user.
 * 2. Extract file from FormData.
 * 3. Invoke uploadReceipt service (direct Cloudinary REST or local FS).
 */
export async function uploadReceiptAction(formData: FormData) {
  try {
    await getSessionUserOrThrow();
    await checkDemoRestriction("upload receipt");
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded." };
    }
    const url = await uploadReceipt(file);
    return { success: true, url };
  } catch (error: unknown) {
    console.error("uploadReceiptAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload receipt.",
    };
  }
}

/**
 * Suggests an expense category using AI based on description.
 */
export async function suggestCategoryAction(description: string) {
  try {
    await getSessionUserOrThrow();
    await checkDemoRestriction("suggest category");
    const category = await suggestExpenseCategory(description);
    return { success: true, category };
  } catch (error: unknown) {
    console.error("suggestCategoryAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to suggest category.",
      category: "other",
    };
  }
}

