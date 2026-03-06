// Gemini AI service for cooking assistance chatbot
import { API_KEYS, API_ENDPOINTS } from "../constants";
import { ChatMessage, Recipe } from "../types";

const SYSTEM_PROMPT = `You are a friendly and knowledgeable cooking assistant for the KitchenFlicks app. 
Your role is to help users with:
- Cooking tips and techniques
- Ingredient substitutions
- Recipe modifications
- Answering questions about cooking methods
- Suggesting variations of dishes
- Providing nutritional insights

IMPORTANT FORMATTING RULES:
1. Keep your responses short, concise, and highly structured (1-2 short paragraphs maximum).
2. DO NOT use Markdown bolding (like **this**) anywhere in your response. Use plain text only.
3. Be helpful and encouraging, but get straight to the point.

If the user is asking about a specific recipe, use the context provided.
Always be supportive of beginner cooks while also providing advanced tips when needed.`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Send a message to Gemini and get a response
 */
export const sendChatMessage = async (
  message: string,
  recipeContext?: Recipe,
  chatHistory: ChatMessage[] = [],
): Promise<string> => {
  // If no API key configured, return helpful fallback
  if (!API_KEYS.gemini || API_KEYS.gemini === "YOUR_GEMINI_API_KEY") {
    return getFallbackResponse(message, recipeContext);
  }

  try {
    // Build the conversation context
    let contextPrompt = SYSTEM_PROMPT;

    if (recipeContext) {
      contextPrompt += `\n\nCurrent recipe the user is viewing:
Title: ${recipeContext.title}
Ingredients: ${recipeContext.ingredients.join(", ")}
Instructions: ${recipeContext.instructions.substring(0, 500)}...`;
    }

    // Build message history for context ensuring strict alternation
    // The previous messages start from index 1 because index 0 in the UI is a static greeting
    const userRoleHistory = chatHistory.slice(1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Ensure the last message is from the user (which it should be, based on our call setup)
    const messages = [
      {
        role: "user",
        parts: [{ text: contextPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Acknowledged. I am ready to cook!" }],
      },
      ...userRoleHistory,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Combine any consecutive messages of the same role (Gemini requires strict user/model alternation)
    const mergedMessages: any[] = [];
    for (const msg of messages) {
      if (
        mergedMessages.length > 0 &&
        mergedMessages[mergedMessages.length - 1].role === msg.role
      ) {
        mergedMessages[mergedMessages.length - 1].parts[0].text +=
          "\n" + msg.parts[0].text;
      } else {
        mergedMessages.push(msg);
      }
    }

    const response = await fetch(
      `${API_ENDPOINTS.gemini}?key=${API_KEYS.gemini.trim()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: mergedMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    if (!response.ok) {
      console.warn("Gemini API error:", response.status);
      return getFallbackResponse(message, recipeContext);
    }

    const data: GeminiResponse = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    return getFallbackResponse(message, recipeContext);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getFallbackResponse(message, recipeContext);
  }
};

/**
 * Fallback responses when API is not available
 */
const getFallbackResponse = (message: string, recipe?: Recipe): string => {
  const lowerMessage = message.toLowerCase();

  // Common cooking questions with pre-built responses
  if (lowerMessage.includes("substitute") || lowerMessage.includes("replace")) {
    return `For ingredient substitutions, here are some common swaps:
• Butter → Olive oil or coconut oil
• Eggs → Mashed banana, applesauce, or flax egg
• Milk → Almond milk, oat milk, or coconut milk
• Cream → Coconut cream or cashew cream
• Sugar → Honey, maple syrup, or stevia

What specific ingredient would you like to substitute?`;
  }

  if (
    lowerMessage.includes("done") ||
    lowerMessage.includes("ready") ||
    lowerMessage.includes("cooked")
  ) {
    return `Here are some ways to check if your dish is done:
• Meat: Use a meat thermometer (165°F for chicken, 145°F for beef)
• Pasta: It should be al dente - tender but with a slight bite
• Vegetables: Fork-tender but not mushy
• Baked goods: Toothpick comes out clean from the center

The cooking time can vary based on your equipment and ingredient sizes!`;
  }

  if (lowerMessage.includes("tip") || lowerMessage.includes("advice")) {
    return `Here are some general cooking tips:
• Read the entire recipe before starting
• Prep all ingredients before cooking (mise en place)
• Don't overcrowd your pan - cook in batches if needed
• Let meat rest after cooking for juicier results
• Season as you go, tasting frequently
• Sharp knives are safer than dull ones!`;
  }

  if (recipe) {
    return `I'd be happy to help with "${recipe.title}"! 
You can ask me about:
• Ingredient substitutions
• Cooking techniques
• How to know when it's done
• Tips for better results

What would you like to know?`;
  }

  return `I'm here to help with your cooking questions! You can ask me about:
• Ingredient substitutions
• Cooking techniques and tips
• Recipe modifications
• How to tell when food is done cooking

What would you like to know?`;
};

/**
 * Get quick suggestion buttons for the chat
 */
export const getQuickSuggestions = (recipe?: Recipe): string[] => {
  if (recipe) {
    return [
      "What can I substitute?",
      "How do I know when it's done?",
      "Any tips for this recipe?",
      "Make it healthier?",
    ];
  }
  return [
    "Cooking tips for beginners",
    "Common ingredient substitutes",
    "How to meal prep?",
    "Kitchen essentials",
  ];
};
