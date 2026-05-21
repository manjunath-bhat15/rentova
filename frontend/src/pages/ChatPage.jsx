import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';

export default function ChatPage() {
  const { user } = useAuth();
  const { subscribe } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (activeBookingId) loadMessages(activeBookingId); }, [activeBookingId]);

  useEffect(() => {
    const sub = subscribe('/user/queue/chat', (msg) => {
      if (msg.bookingId === activeBookingId) {
        setMessages(prev => [...prev, msg]);
        setConversations(prev => prev.map(c =>
          c.bookingId === msg.bookingId
            ? { ...c, lastMessage: msg.content, lastMessageTime: msg.createdAt }
            : c
        ));
      } else {
        loadConversations();
      }
    });
    return () => { if (sub) sub.unsubscribe(); };
  }, [subscribe, activeBookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
      const requestedBookingId = searchParams.get('bookingId');
      if (res.data.length > 0 && !activeBookingId) {
        const requested = res.data.find(c => c.bookingId === requestedBookingId);
        setActiveBookingId((requested || res.data[0]).bookingId);
      }
    } catch (err) { console.error('Failed to load conversations', err); }
    finally { setLoading(false); }
  };

  const loadMessages = async (bookingId) => {
    try {
      const res = await api.get(`/api/chat/${bookingId}`);
      setMessages(res.data);
    } catch (err) { console.error('Failed to load messages', err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeBookingId) return;
    setSending(true);
    try {
      const res = await api.post('/api/chat', { bookingId: activeBookingId, content: newMessage.trim() });
      setMessages(prev => [...prev, res.data]);
      setConversations(prev => prev.map(c => c.bookingId === activeBookingId
        ? { ...c, lastMessage: res.data.content, lastMessageTime: res.data.createdAt } : c));
      setNewMessage('');
    } catch (err) { console.error('Failed to send message', err); }
    finally { setSending(false); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#fc8019', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#93959f', fontSize: '14px' }}>Loading messages...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fafafa', borderRadius: '20px', border: '2px dashed #e8e8e8' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>💬</div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1c1c', marginBottom: '8px' }}>No conversations yet</h3>
        <p style={{ color: '#686b78', fontSize: '14px' }}>
          Conversations are created when you book a service. Each booking has its own chat thread.
        </p>
      </div>
    );
  }

  const activeConvo = conversations.find(c => c.bookingId === activeBookingId);
  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="chat-shell">
      {/* Left: Conversation list */}
      <div style={{ background: '#fafafa', borderRight: '1px solid #f0f0f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
          <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#1c1c1c', letterSpacing: '-0.02em', margin: 0 }}>
            💬 Messages
          </h3>
          <p style={{ fontSize: '12px', color: '#93959f', margin: '2px 0 0' }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        {conversations.map((conv) => {
          const isActive = conv.bookingId === activeBookingId;
          return (
            <div
              key={conv.bookingId}
              onClick={() => setActiveBookingId(conv.bookingId)}
              style={{
                padding: '14px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                borderLeft: `3px solid ${isActive ? '#fc8019' : 'transparent'}`,
                background: isActive ? 'rgba(252,128,25,0.06)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f0f0f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? 'rgba(252,128,25,0.06)' : 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? '#fc8019' : '#e8e8e8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800, color: isActive ? '#fff' : '#686b78',
                  transition: 'all 0.15s ease',
                }}>
                  {initials(conv.otherPartyName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: isActive ? 700 : 600, fontSize: '13px', color: '#1c1c1c' }}>
                      {conv.otherPartyName}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        background: '#fc8019', color: '#fff',
                        borderRadius: '999px', padding: '1px 6px',
                        fontSize: '10px', fontWeight: 800,
                      }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#fc8019', margin: '1px 0', fontWeight: 600 }}>
                    {conv.serviceTitle}
                  </p>
                  <p style={{ fontSize: '11px', color: '#93959f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Chat area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
        {/* Chat header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
          background: '#fff', display: 'flex', alignItems: 'center', gap: '12px',
          flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800, color: '#fff',
          }}>
            {initials(activeConvo?.otherPartyName)}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#1c1c1c', margin: 0 }}>
              {activeConvo?.otherPartyName}
            </p>
            <p style={{ fontSize: '12px', color: '#fc8019', margin: '2px 0 0', fontWeight: 600 }}>
              {activeConvo?.serviceTitle}
            </p>
          </div>
          <div style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            fontSize: '11px', fontWeight: 700,
          }}>
            ● Active
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          background: '#fafafa',
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#93959f', fontSize: '14px' }}>
              Start the conversation! Say hello 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 16px',
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? 'linear-gradient(135deg, #fc8019, #ff9f43)' : '#fff',
                  color: isMine ? '#fff' : '#1c1c1c',
                  fontSize: '14px', lineHeight: 1.5,
                  boxShadow: isMine
                    ? '0 4px 12px rgba(252,128,25,0.3)'
                    : '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.75, textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid #f0f0f0',
          background: '#fff', display: 'flex', gap: '10px', alignItems: 'center',
          flexShrink: 0,
        }}>
          <input
            style={{
              flex: 1, padding: '12px 16px',
              borderRadius: '999px', border: '1.5px solid #e8e8e8',
              fontSize: '14px', color: '#1c1c1c', outline: 'none',
              background: '#fafafa', transition: 'all 0.15s ease',
            }}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={(e) => { e.target.style.borderColor = '#fc8019'; e.target.style.background = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; e.target.style.background = '#fafafa'; }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: sending || !newMessage.trim() ? '#e8e8e8' : '#fc8019',
              color: sending || !newMessage.trim() ? '#93959f' : '#fff',
              fontSize: '18px', cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              boxShadow: !sending && newMessage.trim() ? '0 4px 12px rgba(252,128,25,0.35)' : 'none',
              flexShrink: 0,
            }}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}
