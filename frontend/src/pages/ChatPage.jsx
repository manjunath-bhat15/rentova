import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';

export default function ChatPage() {
  const { user } = useAuth();
  const { subscribe } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeBookingId) loadMessages(activeBookingId);
  }, [activeBookingId]);

  useEffect(() => {
    const sub = subscribe('/user/queue/chat', (msg) => {
      if (msg.bookingId === activeBookingId) {
        setMessages(prev => [...prev, msg]);
        // Update conversation last message preview
        setConversations(prev => prev.map(c => 
          c.bookingId === msg.bookingId 
            ? { ...c, lastMessage: msg.content, lastMessageTime: msg.createdAt }
            : c
        ));
      } else {
        loadConversations();
      }
    });
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [subscribe, activeBookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !activeBookingId) {
        setActiveBookingId(res.data[0].bookingId);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (bookingId) => {
    try {
      const res = await api.get(`/api/chat/${bookingId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeBookingId) return;
    setSending(true);
    try {
      const res = await api.post('/api/chat', {
        bookingId: activeBookingId,
        content: newMessage.trim(),
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
        <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>No conversations yet</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Conversations are created when you book a service. Each booking has its own chat thread.
        </p>
      </div>
    );
  }

  const activeConvo = conversations.find(c => c.bookingId === activeBookingId);

  return (
    <div className="animate-fade-in" style={{
      display: 'grid', gridTemplateColumns: '300px 1fr',
      gap: 0, height: 'calc(100vh - 140px)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      border: '1px solid var(--glass-border)',
    }}>
      {/* Conversation List */}
      <div style={{
        background: 'var(--glass-bg)', borderRight: '1px solid var(--glass-border)',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)',
          fontWeight: 700, fontSize: 'var(--font-md)',
        }}>
          Conversations
        </div>
        {conversations.map((conv) => (
          <div
            key={conv.bookingId}
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              cursor: 'pointer',
              borderBottom: '1px solid var(--glass-border)',
              background: conv.bookingId === activeBookingId ? 'rgba(108,92,231,0.1)' : 'transparent',
              borderLeft: conv.bookingId === activeBookingId ? '3px solid var(--accent-primary)' : '3px solid transparent',
              transition: 'all var(--transition-fast)',
            }}
            onClick={() => setActiveBookingId(conv.bookingId)}
            onMouseEnter={(e) => {
              if (conv.bookingId !== activeBookingId) e.currentTarget.style.background = 'var(--glass-bg)';
            }}
            onMouseLeave={(e) => {
              if (conv.bookingId !== activeBookingId) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{conv.otherPartyName}</span>
              {conv.unreadCount > 0 && (
                <span style={{
                  background: 'var(--accent-primary)', color: 'white',
                  borderRadius: 'var(--radius-full)', padding: '1px 7px',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-secondary)', marginBottom: '2px' }}>
              {conv.serviceTitle}
            </p>
            <p style={{
              fontSize: 'var(--font-xs)', color: 'var(--text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {conv.lastMessage}
            </p>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
        {/* Chat Header */}
        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'white',
          }}>
            {activeConvo?.otherPartyName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{activeConvo?.otherPartyName}</p>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-secondary)' }}>{activeConvo?.serviceTitle}</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 'var(--space-lg)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
        }}>
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 16px',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMine ? 'var(--accent-gradient)' : 'var(--glass-bg)',
                  color: isMine ? 'white' : 'var(--text-primary)',
                  fontSize: 'var(--font-sm)',
                  lineHeight: 1.5,
                  boxShadow: isMine ? 'var(--glow-primary)' : 'none',
                }}>
                  <p>{msg.content}</p>
                  <p style={{
                    fontSize: '10px', marginTop: '4px',
                    opacity: 0.7, textAlign: 'right',
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          display: 'flex', gap: 'var(--space-md)',
        }}>
          <input
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
