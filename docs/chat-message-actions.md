# Chat Message Actions Implementation Guide

This document outlines the steps to implement message actions (edit, delete, reply) in the project chat, similar to WhatsApp.

## 1. Frontend (`ProjectChat.tsx`)

### 1.1. State Management

- Add state variables to manage the message being edited, the message being deleted, the message being replied to, the currently hovered message, and the active message for the dropdown.

```javascript
const [editingMessage, setEditingMessage] = useState<any | null>(null);
const [deletingMessage, setDeletingMessage] = useState<any | null>(null);
const [replyingTo, setReplyingTo] = useState<any | null>(null);
const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
```

### 1.2. Message Bubble with Actions Button

- The message bubble now contains an options button (`FaEllipsisV`) that appears on hover over the user's own messages.
- Clicking this options button reveals a dropdown menu with "Reply", "Edit", and "Delete" actions.

```javascript
<div
  className={`relative px-4 py-3 rounded-2xl shadow-lg group ${isOwnMessage
    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto"
    : "bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50"
    } ${showAvatar ? "rounded-tl-md" : ""}`}
>
  {message.replyToMessage && (
    <div className="p-2 mb-2 bg-gray-700/50 rounded-lg border border-gray-600/50 text-xs text-gray-300">
      <p className="font-semibold">Replying to {message.replyToMessage.senderName}:</p>
      <p className="italic truncate">{message.replyToMessage.content}</p>
    </div>
  )}
  <p className="text-sm leading-relaxed whitespace-pre-wrap">
    {message.content}
  </p>
  {isOwnMessage && (
    <div
      className="absolute top-0 right-0 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <div className="relative">
        <button onClick={() => setActiveMessageId(message.id)} className="p-1 rounded-full bg-black/20 hover:bg-black/40">
          <FaEllipsisV className="text-white/70" />
        </button>
        {activeMessageId === message.id && (
          <div className="absolute z-10 top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
            <a href="#" onClick={() => { setReplyingTo(message); setActiveMessageId(null); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-800">Reply</a>
            <a href="#" onClick={() => { setEditingMessage(message); setActiveMessageId(null); }} className="block px-4 py-2 text-sm text-white hover:bg-gray-800">Edit</a>
            <a href="#" onClick={() => { handleDeleteMessage(message); setActiveMessageId(null); }} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-800">Delete</a>
          </div>
        )}
      </div>
    </div>
  )}
  {/* ... */}
</div>
```

### 1.3. Edit, Delete, and Reply Handlers

- Create `handleEditMessage`, `handleDeleteMessage`, and `handleSendMessage` functions to handle the respective actions.
- `handleSendMessage` now accepts an optional `replyToMessageId`.

```javascript
const handleSendMessage = async () => {
  if (!newMessage.trim() || !permissions.canWrite) return;
  await sendMessage(newMessage.trim(), replyingTo?.id);
  setNewMessage("");
  setReplyingTo(null);
};

const handleEditMessage = async () => {
  if (!editingMessage || !editingMessage.content.trim()) return;
  await updateMessage(editingMessage.id, editingMessage.content);
  setEditingMessage(null);
};

const handleDeleteMessage = async () => {
  if (!deletingMessage) return;
  await deleteMessage(deletingMessage.id);
  setDeletingMessage(null);
};
```

## 2. Backend

### 2.1. Prisma Schema Update

- Add `replyToMessageId` and `replyToMessage` fields to the `ChatMessage` model in `prisma/schema.prisma`.

```prisma
model ChatMessage {
  id                String     @id @default(auto()) @map("_id") @db.ObjectId
  chatId            String     @db.ObjectId
  senderId          String
  senderName        String
  senderRole        String
  content           String
  timestamp         DateTime   @default(now())
  isRead            Boolean    @default(false)
  chat              ProjectChat @relation(fields: [chatId], references: [id])
  replyToMessageId  String?    @db.ObjectId
  replyToMessage    ChatMessage? @relation("ReplyTo", fields: [replyToMessageId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  replies           ChatMessage[] @relation("ReplyTo")
}
```

### 2.2. `useProjectChat.ts`

- Update the `ChatMessage` interface to include `replyToMessageId` and `replyToMessage`.
- Modify the `sendMessage` function to accept an optional `replyToMessageId`.
- Add `updateMessage` and `deleteMessage` functions to the `useProjectChat` hook and its return type.

