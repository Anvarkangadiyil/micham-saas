import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

const updateExpenseSchema = z.object({
  amount: z.number().min(0),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.coerce.date(),
});

export const PATCH = auth(async (req, { params }) => {
  try {
    // 1. Authenticate user
    if (!req.auth || !req.auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = req.auth.user.id;
    const { id } = await params as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { amount, category, description, date } = parsed.data;

    await connectDB();

    // 2. Find and update the expense, ensuring it belongs to the authenticated user
    const updatedExpense = await Expense.findOneAndUpdate(
      { id, userId, isDeleted: { $ne: true } },
      {
        amount,
        category,
        description,
        date,
      },
      { new: true }
    ).lean();

    if (!updatedExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] failed:", error);
    return NextResponse.json(
      {
        error: "Failed to update expense",
        ...(process.env.NODE_ENV !== "production" && error instanceof Error
          ? { detail: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async (req, { params }) => {
  try {
    // 1. Authenticate user
    if (!req.auth || !req.auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = req.auth.user.id;
    const { id } = await params as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
    }

    await connectDB();

    // 2. Soft-delete the expense by setting isDeleted: true and deletedAt: Date.now()
    const deletedExpense = await Expense.findOneAndUpdate(
      { id, userId, isDeleted: { $ne: true } },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!deletedExpense) {
      return NextResponse.json({ error: "Expense not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] failed:", error);
    return NextResponse.json(
      {
        error: "Failed to delete expense",
        ...(process.env.NODE_ENV !== "production" && error instanceof Error
          ? { detail: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
});
