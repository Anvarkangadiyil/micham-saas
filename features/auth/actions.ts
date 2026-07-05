"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { registerSchema, RegisterInput, loginSchema, LoginInput } from "./schemas";
import { signIn, auth, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { checkDemoRestriction } from "@/lib/demo";

/**
 * Registers a new user in the database.
 */
export async function registerUser(values: RegisterInput) {
  try {
    const validated = registerSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid input fields." };
    }

    const { name, email, password } = validated.data;

    await connectDB();

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create and save the new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    return { success: true, message: "Registration successful. You can now log in." };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred during registration. Please try again.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Logs in a user using NextAuth credentials provider.
 */
export async function loginUser(values: LoginInput) {
  const validated = loginSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: "Invalid email or password." };
  }

  const { email, password } = validated.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Could not sign in. Something went wrong." };
      }
    }
    // NextAuth redirects by throwing a special error; we must rethrow it for the redirect to function.
    throw error;
  }
}

/**
 * Checks if the user is authenticated and returns their userId.
 */
async function getSessionUserOrThrow() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please log in.");
  }
  return session.user.id;
}

/**
 * Fetches user settings (name, email, currencySymbol).
 */
export async function getUserSettings() {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
      return { success: false, error: "User not found." };
    }

    return {
      success: true,
      data: {
        name: user.name,
        email: user.email,
        currencySymbol: user.currencySymbol || "$",
      },
    };
  } catch (error: unknown) {
    console.error("getUserSettings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings.",
    };
  }
}

/**
 * Updates user settings (name, currencySymbol).
 */
export async function updateUserSettings(name: string, currencySymbol: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("update settings");
    if (!name || name.trim() === "") {
      return { success: false, error: "Name is required." };
    }
    if (!currencySymbol || currencySymbol.trim() === "") {
      return { success: false, error: "Currency symbol is required." };
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, currencySymbol } },
      { new: true }
    );

    if (!updatedUser) {
      return { success: false, error: "User not found." };
    }

    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath("/clients");
    revalidatePath("/settings");

    return { success: true, message: "Settings updated successfully." };
  } catch (error: unknown) {
    console.error("updateUserSettings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings.",
    };
  }
}

/**
 * Soft deletes user account.
 */
export async function deleteUserAccount() {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("delete account");
    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!user) {
      return { success: false, error: "User not found." };
    }

    return { success: true, message: "Account deleted successfully." };
  } catch (error: unknown) {
    console.error("deleteUserAccount error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete account.",
    };
  }
}

/**
 * Logs out the current user.
 */
export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
