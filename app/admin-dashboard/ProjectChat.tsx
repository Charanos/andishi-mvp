"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaPaperPlane,
  FaUsers,
  FaCircle,
  FaClock,
  FaFile,
  FaImage,
  FaDownload,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaSearch,
  FaPhone,
  FaVideo,
  FaSmile,
  FaPaperclip,
  FaMicrophone,
} from "react-icons/fa";

// Mock types for demo
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "client" | "developer";
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatParticipant {
  id: string;
  name: string;
  role: "admin" | "client" | "developer";
  isOnline: boolean;
  avatar?: string;
}

interface ChatPermissions {
  canRead: boolean;
  canWrite: boolean;
  canViewAll: boolean;
}

interface ProjectChatProps {
  projectId: string;
  projectTitle: string;
  currentUserId: string;
  currentUserRole: "admin" | "client" | "developer";
  currentUserName: string;
}

const ProjectChat: React.FC<ProjectChatProps> = ({
  projectId,
  projectTitle,
  currentUserId,
  currentUserRole,
  currentUserName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderId: "user2",
      senderName: "Alice Johnson",
      senderRole: "client",
      content:
        "Hey team! I've reviewed the latest designs and they look fantastic. Can we schedule a call to discuss the implementation timeline?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    {
      id: "2",
      senderId: "user3",
      senderName: "Bob Smith",
      senderRole: "developer",
      content:
        "Sure! I've finished the backend API. The authentication system is ready and tested. We can start frontend integration next week.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true,
    },
    {
      id: "3",
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content:
        "Great progress everyone! Let's aim for a demo by Friday. I'll send the meeting invite shortly.",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isRead: false,
    },
  ]);

  const [participants, setParticipants] = useState<ChatParticipant[]>([
    {
      id: "user1",
      name: "John Doe",
      role: "admin",
      isOnline: true,
    },
    {
      id: "user2",
      name: "Alice Johnson",
      role: "client",
      isOnline: true,
    },
    {
      id: "user3",
      name: "Bob Smith",
      role: "developer",
      isOnline: false,
    },
    {
      id: "user4",
      name: "Sarah Wilson",
      role: "developer",
      isOnline: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<ChatPermissions>({
    canRead: true,
    canWrite: true,
    canViewAll: currentUserRole === "admin",
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !permissions.canWrite) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400";
      case "client":
        return "text-blue-400";
      case "developer":
        return "text-emerald-400";
      default:
        return "text-gray-400";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "client":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "developer":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-red-600";
      case "client":
        return "from-blue-500 to-blue-600";
      case "developer":
        return "from-emerald-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
              style={{ animationDelay: "0.15s" }}
            ></div>
          </div>
          <span className="text-gray-400 font-medium">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!permissions.canRead) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
          <FaUsers className="text-2xl" />
        </div>
        <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
        <p className="text-sm">You don't have permission to view this chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Enhanced Chat Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-800/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaUsers className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Project Chat
                </h2>
                <p className="text-sm text-indigo-400 font-medium uppercase tracking-wide">
                  {projectTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                <FaSearch className="text-sm" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                <FaPhone className="text-sm" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                <FaVideo className="text-sm" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                <FaEllipsisV className="text-sm" />
              </button>
            </div>

            {/* Enhanced Participants */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 font-medium">
                {participants.length} members
              </span>
              <div className="flex -space-x-2">
                {participants.slice(0, 4).map((participant) => (
                  <div
                    key={participant.id}
                    className="relative group"
                    title={`${participant.name} (${participant.role})`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleGradient(
                        participant.role
                      )} flex items-center justify-center border-2 border-gray-900 font-medium text-white text-sm shadow-lg hover:scale-110 transition-transform`}
                    >
                      {getInitials(participant.name)}
                    </div>
                    {participant.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm animate-pulse"></div>
                    )}
                  </div>
                ))}
                {participants.length > 4 && (
                  <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-300 font-medium shadow-lg">
                    +{participants.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-3xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm text-center">
                Start the conversation and get your project moving!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                messages[index - 1].senderId !== message.senderId;
              const showTimestamp =
                index === 0 ||
                new Date(message.timestamp).getTime() -
                  new Date(messages[index - 1].timestamp).getTime() >
                  300000;

              return (
                <div key={message.id} className="space-y-2">
                  {showTimestamp && (
                    <div className="flex justify-center">
                      <span className="text-xs text-gray-500 bg-gray-800/50 monty px-3 py-1 rounded-full">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end space-x-3 ${
                      isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleGradient(
                          message.senderRole
                        )} flex items-center justify-center text-white text-xs font-medium shadow-lg ${
                          showAvatar ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {getInitials(message.senderName)}
                      </div>
                    )}

                    {/* Message Content */}
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        isOwnMessage ? "ml-auto" : ""
                      }`}
                    >
                      {/* Sender Info */}
                      {!isOwnMessage && showAvatar && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold monty text-white">
                            {message.senderName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs border monty uppercase font-medium ${getRoleBadge(
                              message.senderRole
                            )}`}
                          >
                            {message.senderRole}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto"
                            : "bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50"
                        } ${showAvatar ? "rounded-tl-md" : ""}`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>

                        {/* Message Status */}
                        {isOwnMessage && (
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs text-blue-200 opacity-70 monty">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.isRead ? (
                              <FaCheckDouble className="text-xs text-blue-200" />
                            ) : (
                              <FaCheck className="text-xs text-blue-200" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                Someone is typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Message Input */}
      {permissions.canWrite && (
        <div className="bg-black/40 backdrop-blur-sm border-t  w-full border-gray-800/50 p-4">
          <div className="flex items-end space-x-3">
            {/* Attachment Button */}
            <button className="cursor-pointer p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <FaPaperclip className="text-lg" />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <button className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors">
                <FaSmile className="text-lg" />
              </button>
            </div>

            {/* Voice Button */}
            <button className="cursor-pointer p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <FaMicrophone className="text-lg" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="cursor-pointer p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
            >
              <FaPaperPlane className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <div className="bg-black/20 backdrop-blur-sm px-6 py-3 border-t border-gray-800/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2">
              <FaCircle className="text-green-500 text-xs" />
              <span>
                {participants.filter((p) => p.isOnline).length} online
              </span>
            </span>
            <span>
              {participants.length} total member
              {participants.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClock className="text-xs" />
            <span>
              Last activity:{" "}
              {messages.length > 0
                ? formatTime(messages[messages.length - 1].timestamp)
                : "Never"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;
