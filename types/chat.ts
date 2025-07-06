export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'client' | 'developer';
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  role: 'admin' | 'client' | 'developer';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ProjectChat {
  id: string;
  projectId: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  lastActivity: string;
  unreadCount: number;
}

export interface ChatPermissions {
  canRead: boolean;
  canWrite: boolean;
  canViewAll: boolean; // Admin only
}
