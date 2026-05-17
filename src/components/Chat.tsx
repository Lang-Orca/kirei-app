import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveMessage, getAllMessages } from '../lib/indexedDB';
import type { ChatMessage } from '../types';
import { Send, User, Shield, X, MessageCircle } from 'lucide-react';

export default function Chat() {
  const { role, clientName } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages() {
    const all = await getAllMessages();
    setMessages(all.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: role === 'admin' ? 'admin' : (clientName || 'client'),
      senderName: role === 'admin' ? 'Admin Kirei' : (clientName || 'Client'),
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    await saveMessage(msg);
    setNewMessage('');
    loadMessages();
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center gap-2 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold">Chatter avec nous</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-200 z-50 overflow-hidden animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            {role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-bold">Assistance Kirei</p>
            <p className="text-xs opacity-80">En ligne</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 text-sm italic">Commencez la discussion...</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = (role === 'admin' && msg.senderId === 'admin') || (role !== 'admin' && msg.senderId !== 'admin');
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                isMe 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
              }`}>
                <p className="text-[10px] opacity-70 mb-1 font-bold uppercase">{msg.senderName}</p>
                <p>{msg.text}</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 px-4 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
