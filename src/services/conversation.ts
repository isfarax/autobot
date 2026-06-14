export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const conversations = new Map<string, Conversation>();

export function createConversation(id?: string): Conversation {
  const conversation: Conversation = {
    id: id || crypto.randomUUID(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  conversations.set(conversation.id, conversation);
  return conversation;
}

export function getConversation(id: string): Conversation | undefined {
  return conversations.get(id);
}

export function addMessage(conversationId: string, role: Message['role'], content: string): Message {
  let conversation = conversations.get(conversationId);
  if (!conversation) {
    conversation = createConversation(conversationId);
  }
  const message: Message = { role, content, timestamp: new Date() };
  conversation.messages.push(message);
  conversation.updatedAt = new Date();
  return message;
}

export function getRecentMessages(conversationId: string, count = 10): Message[] {
  const conversation = conversations.get(conversationId);
  if (!conversation) return [];
  return conversation.messages.slice(-count);
}

export function getConversationHistory(conversationId: string): Message[] {
  return conversations.get(conversationId)?.messages || [];
}
