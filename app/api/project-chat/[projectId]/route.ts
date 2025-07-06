import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, ChatParticipant, ProjectChat } from "@/types/chat";

// Mock chat data store
const mockChats: Map<string, ProjectChat> = new Map();

// Initialize mock data for development
const initializeMockData = (projectId: string) => {
  if (!mockChats.has(projectId)) {
    const mockParticipants: ChatParticipant[] = [
      {
        id: "admin-1",
        name: "Admin User",
        role: "admin",
        isOnline: true,
      },
      {
        id: "client-1",
        name: "John Doe",
        role: "client",
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: "dev-1",
        name: "Jane Smith",
        role: "developer",
        isOnline: true,
      },
    ];

    const mockMessages: ChatMessage[] = [
      {
        id: "msg-1",
        projectId,
        senderId: "client-1",
        senderName: "John Doe",
        senderRole: "client",
        content: "Hi team! Excited to get started on this project. When can we schedule our kickoff meeting?",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isRead: true,
      },
      {
        id: "msg-2",
        projectId,
        senderId: "admin-1",
        senderName: "Admin User",
        senderRole: "admin",
        content: "Welcome to the project! I've assigned Jane as your lead developer. She'll be in touch shortly to discuss the technical requirements.",
        timestamp: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
        isRead: true,
      },
      {
        id: "msg-3",
        projectId,
        senderId: "dev-1",
        senderName: "Jane Smith",
        senderRole: "developer",
        content: "Hello John! I'm excited to work on your project. I've reviewed the requirements and have a few questions. Could we schedule a call this week?",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        isRead: false,
      },
    ];

    const chat: ProjectChat = {
      id: `chat-${projectId}`,
      projectId,
      participants: mockParticipants,
      messages: mockMessages,
      lastActivity: mockMessages[mockMessages.length - 1]?.timestamp || new Date().toISOString(),
      unreadCount: mockMessages.filter(m => !m.isRead).length,
    };

    mockChats.set(projectId, chat);
  }
};

// GET /api/project-chat/[projectId] - Get chat data for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400 });
    }

    // Initialize mock data if not exists
    initializeMockData(projectId);
    
    const chat = mockChats.get(projectId);
    
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("GET /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/project-chat/[projectId] - Send a new message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { senderId, senderName, senderRole, content } = await req.json();
    
    if (!projectId || !senderId || !senderName || !senderRole || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Initialize mock data if not exists
    initializeMockData(projectId);
    
    const chat = mockChats.get(projectId);
    
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    // Create new message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      senderId,
      senderName,
      senderRole: senderRole as 'admin' | 'client' | 'developer',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Add message to chat
    chat.messages.push(newMessage);
    chat.lastActivity = newMessage.timestamp;
    chat.unreadCount = chat.messages.filter(m => !m.isRead).length;

    // Update the chat in the store
    mockChats.set(projectId, chat);

    console.log(`New message in project ${projectId} from ${senderName} (${senderRole}): ${content}`);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/project-chat/[projectId] - Mark messages as read
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { userId, messageIds } = await req.json();
    
    if (!projectId || !userId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const chat = mockChats.get(projectId);
    
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    // Mark messages as read
    if (messageIds && Array.isArray(messageIds)) {
      chat.messages = chat.messages.map(msg => 
        messageIds.includes(msg.id) && msg.senderId !== userId
          ? { ...msg, isRead: true }
          : msg
      );
    } else {
      // Mark all messages as read for this user
      chat.messages = chat.messages.map(msg => 
        msg.senderId !== userId ? { ...msg, isRead: true } : msg
      );
    }

    // Update unread count
    chat.unreadCount = chat.messages.filter(m => !m.isRead).length;

    // Update the chat in the store
    mockChats.set(projectId, chat);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


// how about we work on removing the mock chats in the profiles,              
//   as it is set up, the chat appear when the admin assigns a                    developer to a project, and the chat is visible in the                      
//  projectOverview section of the admin-dashboard, and it                      
//  essentially enables in house communication between the admins,                client who issued out the project and the assigned developer,               
//  and i think all the dasahboard have been fitted with this                     component and maybe the functions have also been written, iwant             
//  you to verify this so we can work on enabling this chat                     
//   functionality using real data, including the list of available developers, the changing of developer status, and the ability to assign developers to projects.
//   we can also work on the chat functionality in the client dashboard, where the client can
//   communicate with the assigned developer and admin, and the developer can also communicate with the client
//   and admin, and the admin can also communicate with the client and developer.
//   this will enable real-time communication between the stakeholders of the project.