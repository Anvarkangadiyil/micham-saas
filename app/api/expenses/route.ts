import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

const createExpenseSchema = z.object({
  amount: z.number().min(0),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.coerce.date(),
  requestId: z.string().trim().min(1).optional(),
});

export const GET = auth(async (req) => {
  try {
    // 1. Authenticate user
    if (!req.auth || !req.auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = req.auth.user.id;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    const sort = searchParams.get("sort");

    // 2. Query only the user's expenses
    const query: { userId: string; category?: string; isDeleted?: any } = {
      userId,
      isDeleted: { $ne: true },
    };
    if (category) {
      query.category = category;
    }

    const sortOptions = sort === "date_desc" ? { date: -1 as const } : undefined;
    const expenses = await Expense.find(query).sort(sortOptions).lean();

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error("GET /api/expenses failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch expenses",
        ...(process.env.NODE_ENV !== "production" && error instanceof Error
          ? { detail: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
});

export const POST = auth(async (req) => {
  try {
    // 1. Authenticate user
    if (!req.auth || !req.auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = req.auth.user.id;

    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { amount, category, description, date, requestId } = parsed.data;
    const expenseId = requestId ?? uuidv4();

    await connectDB();

    // 2. Prevent duplicate creation (idempotency check)
    if (requestId) {
      const existingExpense = await Expense.findOne({ id: requestId, userId }).lean();
      if (existingExpense) {
        return NextResponse.json(existingExpense, { status: 200 });
      }
    }

    // 3. Create expense with the user's ID
    const createdExpense = await Expense.create({
      id: expenseId,
      userId,
      amount,
      category,
      description,
      date,
    });

    return NextResponse.json(createdExpense.toObject(), { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses failed:", error);
    
    // Handle duplicate-key races for idempotent requests
    if (
      error instanceof mongoose.Error &&
      "code" in error &&
      error.code === 11000
    ) {
      const duplicateKeyError = error as mongoose.Error & {
        keyValue?: Record<string, unknown>;
      };
      const duplicateId =
        typeof duplicateKeyError.keyValue?.id === "string"
          ? duplicateKeyError.keyValue.id
          : null;

      if (duplicateId) {
        if (!req.auth || !req.auth.user?.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const existingExpense = await Expense.findOne({ id: duplicateId, userId: req.auth.user.id }).lean();
        if (existingExpense) {
          return NextResponse.json(existingExpense, { status: 200 });
        }
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create expense",
        ...(process.env.NODE_ENV !== "production" && error instanceof Error
          ? { detail: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
});
