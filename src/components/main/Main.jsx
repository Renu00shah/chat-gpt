import React, { useContext, useRef, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Main() {
  const {
    prevPrompts,
    onSent,
    input,
    setInput,
    recentPrompt,
    showResult,
    loading,
    resultData,
    newChat,
    clearChat,
    stopTypewriter,
  } = useContext(Context);

  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Scroll to bottom of results when new content is added
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [resultData]);

  // Focus input when component loads
  useEffect(() => {
    if (inputRef.current && !showResult) {
      inputRef.current.focus();
    }
  }, [showResult]);

  // Handle Enter key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      onSent();
    } else if (e.key === "Enter" && e.shiftKey) {
      // Allow multiline input with Shift+Enter
      setInput((prev) => prev + "\n");
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => onSent(suggestion), 100);
  };

  // Copy response to clipboard
  const copyToClipboard = () => {
    if (resultData) {
      navigator.clipboard.writeText(resultData).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Enhance suggestions with more variety and usefulness
  const suggestions = [
    {
      text: "Suggest beautiful places on our road trip",
      icon: assets.compass_icon,
      description: "Find unique destinations",
    },
    {
      text: "Get innovative ideas for a project",
      icon: assets.bulb_icon,
      description: "Brainstorm creativity",
    },
    {
      text: "Explain complex concepts simply",
      icon: assets.message_icon,
      description: "Learn something new",
    },
    {
      text: "Generate some code snippets",
      icon: assets.code_icon,
      description: "Help with programming",
    },
    {
      text: "Summarize this article for me",
      icon: assets.document_icon || assets.message_icon,
      description: "Quick content digestion",
    },
    {
      text: "Help me troubleshoot a bug",
      icon: assets.code_icon,
      description: "Technical support",
    },
  ];

  return (
    <div
      className={`flex h-screen ${
        theme === "dark"
          ? "dark bg-gray-900 text-gray-100"
          : "bg-white text-gray-800"
      }`}
    >
      {/* Main content */}
      <div className="flex-grow flex flex-col min-h-screen relative">
        {/* Top Section */}
        <header
          className={`flex items-center justify-between p-4 border-b ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src={assets.gemini_icon} alt="Gemini" className="w-8 h-8" />
              <p
                className={`text-lg font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-600"
                }`}
              >
                Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showResult && (
              <button
                onClick={newChat}
                className={`text-sm px-3 py-1 rounded-full transition-colors
                  ${
                    theme === "dark"
                      ? "bg-blue-900 text-blue-100 hover:bg-blue-800"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                aria-label="Start new chat"
              >
                New Chat
              </button>
            )}

            <img
              className="rounded-full w-10 h-10 border-2 border-gray-200"
              src={assets.user_icon}
              alt="User profile"
            />
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4">
          {/* Greeting & Prompt Section */}
          {!showResult ? (
            <div
              className={`text-center font-medium mt-6 animate-fade-in ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                  Hello, Dev
                </span>
              </h1>
              <p
                className={`text-2xl md:text-3xl mt-2 mb-8 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                How can I help you today?
              </p>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 max-w-3xl mx-auto">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.text)}
                    className={`flex items-start p-4 rounded-lg transition-all duration-200 text-left group
                      ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
                          : "bg-white hover:bg-blue-50 shadow-md border border-transparent hover:border-blue-200"
                      }`}
                    aria-label={`Use suggestion: ${item.text}`}
                  >
                    <div className="flex-grow">
                      <p
                        className={`text-sm md:text-[15px] font-medium ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {item.text}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                    <div
                      className={`rounded-full p-2 
                      ${
                        theme === "dark"
                          ? "bg-gray-700 group-hover:bg-gray-600"
                          : "bg-blue-50 group-hover:bg-blue-100"
                      } transition-colors`}
                    >
                      <img
                        width={24}
                        height={24}
                        src={item.icon}
                        alt=""
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 p-4 md:p-6 max-w-[800px] mx-auto">
              {/* User Query */}
              <div
                className={`flex items-start gap-3 w-full p-3 md:p-4 rounded-lg
                ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} ${
                  theme === "dark" ? "shadow-lg" : "shadow"
                }`}
              >
                <img
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full mt-1"
                  src={assets.user_icon}
                  alt=""
                  aria-hidden="true"
                />
                <div className="flex-grow">
                  <p
                    className={`font-medium text-sm mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    You
                  </p>
                  <p
                    className={`text-sm md:text-base break-words whitespace-pre-wrap ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {recentPrompt}
                  </p>
                </div>
              </div>

              {/* Gemini Response */}
              <div
                className={`flex items-start gap-3 w-full p-3 md:p-4 rounded-lg 
                ${
                  theme === "dark" ? "bg-gray-900 shadow-lg" : "bg-white shadow"
                }`}
              >
                <img
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full mt-1"
                  src={assets.gemini_icon}
                  alt=""
                  aria-hidden="true"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <p
                      className={`font-medium text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      Gemini
                    </p>

                    {resultData && !loading && (
                      <div className="flex gap-2">
                        {loading && (
                          <button
                            onClick={stopTypewriter}
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            aria-label="Stop typing animation and show full response"
                          >
                            Show all
                          </button>
                        )}
                        <button
                          onClick={copyToClipboard}
                          className={`text-xs flex items-center gap-1 ${
                            theme === "dark"
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          aria-label="Copy response to clipboard"
                        >
                          {copied ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="9"
                                  y="9"
                                  width="13"
                                  height="13"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    ref={resultRef}
                    className={`w-full overflow-y-auto max-h-[600px] pb-2 pr-2 scrollbar-thin 
                      ${
                        theme === "dark"
                          ? "scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                          : "scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      }`}
                  >
                    {!loading ? (
                      <div
                        className={`text-sm md:text-[17px] font-light leading-[1.6] md:leading-[1.8] break-words whitespace-pre-wrap markdown-content
                        ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={atomDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code
                                  className={`${className} ${
                                    theme === "dark"
                                      ? "bg-gray-800"
                                      : "bg-gray-100"
                                  } px-1 py-0.5 rounded`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            a: ({ node, ...props }) => (
                              <a
                                className={`hover:underline ${
                                  theme === "dark"
                                    ? "text-blue-400"
                                    : "text-blue-500"
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                              />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-2xl font-bold mt-6 mb-4"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-xl font-bold mt-5 mb-3"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-lg font-bold mt-4 mb-2"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-4" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc ml-5 mb-4" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-decimal ml-5 mb-4"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="mb-1" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className={`border-l-4 pl-4 italic my-4 ${
                                  theme === "dark"
                                    ? "border-gray-600"
                                    : "border-gray-300"
                                }`}
                                {...props}
                              />
                            ),
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-4">
                                <table
                                  className={`min-w-full border-collapse border ${
                                    theme === "dark"
                                      ? "border-gray-700"
                                      : "border-gray-300"
                                  }`}
                                  {...props}
                                />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead
                                className={
                                  theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                                }
                                {...props}
                              />
                            ),
                            th: ({ node, ...props }) => (
                              <th
                                className={`border px-4 py-2 text-left ${
                                  theme === "dark"
                                    ? "border-gray-700"
                                    : "border-gray-300"
                                }`}
                                {...props}
                              />
                            ),
                            td: ({ node, ...props }) => (
                              <td
                                className={`border px-4 py-2 ${
                                  theme === "dark"
                                    ? "border-gray-700"
                                    : "border-gray-300"
                                }`}
                                {...props}
                              />
                            ),
                            hr: ({ node, ...props }) => (
                              <hr
                                className={`my-4 ${
                                  theme === "dark"
                                    ? "border-gray-700"
                                    : "border-gray-300"
                                }`}
                                {...props}
                              />
                            ),
                          }}
                        >
                          {resultData}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <div className="animate-pulse">Thinking</div>
                        <div className="flex gap-1">
                          <span className="animate-bounce delay-100">.</span>
                          <span className="animate-bounce delay-200">.</span>
                          <span className="animate-bounce delay-300">.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Section */}
        <footer
          className={`sticky bottom-0 p-4 border-t ${
            theme === "dark"
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="max-w-[800px] mx-auto">
            <div
              className={`flex items-center p-2 md:p-3 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } 
              ${theme === "dark" ? "shadow-lg" : "shadow-md"} ${
                theme === "dark" ? "border-gray-700" : "border border-gray-200"
              }`}
            >
              <textarea
                ref={inputRef}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                value={input}
                rows={
                  input.split("\n").length > 3
                    ? 3
                    : Math.max(1, input.split("\n").length)
                }
                className={`flex-1 p-2 text-sm md:text-base outline-none resize-none
                  ${
                    theme === "dark"
                      ? "bg-gray-800 text-gray-200"
                      : "bg-white text-gray-700"
                  }`}
                placeholder="Ask anything... (Shift+Enter for new line)"
                disabled={loading}
                aria-label="Ask Gemini anything"
              />
              <div className="flex items-center gap-2 md:gap-3">
                {input.trim() && (
                  <button
                    onClick={() => setInput("")}
                    className={
                      theme === "dark"
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-600"
                    }
                    aria-label="Clear input"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => input.trim() && onSent()}
                  disabled={!input.trim() || loading}
                  className={`p-2 rounded-full transition-colors ${
                    !input.trim() || loading
                      ? theme === "dark"
                        ? "text-gray-600"
                        : "text-gray-300"
                      : theme === "dark"
                      ? "text-blue-400 hover:bg-gray-700"
                      : "text-blue-500 hover:bg-blue-50"
                  }`}
                  aria-label="Send message"
                >
                  <img
                    width={20}
                    src={assets.send_icon}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
            <p
              className={`mt-1 text-xs text-center ${
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              }`}
            >
              <span role="img" aria-label="Info" className="mr-1">
                ℹ️
              </span>
              Gemini may display inaccurate information, so double-check its
              responses.
              <span className="hidden md:inline">
                {" "}
                Press Shift+Enter for a new line.
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
