import React, { useContext, useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    newChat,
    deleteConversation,
    renameConversation,
  } = useContext(Context);

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Handle switching to a conversation
  const switchConversation = (conversationId) => {
    setActiveConversationId(conversationId);
  };

  // Start renaming a conversation
  const startRename = (id, currentTitle) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  // Confirm rename of a conversation
  const confirmRename = (id) => {
    if (newTitle.trim()) {
      renameConversation(id, newTitle.trim());
    }
    setEditingId(null);
    setNewTitle("");
  };

  // Handle key press in rename input
  const handleKeyPress = (e, id) => {
    if (e.key === "Enter") {
      confirmRename(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setNewTitle("");
    }
  };

  // Confirm conversation deletion
  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
    setShowDeleteModal(false);
  };

  // Cancel conversation deletion
  const cancelDelete = () => {
    setConversationToDelete(null);
    setShowDeleteModal(false);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If date is today, display time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // If date is yesterday, display "Yesterday"
    else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    // Otherwise display date
    else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <>
      <div
        className={`flex flex-col bg-[#f0f4f9] h-screen transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[280px]"
        } border-r border-gray-200`}
      >
        {/* Header with menu toggle */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <img
              width={24}
              src={assets.menu_icon}
              alt="menu"
              className="cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            />
            {!collapsed && <span className="font-medium">Gemini Chat</span>}
          </div>
        </div>

        {/* New Chat Button */}
        <div
          onClick={() => newChat()}
          className={`flex items-center gap-3 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 cursor-pointer p-3 mx-2 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <img width={20} src={assets.plus_icon} alt="New chat" />
          {!collapsed && <p className="font-medium">New Chat</p>}
        </div>

        {/* Search Box - Only show when not collapsed */}
        {!collapsed && (
          <div className="mx-2 mt-4 relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 bg-white rounded-lg text-sm border border-gray-200 focus:border-blue-400 focus:outline-none"
            />
            <img
              src={
                assets.search_icon ||
                "https://img.icons8.com/material-outlined/24/000000/search--v1.png"
              }
              alt="Search"
              className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="mt-4 flex-grow overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <div className="space-y-1 px-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => switchConversation(conv.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group
                    ${
                      activeConversationId === conv.id
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-200"
                    }
                    ${collapsed ? "justify-center" : ""}`}
                >
                  <div
                    className={`flex items-center gap-2 overflow-hidden ${
                      collapsed ? "w-8" : "flex-grow"
                    }`}
                  >
                    <img
                      width={16}
                      src={assets.message_icon}
                      alt=""
                      className="flex-shrink-0"
                    />

                    {!collapsed &&
                      (editingId === conv.id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => confirmRename(conv.id)}
                          onKeyDown={(e) => handleKeyPress(e, conv.id)}
                          autoFocus
                          className="flex-grow bg-white p-1 rounded border border-blue-300 text-sm focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex flex-col overflow-hidden">
                          <p className="truncate text-sm font-medium">
                            {conv.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formatDate(conv.timestamp)}
                          </p>
                        </div>
                      ))}
                  </div>

                  {!collapsed && editingId !== conv.id && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(conv.id, conv.title);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label="Rename conversation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationToDelete(conv.id);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        aria-label="Delete conversation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center text-gray-500 mt-4 ${
                collapsed ? "px-1" : "px-4"
              }`}
            >
              {!collapsed &&
                (searchQuery ? (
                  <p className="text-sm">No matching conversations</p>
                ) : (
                  <p className="text-sm">No conversations yet</p>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto p-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>Gemini AI</span>
            <span>v1.0</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium mb-4">Delete Conversation</h3>
            <p className="mb-6">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
