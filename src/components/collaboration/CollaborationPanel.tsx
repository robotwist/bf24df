import React, { useState, useEffect } from 'react';
import { GraphData } from '../../types/graph';
import { CollaborationService } from '../../services/CollaborationService';
import styles from '../../styles/CollaborationPanel.module.css';

interface CollaborationPanelProps {
  graphData: GraphData;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  graphData,
  currentUserId,
  currentUserName,
  currentUserRole
}) => {
  const [collaborationService] = useState(() => new CollaborationService(graphData));
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'comments' | 'changes'>('users');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        const users = collaborationService.getActiveUsers(activeSession);
        setActiveUsers(users);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeSession, collaborationService]);

  const handleStartSession = () => {
    const session = collaborationService.createSession('current-form', currentUserId);
    collaborationService.joinSession(session.id, {
      id: currentUserId,
      name: currentUserName,
      role: currentUserRole,
      lastActive: new Date().toISOString()
    });
    setActiveSession(session.id);
  };

  const handleAddComment = () => {
    if (!activeSession || !newComment.trim()) return;

    const comment = collaborationService.addComment(
      activeSession,
      currentUserId,
      newComment
    );
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleReplyToComment = (commentId: string, reply: string) => {
    if (!activeSession || !reply.trim()) return;

    const newReply = collaborationService.replyToComment(
      activeSession,
      commentId,
      currentUserId,
      reply
    );
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, newReply] }
        : comment
    ));
  };

  const renderUserList = () => (
    <div className={styles.userList}>
      <h3>Active Users</h3>
      {activeUsers.map(user => (
        <div key={user.id} className={styles.userItem}>
          <div className={styles.userAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
          <div className={styles.userStatus} />
        </div>
      ))}
    </div>
  );

  const renderComments = () => (
    <div className={styles.commentsSection}>
      <div className={styles.commentsList}>
        {comments.map(comment => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <span className={styles.commentAuthor}>{comment.userId}</span>
              <span className={styles.commentTime}>
                {new Date(comment.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className={styles.commentContent}>{comment.message}</div>
            {comment.replies.length > 0 && (
              <div className={styles.replies}>
                {comment.replies.map(reply => (
                  <div key={reply.id} className={styles.reply}>
                    <div className={styles.replyHeader}>
                      <span className={styles.replyAuthor}>{reply.userId}</span>
                      <span className={styles.replyTime}>
                        {new Date(reply.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={styles.replyContent}>{reply.message}</div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.replyInput}>
              <input
                type="text"
                placeholder="Reply to comment..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleReplyToComment(comment.id, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.newComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleAddComment}>Send</button>
      </div>
    </div>
  );

  const renderChanges = () => {
    if (!activeSession) return null;
    const history = collaborationService.getSessionHistory(activeSession);
    
    return (
      <div className={styles.changesSection}>
        <h3>Recent Changes</h3>
        {history.changes.map(change => (
          <div key={change.id} className={styles.changeItem}>
            <div className={styles.changeHeader}>
              <span className={styles.changeType}>{change.type}</span>
              <span className={styles.changeTime}>
                {new Date(change.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className={styles.changeDetails}>
              {change.details.field && (
                <div className={styles.changeField}>
                  Field: {change.details.field}
                </div>
              )}
              {change.details.before && change.details.after && (
                <div className={styles.changeDiff}>
                  <div className={styles.changeBefore}>
                    Before: {JSON.stringify(change.details.before)}
                  </div>
                  <div className={styles.changeAfter}>
                    After: {JSON.stringify(change.details.after)}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.changeStatus}>
              Status: {change.status}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <div className={styles.header}>
        <h2>Collaboration</h2>
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <>
          {!activeSession ? (
            <button 
              className={styles.startSessionButton}
              onClick={handleStartSession}
            >
              Start Collaboration Session
            </button>
          ) : (
            <>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${selectedTab === 'users' ? styles.active : ''}`}
                  onClick={() => setSelectedTab('users')}
                >
                  Users
                </button>
                <button
                  className={`${styles.tab} ${selectedTab === 'comments' ? styles.active : ''}`}
                  onClick={() => setSelectedTab('comments')}
                >
                  Comments
                </button>
                <button
                  className={`${styles.tab} ${selectedTab === 'changes' ? styles.active : ''}`}
                  onClick={() => setSelectedTab('changes')}
                >
                  Changes
                </button>
              </div>

              <div className={styles.content}>
                {selectedTab === 'users' && renderUserList()}
                {selectedTab === 'comments' && renderComments()}
                {selectedTab === 'changes' && renderChanges()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}; 