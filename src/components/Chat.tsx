import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveMessage, getAllMessages, getAllCommandes } from '../lib/indexedDB';
import type { ChatMessage } from '../types';
import { Send, User, Shield, X, MessageCircle, ArrowLeft } from 'lucide-react';

export default function Chat() {
  const { role, clientName } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    // Load messages
    const allMsgs = await getAllMessages();
    let filtered: ChatMessage[] = [];
    
    if (role === 'client') {
      filtered = allMsgs.filter(m => m.clientId === clientName);
    } else if (role === 'admin') {
      if (selectedClient) {
        filtered = allMsgs.filter(m => m.clientId === selectedClient);
      } else {
        filtered = allMsgs;
      }
      
      // Load all clients from orders to allow admin to start chats
      const allOrders = await getAllCommandes();
      const clientNames = Array.from(new Set(allOrders.map(o => o.clientName))).filter(Boolean);
      setAvailableClients(clientNames);
    }
    
    setMessages(filtered.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  }, [role, clientName, selectedClient]);

  useEffect(() => {
    if (isOpen && role) {
      loadData();
      const interval = setInterval(loadData, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, role, loadData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Combine clients from messages and orders for the admin list
  const adminConversations = Array.from(new Set([
    ...availableClients,
    ...messages.map(m => m.clientId)
  ])).filter(Boolean).map(cId => {
    const lastMsg = [...messages].reverse().find(m => m.clientId === cId);
    return {
      clientId: cId,
      clientDisplayName: cId,
      lastText: lastMsg?.text || 'Aucun message encore',
      timestamp: lastMsg?.timestamp || ''
    };
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const targetClientId = role === 'admin' ? selectedClient : clientName;
    if (!targetClientId) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: role === 'admin' ? 'admin' : (clientName || 'client'),
      senderName: role === 'admin' ? 'Admin Kirei' : (clientName || 'Client'),
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      clientId: targetClientId,
    };

    try {
      await saveMessage(msg);
      setNewMessage('');
      loadData();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  }

  // If not logged in, don't show the chat at all to avoid errors
  if (!role) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-[9999] flex items-center gap-2 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">Chatter avec nous</span>
      </button>
    );
  }

  const showListView = role === 'admin' && !selectedClient;

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-200 z-[9999] overflow-hidden animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {role === 'admin' && selectedClient && (
            <button onClick={() => setSelectedClient(null)} className="p-1 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="p-2 bg-white/20 rounded-xl">
            {role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">
              {showListView ? 'Conversations Clients' : (selectedClient || 'Assistance Kirei')}
            </p>
            <p className="text-xs opacity-80">En ligne</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      {showListView ? (
        /* ADMIN LIST VIEW */
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {adminConversations.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Aucun client disponible</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {adminConversations.map(conv => (
                <button
                  key={conv.clientId}
                  onClick={() => setSelectedClient(conv.clientId)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-white transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                    {(conv.clientDisplayName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{conv.clientDisplayName}</p>
                    <p className="text-xs text-slate-500 truncate">{conv.lastText}</p>
                  </div>
                  {conv.timestamp && (
                    <p className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CONVERSATION VIEW (Client or Admin responding to one client) */
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-400 text-sm italic px-8">Posez votre question ici, l'admin vous répondra bientôt.</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = (role === 'admin' && msg.senderId === 'admin') || (role !== 'admin' && msg.senderId !== 'admin');
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="text-[10px] opacity-70 mb-1 font-bold uppercase">{msg.senderName}</p>
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Votre message..."
              className="flex-1 px-4 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm border-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
