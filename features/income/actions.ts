"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Income from "@/models/Income";
import Client from "@/models/Client";
import Project from "@/models/Project";
import { incomeFormSchema, type IncomeFormValues } from "./schemas";
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
 * Fetches all active income entries for the authenticated user, populating client and project details.
 */
export async function getIncomes() {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    // Ensure models are registered for populate
    Client.name;
    Project.name;

    const incomes = await Income.find({
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
        incomes.map((income) => ({
          ...income,
          _id: (income._id as any).toString(),
          clientId: income.clientId
            ? {
                _id: (income.clientId as any)._id.toString(),
                name: (income.clientId as any).name,
              }
            : undefined,
          projectId: income.projectId
            ? {
                _id: (income.projectId as any)._id.toString(),
                name: (income.projectId as any).name,
              }
            : undefined,
          date: income.date.toISOString().split("T")[0],
          createdAt: income.createdAt?.toISOString(),
          updatedAt: income.updatedAt?.toISOString(),
        }))
      ),
    };
  } catch (error: unknown) {
    console.error("getIncomes error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch income records.",
    };
  }
}

/**
 * Creates a new income record.
 * 
 * PLANNING:
 * 1. Validate form fields using Zod.
 * 2. Authenticate the user and retrieve userId.
 * 3. Convert clientId/projectId to ObjectId if provided, then save the document.
 */
export async function createIncome(values: IncomeFormValues) {
  try {
    const validated = incomeFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid income fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("create income");
    await connectDB();

    const { amount, date, clientId, projectId, source, notes } = validated.data;

    const newIncome = new Income({
      userId,
      amount,
      date: new Date(date),
      clientId: clientId ? clientId : undefined,
      projectId: projectId ? projectId : undefined,
      source,
      notes: notes || undefined,
    });

    await newIncome.save();

    revalidatePath("/");
    return {
      success: true,
      data: serialize({
        ...newIncome.toObject(),
        _id: newIncome._id.toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("createIncome error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create income record.",
    };
  }
}

/**
 * Updates an income record.
 * 
 * PLANNING:
 * 1. Validate fields.
 * 2. Verify ownership of the income record by the user.
 * 3. Update the record with new values.
 */
export async function updateIncome(id: string, values: IncomeFormValues) {
  try {
    const validated = incomeFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid income fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("update income");
    await connectDB();

    const { amount, date, clientId, projectId, source, notes } = validated.data;

    const updatedIncome = await Income.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      {
        $set: {
          amount,
          date: new Date(date),
          clientId: clientId ? clientId : null,
          projectId: projectId ? projectId : null,
          source,
          notes: notes || null,
        },
      },
      { new: true }
    ).lean();

    if (!updatedIncome) {
      return { success: false, error: "Income record not found or unauthorized." };
    }

    revalidatePath("/");
    return {
      success: true,
      data: serialize({
        ...updatedIncome,
        _id: (updatedIncome._id as any).toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("updateIncome error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update income record.",
    };
  }
}

/**
 * Soft deletes an income record.
 * 
 * PLANNING:
 * 1. Verify user session and ownership of the income record.
 * 2. Soft-delete by setting isDeleted: true and deletedAt: now.
 */
export async function deleteIncome(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("delete income");
    await connectDB();

    const deletedIncome = await Income.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deletedIncome) {
      return { success: false, error: "Income record not found or unauthorized." };
    }

    revalidatePath("/");
    return { success: true, message: "Income record deleted successfully." };
  } catch (error: unknown) {
    console.error("deleteIncome error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete income record.",
    };
  }
}
