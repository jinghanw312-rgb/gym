import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { askFitnessQuestion } from '../services/aiService';
import { sendMessage, subscribeToChat, clearChat, ChatMessage } from '../services/chatService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AIAssistant() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user && isOpen) {
      const unsubscribe = subscribeToChat(user.uid, (data) => {
        setMessages(data);
      });
      return () => unsubscribe();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // 1. Save user message to Firestore
      await sendMessage(user.uid, 'user', userText);

      // 2. Prepare history for AI
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // 3. Get AI response
      const response = await askFitnessQuestion(userText, history);
      
      // 4. Save AI response to Firestore
      await sendMessage(user.uid, 'assistant', response || t('ai.error_response'));
    } catch (error) {
      console.error(error);
      // Fallback local message for error (not necessarily saved to firestore if it's a persistent error)
      setMessages(prev => [...prev, {
        userId: user.uid,
        role: 'assistant',
        content: t('ai.network_error'),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!user || !window.confirm(t('ai.clear_confirm'))) return;
    try {
      await clearChat(user.uid);
    } catch (error) {
      console.error(error);
      alert('Clear failed');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 z-[100] group"
        id="ai-assistant-toggle"
      >
        <MessageSquare className="text-white group-hover:rotate-12 transition-transform" size={28} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-end justify-end p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="w-full max-w-md h-[650px] glass rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl pointer-events-auto border border-cyan-500/20"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-slate-950">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-black italic uppercase tracking-tighter text-white">{t('ai.title')}</h3>
                    <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">Always Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleClear}
                    title={t('ai.clear_tooltip')}
                    className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && !isLoading && (
                  <div key="empty-state" className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Bot size={48} className="text-cyan-400" />
                    <p className="text-sm font-mono uppercase tracking-widest max-w-[200px] text-slate-300">
                      {t('ai.empty')}
                    </p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-cyan-500 text-slate-950'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600/20 rounded-tr-none text-blue-50 border border-blue-500/20' 
                        : 'bg-white/5 rounded-tl-none text-slate-200 border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div key="loading-indicator" className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-950">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5">
                      <div className="flex gap-1 items-center">
                         <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                         <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                         <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 pt-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="glass rounded-full p-1.5 flex items-center pl-6 gap-2 border border-white/10"
                >
                  <input 
                    type="text" 
                    placeholder={t('ai.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none placeholder:text-slate-500 text-white"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
