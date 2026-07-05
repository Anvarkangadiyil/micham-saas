"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import { clientFormSchema, type ClientFormValues } from "./schemas";
import { serialize } from "@/lib/utils";
import { checkDemoRestriction } from "@/lib/demo";

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
 * Fetches all active clients for the logged-in user.
 */
export async function getClients() {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    const clients = await Client.find({
      userId,
      isDeleted: { $ne: true },
    })
      .sort({ name: 1 })
      .lean();

    // Serialize MongoDB objects for Client components (converting ObjectIds to string)
    return {
      success: true,
      data: serialize(
        clients.map((client) => ({
          ...client,
          _id: (client._id as any).toString(),
          createdAt: client.createdAt?.toISOString(),
          updatedAt: client.updatedAt?.toISOString(),
        }))
      ),
    };
  } catch (error: unknown) {
    console.error("getClients error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch clients.",
    };
  }
}

/**
 * Fetches a single client by ID.
 */
export async function getClientById(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await connectDB();

    const client = await Client.findOne({
      _id: id,
      userId,
      isDeleted: { $ne: true },
    }).lean();

    if (!client) {
      return { success: false, error: "Client not found." };
    }

    return {
      success: true,
      data: serialize({
        ...client,
        _id: (client._id as any).toString(),
        createdAt: client.createdAt?.toISOString(),
        updatedAt: client.updatedAt?.toISOString(),
      }),
    };
  } catch (error: unknown) {
    console.error("getClientById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch client details.",
    };
  }
}

/**
 * Creates a new client.
 * 
 * PLANNING:
 * 1. Validate the form input via Zod.
 * 2. Authenticate the user and retrieve the userId.
 * 3. Save the new client document in MongoDB under the user's scope.
 */
export async function createClient(values: ClientFormValues) {
  try {
    const validated = clientFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid client fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("create client");
    await connectDB();

    const newClient = new Client({
      ...validated.data,
      userId,
    });

    await newClient.save();

    revalidatePath("/clients");
    return {
      success: true,
      data: serialize({
        ...newClient.toObject(),
        _id: newClient._id.toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("createClient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client.",
    };
  }
}

/**
 * Updates an existing client.
 * 
 * PLANNING:
 * 1. Validate the form input via Zod.
 * 2. Verify that the client belongs to the authenticated user.
 * 3. Update the client fields in the database.
 */
export async function updateClient(id: string, values: ClientFormValues) {
  try {
    const validated = clientFormSchema.safeParse(values);
    if (!validated.success) {
      return { success: false, error: "Invalid client fields." };
    }

    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("update client");
    await connectDB();

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: validated.data },
      { new: true }
    ).lean();

    if (!updatedClient) {
      return { success: false, error: "Client not found or unauthorized." };
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return {
      success: true,
      data: serialize({
        ...updatedClient,
        _id: (updatedClient._id as any).toString(),
      }),
    };
  } catch (error: unknown) {
    console.error("updateClient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client.",
    };
  }
}

/**
 * Soft deletes a client and all associated projects.
 * 
 * PLANNING:
 * 1. Authenticate user and confirm client ownership.
 * 2. Mark the client as deleted (isDeleted: true, deletedAt: now).
 * 3. Soft delete all projects linked to this client to avoid orphaned active projects.
 */
export async function deleteClient(id: string) {
  try {
    const userId = await getSessionUserOrThrow();
    await checkDemoRestriction("delete client");
    await connectDB();

    // Soft delete the client
    const deletedClient = await Client.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!deletedClient) {
      return { success: false, error: "Client not found or unauthorized." };
    }

    // Soft delete all projects associated with this client
    await Project.updateMany(
      { clientId: id, userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    revalidatePath("/clients");
    return { success: true, message: "Client and associated projects deleted successfully." };
  } catch (error: unknown) {
    console.error("deleteClient error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete client.",
    };
  }
}
