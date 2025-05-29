import { GraphData, FormNode } from '../types/graph';
import { EventBus } from '../core/events/EventBus';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CollaborationSession {
  id: string;
  users: User[];
  lastActivity: Date;
}

interface CollaborationChange {
  id: string;
  userId: string;
  timestamp: string;
  type: 'mapping' | 'validation' | 'comment';
  details: {
    before?: any;
    after?: any;
    field?: string;
    message?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
}

interface Comment {
  id: string;
  userId: string;
  timestamp: string;
  message: string;
  replies: Comment[];
  mentions: string[];
  status: 'active' | 'resolved';
}

export class CollaborationService {
  private eventBus: EventBus;
  private sessions: Map<string, CollaborationSession>;
  private readonly SESSION_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.eventBus = new EventBus();
    this.sessions = new Map();
    this.startSessionCleanup();
  }

  private startSessionCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now.getTime() - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
          this.sessions.delete(sessionId);
          this.eventBus.publish('session:ended', { sessionId });
        }
      }
    }, 5000);
  }

  createSession(users: User[]): string {
    const sessionId = Math.random().toString(36).substring(7);
    const session: CollaborationSession = {
      id: sessionId,
      users,
      lastActivity: new Date(),
    };
    this.sessions.set(sessionId, session);
    this.eventBus.publish('session:created', { sessionId, users });
    return sessionId;
  }

  joinSession(sessionId: string, user: User): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.push(user);
      session.lastActivity = new Date();
      this.eventBus.publish('user:joined', { sessionId, user });
    }
  }

  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users = session.users.filter(user => user.id !== userId);
      session.lastActivity = new Date();
      this.eventBus.publish('user:left', { sessionId, userId });
    }
  }

  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  getSessionUsers(sessionId: string): User[] {
    return this.sessions.get(sessionId)?.users || [];
  }

  subscribeToSessionEvents(
    eventType: string,
    callback: (data: unknown) => void
  ): void {
    this.eventBus.subscribe(eventType, callback);
  }

  unsubscribeFromSessionEvents(
    eventType: string,
    callback: (data: unknown) => void
  ): void {
    this.eventBus.unsubscribe(eventType, callback);
  }

  // Change Tracking
  public trackChange(
    sessionId: string,
    userId: string,
    type: CollaborationChange['type'],
    details: CollaborationChange['details']
  ): CollaborationChange {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const change: CollaborationChange = {
      id: crypto.randomUUID(),
      userId,
      timestamp: new Date().toISOString(),
      type,
      details,
      status: 'pending'
    };

    session.changes.push(change);
    this.checkForConflicts(session);
    return change;
  }

  private checkForConflicts(session: CollaborationSession): void {
    const pendingChanges = session.changes.filter(c => c.status === 'pending');
    const conflicts = this.detectConflicts(pendingChanges);

    if (conflicts.length > 0) {
      session.status = 'conflict';
      this.notifyConflict(session, conflicts);
    }
  }

  private detectConflicts(changes: CollaborationChange[]): CollaborationChange[] {
    const conflicts: CollaborationChange[] = [];
    const fieldChanges = new Map<string, CollaborationChange[]>();

    // Group changes by field
    changes.forEach(change => {
      if (change.details.field) {
        const fieldChanges = fieldChanges.get(change.details.field) || [];
        fieldChanges.push(change);
        fieldChanges.set(change.details.field, fieldChanges);
      }
    });

    // Check for conflicts in each field
    fieldChanges.forEach(changes => {
      if (changes.length > 1) {
        conflicts.push(...changes);
      }
    });

    return conflicts;
  }

  private notifyConflict(session: CollaborationSession, conflicts: CollaborationChange[]): void {
    // In a real implementation, this would notify users through WebSocket
    console.log('Conflict detected:', conflicts);
  }

  // Conflict Resolution
  public resolveConflict(
    sessionId: string,
    changeId: string,
    resolution: 'accept' | 'reject'
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const change = session.changes.find(c => c.id === changeId);
    if (!change) throw new Error('Change not found');

    change.status = resolution === 'accept' ? 'accepted' : 'rejected';
    this.updateSessionStatus(session);
  }

  private updateSessionStatus(session: CollaborationSession): void {
    const hasPendingChanges = session.changes.some(c => c.status === 'pending');
    const hasConflicts = session.changes.some(c => c.status === 'pending' && 
      this.detectConflicts([c]).length > 0);

    session.status = hasConflicts ? 'conflict' : 
                    hasPendingChanges ? 'active' : 'resolved';
  }

  // Comments and Discussions
  public addComment(
    sessionId: string,
    userId: string,
    message: string,
    mentions: string[] = []
  ): Comment {
    const comment: Comment = {
      id: crypto.randomUUID(),
      userId,
      timestamp: new Date().toISOString(),
      message,
      replies: [],
      mentions,
      status: 'active'
    };

    const comments = this.comments.get(sessionId) || [];
    comments.push(comment);
    this.comments.set(sessionId, comments);

    return comment;
  }

  public replyToComment(
    sessionId: string,
    commentId: string,
    userId: string,
    message: string,
    mentions: string[] = []
  ): Comment {
    const comments = this.comments.get(sessionId);
    if (!comments) throw new Error('No comments found for session');

    const reply: Comment = {
      id: crypto.randomUUID(),
      userId,
      timestamp: new Date().toISOString(),
      message,
      replies: [],
      mentions,
      status: 'active'
    };

    const comment = this.findComment(comments, commentId);
    if (!comment) throw new Error('Comment not found');

    comment.replies.push(reply);
    return reply;
  }

  private findComment(comments: Comment[], commentId: string): Comment | null {
    for (const comment of comments) {
      if (comment.id === commentId) return comment;
      const reply = this.findComment(comment.replies, commentId);
      if (reply) return reply;
    }
    return null;
  }

  // Session History
  public getSessionHistory(sessionId: string): {
    changes: CollaborationChange[];
    comments: Comment[];
    participants: User[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    return {
      changes: session.changes,
      comments: this.comments.get(sessionId) || [],
      participants: session.users
    };
  }
} 