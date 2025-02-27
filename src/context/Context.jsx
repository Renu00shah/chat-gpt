import { createContext, useState, useEffect, useCallback, useRef } from "react";
import run, { clearHistory, getHistory } from "../config/gemini";
import { v4 as uuidv4 } from "uuid";

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

const generateTitleFromPrompt = (prompt) => {
  let title = prompt.slice(0, 30).trim();
  if (prompt.length > 30) title += "...";
  return title;
};

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState(null);

  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem("conversations");
    return savedConversations ? JSON.parse(savedConversations) : [];
  });

  const [activeConversationId, setActiveConversationId] = useState(() => {
    const activeId = localStorage.getItem("activeConversationId");
    const savedConversations = localStorage.getItem("conversations");
    const parsedConversations = savedConversations
      ? JSON.parse(savedConversations)
      : [];

    if (activeId && parsedConversations.some((conv) => conv.id === activeId)) {
      return activeId;
    }
    return parsedConversations.length > 0 ? parsedConversations[0].id : null;
  });

  const [prevPrompts, setPrevPrompts] = useState([]);

  const timeoutRefs = useRef([]);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (activeConversationId) {
      const activeConversation = conversations.find(
        (conv) => conv.id === activeConversationId
      );
      if (activeConversation) {
        const prompts = activeConversation.messages
          .filter((msg) => msg.role === "user")
          .map((msg) => msg.content);
        setPrevPrompts(prompts);
      }
    } else {
      setPrevPrompts([]);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    try {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    } catch (err) {
      console.warn("Could not save conversations to localStorage:", err);
    }
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("activeConversationId", activeConversationId);
    } else {
      localStorage.removeItem("activeConversationId");
    }
  }, [activeConversationId]);

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
      let processed = text;

      processed = processed.replace(/<b>(.*?)<\/b>/g, "**$1**");

      processed = processed.replace(/<br\s*\/?>/g, "  \n");

      processed = processed.replace(/<[^>]*>/g, "");

      processed = processed.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (match, lang, code) => {
          return `\`\`\`${lang || ""}\n${code.trim()}\n\`\`\``;
        }
      );

      return processed;
    } catch (error) {
      console.error("Error processing response text:", error);
      return text;
    }
  }, []);

  /**
   * Displays text with a typewriter effect
   * @param {string} text - Text to display
   * @param {number} delay - Delay between characters
   */
  const typewriterEffect = useCallback((text, delay = 20) => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current = [];

    setResultData("");

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
      const chars = text.split("");

      chars.forEach((char, index) => {
        const timeout = setTimeout(() => {
          setResultData((prev) => {
            if (prev === null || prev === undefined) {
              return char;
            }
            return prev + char;
          });
        }, delay * (index / 5));

        timeoutRefs.current.push(timeout);
      });
    }
  }, []);

  const newChat = useCallback(() => {
    const newConversationId = uuidv4();

    const newConversation = {
      id: newConversationId,
      title: "New Conversation",
      timestamp: Date.now(),
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);

    setShowResult(false);
    setResultData("");
    setRecentPrompt("");
    setError(null);
    clearHistory();
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

      if (activeConversationId === conversationId) {
        setConversations((prev) => {
          if (prev.length > 0) {
            setActiveConversationId(prev[0].id);
          } else {
            setActiveConversationId(null);
            newChat();
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
            const updatedMessages = [...conv.messages, userMessage];

            if (assistantMessage) {
              updatedMessages.push(assistantMessage);
            }

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

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        let currentPrompt =
          promptOverride !== undefined ? promptOverride : input;

        currentPrompt = String(currentPrompt || "");

        if (!currentPrompt.trim()) {
          throw new Error("Please enter a valid prompt");
        }

        console.log("Sending prompt:", currentPrompt);

        const userMessage = {
          id: uuidv4(),
          role: "user",
          content: currentPrompt,
          timestamp: Date.now(),
        };

        if (!activeConversationId || conversations.length === 0) {
          newChat();
        }

        setRecentPrompt(currentPrompt);

        updateConversation(userMessage);

        setResultData("Thinking...");

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

        if (!response) {
          throw new Error("No response received from API");
        }

        console.log("Received response of length:", response.length);

        const processedResponse = processResponseText(response);

        const assistantMessage = {
          id: uuidv4(),
          role: "assistant",
          content: processedResponse,
          timestamp: Date.now(),
        };

        updateConversation(userMessage, assistantMessage);

        typewriterEffect(processedResponse);

        setInput("");
      } catch (error) {
        console.error("Error in onSent:", error);

        const errorMessage = {
          id: uuidv4(),
          role: "assistant",
          content: `Error: ${error.message}`,
          timestamp: Date.now(),
          isError: true,
        };

        if (activeConversationId) {
          updateConversation(null, errorMessage);
        }

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

  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    } else if (conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    } else {
      newChat();
    }
  }, [activeConversationId, conversations, loadConversation, newChat]);

  const stopTypewriter = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current = [];

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
