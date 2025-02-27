import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Initialize API with environment variable
const apiKey = import.meta.env.VITE_API_KEY;

// Error handling for missing API key
if (!apiKey) {
  console.error("API key is missing! Please check your environment variables.");
}

// Initialize the API client
const genAI = new GoogleGenerativeAI(apiKey);

// Model configuration
const MODEL_NAME = "gemini-2.0-flash";

// Default generation configuration
const defaultGenerationConfig = {
  temperature: 0.9, // Slightly reduced for more focused responses
  topP: 0.95, // Controls diversity
  topK: 40, // Controls randomness
  maxOutputTokens: 8192, // Maximum output size
  responseMimeType: "text/plain",
};

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Chat history storage
let chatHistory = [];

/**
 * Run a prompt through the GenericChat API
 * @param {string} prompt - The user prompt
 * @param {Object} customConfig - Optional custom configuration
 * @param {boolean} useHistory - Whether to use chat history
 * @returns {Promise<string>} - The model's response
 */
async function run(prompt, customConfig = {}, useHistory = true) {
  try {
    // Validate input
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt provided");
    }

    // Merge default config with any custom config
    const generationConfig = {
      ...defaultGenerationConfig,
      ...customConfig,
    };

    // Initialize chat
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    });

    // Start chat session with or without history
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: useHistory ? chatHistory : [],
    });

    console.log(
      `Sending prompt to GenericChat: "${prompt.substring(0, 50)}${
        prompt.length > 50 ? "..." : ""
      }"`
    );

    // Send message and wait for response
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    // Update chat history if using history
    if (useHistory) {
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      chatHistory.push({ role: "model", parts: [{ text: responseText }] });

      // Keep history at a reasonable size (last 10 exchanges = 20 messages)
      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(chatHistory.length - 20);
      }
    }

    return responseText;
  } catch (error) {
    console.error("Error in GenericChat API call:", error);

    // Return user-friendly error message
    if (error.message.includes("API key")) {
      return "Error: API key issue. Please check your configuration.";
    } else if (error.message.includes("quota")) {
      return "Error: API quota exceeded. Please try again later.";
    } else {
      return `Sorry, there was an error processing your request: ${error.message}`;
    }
  }
}

/**
 * Clear the current chat history
 */
function clearHistory() {
  chatHistory = [];
  console.log("Chat history cleared");
  return true;
}

/**
 * Get the current chat history
 * @returns {Array} - The current chat history
 */
function getHistory() {
  return chatHistory;
}

export default run;
export { clearHistory, getHistory };
