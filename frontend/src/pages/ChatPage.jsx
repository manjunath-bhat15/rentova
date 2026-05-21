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
      <div className="flex justify-center items-center flex-col gap-3 py-20">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading messages...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-20 px-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-black text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Conversations are created when you book a service. Each booking has its own chat thread.
        </p>
      </div>
    );
  }

  const activeConvo = conversations.find(c => c.bookingId === activeBookingId);
  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
      
      {/* Left: Conversation list (Hidden on mobile if chat is active) */}
      <div className={`w-full md:w-[320px] bg-gray-50 flex-col border-r border-gray-200 shrink-0 ${activeBookingId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-extrabold text-[15px] text-gray-900 tracking-tight m-0">
            💬 Messages
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-0">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conv) => {
            const isActive = conv.bookingId === activeBookingId;
            return (
              <div
                key={conv.bookingId}
                onClick={() => setActiveBookingId(conv.bookingId)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors border-l-4 ${
                  isActive 
                    ? 'border-l-brand bg-brand/5' 
                    : 'border-l-transparent bg-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-colors ${
                    isActive ? 'bg-brand text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {initials(conv.otherPartyName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-[13px] text-gray-900 truncate pr-2`}>
                        {conv.otherPartyName}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-brand text-white rounded-full px-1.5 py-0.5 text-[10px] font-black shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-brand m-0 mt-0.5 font-bold truncate">
                      {conv.serviceTitle}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate m-0 mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Chat area (Hidden on mobile if NO chat is active) */}
      <div className={`flex-1 flex-col bg-white overflow-hidden relative ${!activeBookingId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Chat header */}
        <div className="p-3.5 md:p-4 border-b border-gray-100 bg-white flex items-center gap-3 shrink-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          {/* Mobile back button */}
          <button 
            className="md:hidden w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-lg border-none mr-1 focus:outline-none"
            onClick={() => setActiveBookingId(null)}
          >
            ←
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-sm font-black text-white shrink-0 shadow-sm">
            {initials(activeConvo?.otherPartyName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 m-0 truncate">
              {activeConvo?.otherPartyName}
            </p>
            <p className="text-xs text-brand m-0 mt-0.5 font-bold truncate">
              {activeConvo?.serviceTitle}
            </p>
          </div>
          <div className="hidden sm:block ml-auto px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold shrink-0 border border-emerald-100">
            ● Active
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-3 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="text-center p-10 text-gray-400 text-sm">
              Start the conversation! Say hello 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
                  isMine 
                    ? 'rounded-[18px_18px_4px_18px] bg-gradient-to-br from-brand to-brand-light text-white shadow-[0_4px_12px_rgba(252,128,25,0.25)]' 
                    : 'rounded-[18px_18px_18px_4px] bg-white text-gray-900 border border-gray-100 shadow-sm'
                }`}>
                  <p className="m-0 break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/80' : 'text-gray-400 font-medium'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        {(activeConvo?.bookingStatus === 'COMPLETED' || activeConvo?.bookingStatus === 'CANCELLED') ? (
          <div className="p-3.5 md:p-4 border-t border-gray-100 bg-gray-50 flex justify-center items-center shrink-0">
            <p className="text-sm font-medium text-gray-500 m-0">Chat is closed as the booking is {activeConvo.bookingStatus.toLowerCase()}.</p>
          </div>
        ) : (
          <div className="p-3.5 md:p-4 border-t border-gray-100 bg-white flex gap-3 items-center shrink-0">
            <input
              className="flex-1 px-4 py-3 rounded-full border-1.5 border-gray-200 text-sm text-gray-900 outline-none bg-gray-50 focus:bg-white focus:border-brand transition-colors"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className={`w-11 h-11 rounded-full border-none flex items-center justify-center text-lg transition-all shrink-0 focus:outline-none ${
                sending || !newMessage.trim() 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand text-white cursor-pointer shadow-[0_4px_12px_rgba(252,128,25,0.35)] hover:bg-brand-dark hover:-translate-y-0.5'
              }`}
            >
              {sending ? '⏳' : '➤'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
