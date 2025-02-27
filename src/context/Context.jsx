import { createContext, useState, useEffect, useCallback, useRef } from "react";
import run, { clearHistory, getHistory } from "../config/gemini";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this package

// Create context with default values
export const Context = createContext({
  prevPrompts: [],
  setPrevPrompts: () => {},
  onSent: async () => {},
  input: "",
  setInput: () => {},
  recentPrompt: "",
  setRecentPrompt: () => {},
  showResult: false,
  loading: false,
  resultData: "",
  newChat: () => {},
  clearChat: () => {},
  conversations: [],
  activeConversationId: null,
  setActiveConversationId: () => {},
  deleteConversation: () => {},
  renameConversation: () => {},
});

// Utility function to generate a default title from a prompt
const generateTitleFromPrompt = (prompt) => {
  // Take first 30 characters of prompt for the title
  let title = prompt.slice(0, 30).trim();
  if (prompt.length > 30) title += "...";
  return title;
};

const ContextProvider = ({ children }) => {
  // State management
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState(null);

  // Conversation management
  const [conversations, setConversations] = useState(() => {
    // Initialize from localStorage if available
    const savedConversations = localStorage.getItem("conversations");
    return savedConversations ? JSON.parse(savedConversations) : [];
  });

  const [activeConversationId, setActiveConversationId] = useState(() => {
    // Get active conversation from localStorage or null if none exists
    const activeId = localStorage.getItem("activeConversationId");
    const savedConversations = localStorage.getItem("conversations");
    const parsedConversations = savedConversations
      ? JSON.parse(savedConversations)
      : [];

    // Check if the saved active conversation still exists
    if (activeId && parsedConversations.some((conv) => conv.id === activeId)) {
      return activeId;
    }
    return parsedConversations.length > 0 ? parsedConversations[0].id : null;
  });

  // For backward compatibility - derived from the active conversation
  const [prevPrompts, setPrevPrompts] = useState([]);

  // Refs
  const timeoutRefs = useRef([]);
  const abortControllerRef = useRef(null);

  // Update prevPrompts when active conversation changes (for backward compatibility)
  useEffect(() => {
    if (activeConversationId) {
      const activeConversation = conversations.find(
        (conv) => conv.id === activeConversationId
      );
      if (activeConversation) {
        // Extract just the user prompts from the messages
        const prompts = activeConversation.messages
          .filter((msg) => msg.role === "user")
          .map((msg) => msg.content);
        setPrevPrompts(prompts);
      }
    } else {
      setPrevPrompts([]);
    }
  }, [activeConversationId, conversations]);

  // Save conversations to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    } catch (err) {
      console.warn("Could not save conversations to localStorage:", err);
    }
  }, [conversations]);

  // Save active conversation ID to localStorage when it changes
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("activeConversationId", activeConversationId);
    } else {
      localStorage.removeItem("activeConversationId");
    }
  }, [activeConversationId]);

  // Cancel all pending timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Processes response text to prepare for Markdown rendering
   * @param {string} text - Raw response text
   * @returns {string} - Processed text ready for Markdown
   */
  const processResponseText = useCallback((text) => {
    if (!text) return "";

    try {
      // Convert HTML to Markdown syntax
      // First, remove any HTML formatting that might exist and convert to pure Markdown
      let processed = text;

      // Replace HTML bold tags with Markdown bold syntax
      processed = processed.replace(/<b>(.*?)<\/b>/g, "**$1**");

      // Replace HTML line breaks with Markdown line breaks (two spaces + newline)
      processed = processed.replace(/<br\s*\/?>/g, "  \n");

      // Remove any other HTML tags but keep their content
      processed = processed.replace(/<[^>]*>/g, "");

      // Ensure code blocks are properly formatted
      // This regex looks for code blocks and ensures they have proper Markdown syntax
      processed = processed.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (match, lang, code) => {
          return `\`\`\`${lang || ""}\n${code.trim()}\n\`\`\``;
        }
      );

      return processed;
    } catch (error) {
      console.error("Error processing response text:", error);
      return text; // Return original text if processing fails
    }
  }, []);

  /**
   * Displays text with a typewriter effect
   * @param {string} text - Text to display
   * @param {number} delay - Delay between characters
   */
  const typewriterEffect = useCallback((text, delay = 20) => {
    // Clear previous timeouts
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current = [];

    // Reset result
    setResultData("");

    // For very long responses, display in chunks
    const useChunks = text.length > 5000;

    if (useChunks) {
      const chunkSize = 500;
      const chunks = [];

      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
      }

      chunks.forEach((chunk, index) => {
        const timeout = setTimeout(() => {
          setResultData((prev) => prev + chunk);
        }, delay * index * 10);

        timeoutRefs.current.push(timeout);
      });
    } else {
      // Character by character typing for shorter responses
      // Using characters instead of words for better Markdown rendering
      const chars = text.split("");

      chars.forEach((char, index) => {
        const timeout = setTimeout(() => {
          setResultData((prev) => {
            // Handle null or undefined previous state
            if (prev === null || prev === undefined) {
              return char;
            }
            return prev + char;
          });
        }, delay * (index / 5)); // Divide by 5 to make it faster than word-by-word

        timeoutRefs.current.push(timeout);
      });
    }
  }, []);

  /**
   * Creates a new conversation
   */
  const newChat = useCallback(() => {
    const newConversationId = uuidv4();

    // Create a new conversation
    const newConversation = {
      id: newConversationId,
      title: "New Conversation",
      timestamp: Date.now(),
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);

    // Reset UI state
    setShowResult(false);
    setResultData("");
    setRecentPrompt("");
    setError(null);
    clearHistory(); // Clear chat history in the API
  }, []);

  /**
   * Delete a conversation by ID
   * @param {string} conversationId - ID of conversation to delete
   */
  const deleteConversation = useCallback(
    (conversationId) => {
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      // If the deleted conversation was active, set a new active conversation
      if (activeConversationId === conversationId) {
        setConversations((prev) => {
          if (prev.length > 0) {
            setActiveConversationId(prev[0].id);
          } else {
            setActiveConversationId(null);
            newChat(); // Create a new conversation if all are deleted
          }
          return prev;
        });
      }
    },
    [activeConversationId, newChat]
  );

  /**
   * Rename a conversation
   * @param {string} conversationId - ID of conversation to rename
   * @param {string} newTitle - New title for the conversation
   */
  const renameConversation = useCallback((conversationId, newTitle) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, title: newTitle, timestamp: Date.now() }
          : conv
      )
    );
  }, []);

  /**
   * Updates the active conversation with new messages
   * @param {object} userMessage - User message to add
   * @param {object} assistantMessage - Assistant message to add
   */
  const updateConversation = useCallback(
    (userMessage, assistantMessage = null) => {
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === activeConversationId) {
            // Add user message
            const updatedMessages = [...conv.messages, userMessage];

            // Add assistant message if provided
            if (assistantMessage) {
              updatedMessages.push(assistantMessage);
            }

            // Update conversation title if it's still the default
            let title = conv.title;
            if (conv.title === "New Conversation" && userMessage.content) {
              title = generateTitleFromPrompt(userMessage.content);
            }

            return {
              ...conv,
              title,
              timestamp: Date.now(),
              messages: updatedMessages,
            };
          }
          return conv;
        });
      });
    },
    [activeConversationId]
  );

  /**
   * Loads a specific conversation and displays it
   * @param {string} conversationId - ID of conversation to load
   */
  const loadConversation = useCallback(
    (conversationId) => {
      const conversation = conversations.find(
        (conv) => conv.id === conversationId
      );

      if (conversation) {
        setActiveConversationId(conversationId);

        // If conversation has messages, show the last exchange
        if (conversation.messages.length > 0) {
          const lastUserMessage = [...conversation.messages]
            .reverse()
            .find((msg) => msg.role === "user");

          const lastAssistantMessage = [...conversation.messages]
            .reverse()
            .find((msg) => msg.role === "assistant");

          if (lastUserMessage) {
            setRecentPrompt(lastUserMessage.content);
          }

          if (lastAssistantMessage) {
            setResultData(lastAssistantMessage.content);
            setShowResult(true);
          }
        } else {
          // Empty conversation
          setShowResult(false);
          setResultData("");
          setRecentPrompt("");
        }
      }
    },
    [conversations]
  );

  /**
   * Sends a prompt to the API and handles the response
   * @param {string} promptOverride - Optional prompt to override the input state
   */
  const onSent = useCallback(
    async (promptOverride) => {
      // Reset states
      setError(null);
      setResultData("");
      setLoading(true);
      setShowResult(true);

      // Create abort controller for API request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        // Determine the prompt to use and ensure it's a string
        let currentPrompt =
          promptOverride !== undefined ? promptOverride : input;

        // Convert to string if it's not already (handles null, undefined, numbers, etc.)
        currentPrompt = String(currentPrompt || "");

        if (!currentPrompt.trim()) {
          throw new Error("Please enter a valid prompt");
        }

        console.log("Sending prompt:", currentPrompt);

        // Create a user message object
        const userMessage = {
          id: uuidv4(),
          role: "user",
          content: currentPrompt,
          timestamp: Date.now(),
        };

        // Create or ensure a conversation exists
        if (!activeConversationId || conversations.length === 0) {
          newChat();
        }

        // Update UI state
        setRecentPrompt(currentPrompt);

        // Update the conversation with the user message
        updateConversation(userMessage);

        // Initial feedback to improve UX
        setResultData("Thinking...");

        // Call the API with custom error handling
        const response = await Promise.race([
          run(currentPrompt),
          new Promise((_, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Request timed out. Please try again."));
            }, 30000); // 30-second timeout

            abortControllerRef.current.signal.addEventListener("abort", () => {
              clearTimeout(timeout);
              reject(new Error("Request was cancelled"));
            });
          }),
        ]);

        // Validate response
        if (!response) {
          throw new Error("No response received from API");
        }

        console.log("Received response of length:", response.length);

        // Process the response text for Markdown
        const processedResponse = processResponseText(response);

        // Create an assistant message object
        const assistantMessage = {
          id: uuidv4(),
          role: "assistant",
          content: processedResponse,
          timestamp: Date.now(),
        };

        // Update the conversation with the assistant response
        updateConversation(userMessage, assistantMessage);

        // Display with typewriter effect
        typewriterEffect(processedResponse);

        // Clear input after successful request
        setInput("");
      } catch (error) {
        console.error("Error in onSent:", error);

        // Create an error message from the assistant
        const errorMessage = {
          id: uuidv4(),
          role: "assistant",
          content: `Error: ${error.message}`,
          timestamp: Date.now(),
          isError: true,
        };

        // Update the conversation with the error
        if (activeConversationId) {
          updateConversation(null, errorMessage);
        }

        // Handle different error types
        if (error.message.includes("API key")) {
          setError("API key error. Please check your configuration.");
        } else if (error.message.includes("timed out")) {
          setError("Request timed out. Please try again.");
        } else if (error.message.includes("cancelled")) {
          setError("Request was cancelled.");
        } else {
          setError(`Error: ${error.message}`);
        }

        setResultData(`Sorry, there was an error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    },
    [
      input,
      activeConversationId,
      conversations,
      newChat,
      processResponseText,
      typewriterEffect,
      updateConversation,
    ]
  );

  // Load active conversation on initial render
  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    } else if (conversations.length > 0) {
      // If no active conversation but conversations exist, load the most recent one
      setActiveConversationId(conversations[0].id);
    } else {
      // If no conversations exist, create a new one
      newChat();
    }
  }, [activeConversationId, conversations, loadConversation, newChat]);

  // Stop the typewriter effect and show full response
  const stopTypewriter = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current = [];

    // Get the full content of the current conversation
    if (activeConversationId) {
      const conversation = conversations.find(
        (conv) => conv.id === activeConversationId
      );
      if (conversation) {
        const lastAssistantMessage = [...conversation.messages]
          .reverse()
          .find((msg) => msg.role === "assistant");

        if (lastAssistantMessage) {
          setResultData(lastAssistantMessage.content);
        }
      }
    }
  }, [activeConversationId, conversations]);

  /**
   * Clear all conversations and start fresh
   */
  const clearChat = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
    setPrevPrompts([]);
    newChat();

    try {
      localStorage.removeItem("conversations");
      localStorage.removeItem("activeConversationId");
    } catch (err) {
      console.warn("Could not clear localStorage:", err);
    }
  }, [newChat]);

  // Context value with all provided functions and state
  const contextValue = {
    // Original context values for backward compatibility
    prevPrompts,
    setPrevPrompts,
    onSent,
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    showResult,
    setShowResult,
    loading,
    resultData,
    setResultData,
    newChat,
    clearChat,
    error,
    stopTypewriter,
    history: getHistory,

    // New conversation management functionality
    conversations,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    renameConversation,
    loadConversation,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
