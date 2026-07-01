"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { registerSchema, RegisterInput, loginSchema, LoginInput } from "./schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

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
