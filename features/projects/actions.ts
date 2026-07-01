"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { projectFormSchema, type ProjectFormValues } from "./schemas";

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
 * Fetches all active projects for the logged-in user.
 */
export async function getProjects() {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    const projects = await Project.find({
      userId,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: projects.map((project) => ({
        ...project,
        _id: (project._id as any).toString(),
        clientId: (project.clientId as any).toString(),
        createdAt: project.createdAt?.toISOString(),
        updatedAt: project.updatedAt?.toISOString(),
      })),
    };
  } catch (error: unknown) {
    console.error("getProjects error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch projects.",
    };
  }
}

/**
 * Fetches active projects for a specific client.
 */
export async function getProjectsByClientId(clientId: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    const projects = await Project.find({
      clientId,
      userId,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: projects.map((project) => ({
        ...project,
        _id: (project._id as any).toString(),
        clientId: (project.clientId as any).toString(),
        createdAt: project.createdAt?.toISOString(),
        updatedAt: project.updatedAt?.toISOString(),
      })),
    };
  } catch (error: unknown) {
    console.error("getProjectsByClientId error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch client projects.",
    };
  }
}

/**
 * Creates a new project linked to a client.
 * 
 * PLANNING:
 * 1. Validate the form input via Zod.
 * 2. Authenticate the user and confirm client existence/ownership.
 * 3. Create and save the new project document.
 */
export async function createProject(values: ProjectFormValues) {
  try {
    const validated = projectFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid project fields." };
    }

    const userId = await getSessionUserOrThrow();
    await connectDB();

    // Verify client belongs to this user and isn't deleted
    const client = await Client.findOne({
      _id: validated.data.clientId,
      userId,
      isDeleted: { $ne: true },
    }).lean();

    if (!client) {
      return { success: false, error: "Client not found or unauthorized." };
    }

    const newProject = new Project({
      ...validated.data,
      userId,
    });

    await newProject.save();

    revalidatePath("/clients");
    revalidatePath(`/clients/${validated.data.clientId}`);
    return {
      success: true,
      data: {
        ...newProject.toObject(),
        _id: newProject._id.toString(),
        clientId: newProject.clientId.toString(),
      },
    };
  } catch (error: unknown) {
    console.error("createProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project.",
    };
  }
}

/**
 * Updates an existing project.
 * 
 * PLANNING:
 * 1. Validate the form input via Zod.
 * 2. Confirm user ownership of the project.
 * 3. Update the project document fields.
 */
export async function updateProject(id: string, values: ProjectFormValues) {
  try {
    const validated = projectFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid project fields." };
    }

    const userId = await getSessionUserOrThrow();
    await connectDB();

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: validated.data },
      { new: true }
    ).lean();

    if (!updatedProject) {
      return { success: false, error: "Project not found or unauthorized." };
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${validated.data.clientId}`);
    return {
      success: true,
      data: {
        ...updatedProject,
        _id: (updatedProject._id as any).toString(),
        clientId: (updatedProject.clientId as any).toString(),
      },
    };
  } catch (error: unknown) {
    console.error("updateProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project.",
    };
  }
}

/**
 * Soft deletes a project.
 * 
 * PLANNING:
 * 1. Authenticate user and confirm project ownership.
 * 2. Soft delete the project (isDeleted: true, deletedAt: now).
 */
export async function deleteProject(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    const deletedProject = await Project.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deletedProject) {
      return { success: false, error: "Project not found or unauthorized." };
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${deletedProject.clientId}`);
    return { success: true, message: "Project deleted successfully." };
  } catch (error: unknown) {
    console.error("deleteProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project.",
    };
  }
}
