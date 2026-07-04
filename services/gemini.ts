import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Initialize the Google Gemini provider manually using our configured GEMINI_API_KEY
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

/**
 * Suggests an expense category based on the provided description.
 * Expected categories: "software", "travel", "equipment", "marketing", "other"
 */
export async function suggestExpenseCategory(description: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key is missing. Skipping category suggestion.");
    return "other";
  }

  if (!description || description.trim() === "") {
    return "other";
  }

  try {
    const { text } = await generateText({
      model: googleProvider("gemini-2.5-flash-lite"),
      system: "You are an AI assistant that categorizes business expenses. You must respond with EXACTLY one of the following category strings: 'software', 'travel', 'equipment', 'marketing', 'other'. Do not include any punctuation, quotes, uppercase letters, or additional explanation.",
      prompt: `Categorize this expense: "${description}"`,
      temperature: 0.1,
      abortSignal: AbortSignal.timeout(4000), // 4-second timeout limit
    });

    const suggestion = text.trim().toLowerCase();
    const validCategories = ["software", "travel", "equipment", "marketing", "other"];
    if (validCategories.includes(suggestion)) {
      return suggestion;
    }

    return "other";
  } catch (error) {
    console.error("suggestExpenseCategory error:", error);
    return "other"; // Default graceful fallback
  }
}

/**
 * Polishes rough freelancer notes into a professional invoice line-item description.
 */
export async function polishInvoiceLineItemDescription(roughNotes: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    console.warn("Gemini API key is missing. Skipping line item polishing.");
    return roughNotes;
  }

  if (!roughNotes || roughNotes.trim() === "") {
    return roughNotes;
  }

  try {
    const { text } = await generateText({
      model: googleProvider(""),
      system: "You are a professional copywriter. Rewrite the user's rough notes into a concise, professional invoice line-item description (max 100 characters). Respond with ONLY the polished text. Do not add quotes, introductions, bullet points, or sign-offs.",
      prompt: `Rough notes: "${roughNotes}"`,
      temperature: 0.3,
      abortSignal: AbortSignal.timeout(4000), // 4-second timeout limit
    });

    const polished = text.trim();
    return polished || roughNotes;
  } catch (error) {
    console.error("polishInvoiceLineItemDescription error:", error);
    return roughNotes; // Default graceful fallback
  }
}