```javascript
// In useProjectChat.ts

export interface ChatMessage {
    // ... existing fields
    replyToMessageId?: string;
    replyToMessage?: ChatMessage;
}

const sendMessage = useCallback(async (content: string, replyToMessageId?: string) => {
    // ... existing logic
    body: JSON.stringify({
        // ... existing fields
        content: content.trim(),
        ...(replyToMessageId && { replyToMessageId })
    }),
    // ... rest of the function
}, [projectId, mutate, user, token]);

const updateMessage = useCallback(async (messageId: string, content: string) => {
  // ... API call to update message
}, [projectId, mutate, user, token]);

const deleteMessage = useCallback(async (messageId: string) => {
  // ... API call to delete message
}, [projectId, mutate, user, token]);

return {
    // ... existing returns
    sendMessage,
    updateMessage,
    deleteMessage,
    // ... rest of the returns
};

// In useTypedProjectChat
export function useTypedProjectChat(projectId: string) {
    const result = useProjectChat(projectId);
    return result as {
        // ... existing types
        sendMessage: (content: string, replyToMessageId?: string) => Promise<ChatMessage>;
        updateMessage: (messageId: string, content: string) => Promise<ChatMessage>;
        deleteMessage: (messageId: string) => Promise<void>;
        // ... rest of the types
    };
}
```

### 2.3. API Route (`/api/project-chat/[projectId]/route.ts` and `/api/project-chat/[projectId]/[messageId]/route.ts`)

- Update the `POST` request in `/api/project-chat/[projectId]/route.ts` to accept `replyToMessageId`.
- Update the `GET` request in `/api/project-chat/[projectId]/route.ts` to include `replyToMessage` in the `messages` query.
- The `PUT` and `DELETE` requests in `/api/project-chat/[projectId]/[messageId]/route.ts` remain as previously defined.

```javascript
// /api/project-chat/[projectId]/route.ts (POST)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // ... existing code
    const { content, replyToMessageId } = await req.json();

    // ... existing chat creation/update logic

    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        senderName,
        senderRole,
        content,
        ...(replyToMessageId && { replyToMessageId }),
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// /api/project-chat/[projectId]/route.ts (GET)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const chat = await prisma.projectChat.findFirst({
      where: { projectId },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
          include: {
            replyToMessage: { // Include the replied message
              select: {
                senderName: true,
                content: true,
              },
            },
          },
        },
        participants: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ messages: [], participants: [] }, { status: 200 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("GET /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// /api/project-chat/[projectId]/[messageId]/route.ts (PUT and DELETE remain the same)
```

## 3. Error Handling with Toast Notifications

To provide better user feedback and avoid cluttering the console, we will replace `console.error` calls with `toast.error` from the `useToast` hook.

### 3.1. `useProjectChat.ts`

- Import the `useToast` hook.
- Destructure `toast` from the `useToast()` call.
- Replace `console.error` in `catch` blocks with `toast.error`.

```javascript
// In useProjectChat.ts
import { useToast } from './useToast';

export function useProjectChat(projectId: string) {
    const { user, token } = useAuth();
    const { toast } = useToast(); // Destructure toast here

    // ... existing code

    const sendMessage = useCallback(async (content: string, replyToMessageId?: string) => {
        // ... existing logic
        try {
            // ... existing API call and optimistic update
        } catch (error: any) {
            toast.error(`Failed to send message: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]); // Add toast to dependency array

    const markAsRead = useCallback(async (messageIds?: string[]) => {
        // ... existing logic
        try {
            // ... existing API call and optimistic update
        } catch (error: any) {
            toast.error(`Failed to mark messages as read: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]); // Add toast to dependency array

    const updateOnlineStatus = useCallback(async (isOnline: boolean = true) => {
        // ... existing logic
        try {
            // ... existing API call
        } catch (error: any) {
            toast.error(`Failed to update online status: ${error.message}`);
            throw error;
        }
    }, [projectId, user, token, toast]); // Add toast to dependency array

    const updateMessage = useCallback(async (messageId: string, content: string) => {
        // ... existing logic
        try {
            // ... existing API call and optimistic update
        } catch (error: any) {
            toast.error(`Failed to update message: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]); // Add toast to dependency array

    const deleteMessage = useCallback(async (messageId: string) => {
        // ... existing logic
        try {
            // ... existing API call and optimistic update
        } catch (error: any) {
            toast.error(`Failed to delete message: ${error.message}`);
            throw error;
        }
    }, [projectId, mutate, user, token, toast]); // Add toast to dependency array

    // ... rest of the hook
}
```

### 3.2. API Routes (`/api/project-chat/[projectId]/route.ts` and `/api/project-chat/[projectId]/[messageId]/route.ts`)

- For backend API routes, `console.error` is generally acceptable for logging server-side errors. These errors are not directly displayed to the user but are crucial for debugging and monitoring the backend. Therefore, `console.error` calls in these files should remain as they are.
