import React, { useState } from 'react';
import { Message } from '../types';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  Send, 
  User, 
  Sparkles, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';
import { SUPPORT_FAQS, KNOWLEDGE_BASE_GRID } from '../data';

interface SupportProps {
  parentName: string;
}

export default function Support({ parentName }: SupportProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'chat'>('main');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Chat States
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 'm1', sender: 'assistant', text: `Hello ${parentName.split(' ')[0]}, I am your Eduvia Support Assistant. How can I help you manage your children's curriculum progress today?`, timestamp: 'Just now' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, parentName })
      });
      const data = await res.json();
      const replyText = data.reply || "I am your Eduvia Assistant. How can I assist you with your student's learning path today?";

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Just now'
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: "I am ready to help! You can configure child profiles from the dashboard, launch quizzes from the Assessments tab, or track weekly progress in Analytics.",
        timestamp: 'Just now'
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // KB categories filter
  const filteredKb = KNOWLEDGE_BASE_GRID.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suggestedPills = [
    "How do I add a child profile?",
    "How is curriculum mastery calculated?",
    "How can I assign a custom quiz?",
    "Where is the calendar?"
  ];

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto w-full">
      
      {/* HEADER BAR */}
      {activeTab === 'main' ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 uppercase tracking-wider">
            <span>Customer Care Hub</span>
            <span>•</span>
            <span>Support Center</span>
          </div>
          <h1 className="text-2xl font-sans font-extrabold text-orange-600 tracking-tight">
            Eduvia Help &amp; Support Center
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Search our knowledge base, review FAQs, or speak directly with our conversational AI support assistant.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('main')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-orange-600 uppercase font-semibold">
              Live Conversation Workspace
            </span>
            <h1 className="text-xl font-sans font-extrabold text-orange-600 tracking-tight flex items-center gap-2">
              <Cpu size={18} className="text-orange-600" />
              <span>Eduvia Support Assistant</span>
            </h1>
          </div>
        </div>
      )}

      {/* SUPPORT MAIN PAGE (Screen 11 representation) */}
      {activeTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Knowledge Base FAQs Section (Left Column) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Contact Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('chat')}
                className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-orange-500/30 transition-colors cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                    <MessageSquare size={18} />
                  </div>
                  <h3 className="font-sans font-bold text-xs text-slate-900 block leading-none">
                    AI Chat Assistant
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    Conversational AI support available 24/7 to solve parent queries.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-orange-600 mt-4 flex items-center gap-0.5 group-hover:text-orange-500">
                  <span>Chat Now</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                    <PhoneCall size={18} />
                  </div>
                  <h3 className="font-sans font-bold text-xs text-slate-900 block leading-none">
                    Call Support
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    Speak directly with a student advisor during standard business hours.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 mt-4 font-bold">
                  +1 (800) EDU-VIA1
                </span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                    <Mail size={18} />
                  </div>
                  <h3 className="font-sans font-bold text-xs text-slate-900 block leading-none">
                    Email Support
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    File a system ticket or email school administrators directly.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 mt-4 font-bold">
                  support@eduvia.org
                </span>
              </div>
            </div>

            {/* Knowledge Base Categories Bento (Screen 11 layout) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-sm font-sans font-bold text-slate-900">Knowledge Base Chapters</h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Explore standard documentations guides.</p>
                </div>

                {/* KB Search input */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl font-sans text-xs focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredKb.map((kb, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {kb.tag}
                      </span>
                      <h4 className="font-sans font-bold text-xs text-slate-800 mt-2.5 mb-1.5">{kb.title}</h4>
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{kb.desc}</p>
                    </div>

                    <span className="text-[10px] font-semibold text-orange-600 flex items-center gap-0.5 mt-4 hover:underline cursor-pointer">
                      <span>View Articles ({kb.itemsCount})</span>
                      <ChevronRight size={10} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Asked Questions (FAQ List) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="font-sans font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-orange-500" />
                <span>Frequently Asked Questions</span>
              </h2>

              <div className="space-y-3">
                {SUPPORT_FAQS.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all overflow-hidden"
                    >
                      <div
                        onClick={() => toggleFaq(idx)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className="text-xs font-sans font-bold text-slate-800 pr-4">
                          {faq.q}
                        </span>
                        <div className="text-slate-400 shrink-0">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-100/60 pt-3">
                          <p className="text-xs text-slate-600 font-sans leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Help Center Pro Tips Sidebar (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-orange-950 text-orange-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-800/40 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-orange-800 text-orange-300 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <span className="text-[10px] font-mono uppercase font-semibold text-orange-300">
                  Eduvia Pro Advice
                </span>
              </div>

              <h4 className="font-sans font-bold text-xs text-white mb-1.5">
                Syllabus Synchronization
              </h4>
              <p className="text-[10px] text-orange-200 font-sans leading-relaxed">
                If your child's classroom progress does not reflect in your portal within 24 hours, check with their homeroom counselor or use our chat widget to request manual database synchronization.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* CHAT SUPPORT VIEW (Screen 12 representation) */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px] max-w-3xl mx-auto">
          {/* Active Chat Header */}
          <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-600 text-white flex items-center justify-center font-sans font-bold">
              EA
            </div>
            <div>
              <span className="font-sans font-bold text-sm block">Eduvia Support Assistant</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-sans">Active AI Agent Online</span>
              </div>
            </div>
          </div>

          {/* Conversation messages display */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[80%] ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-sans font-semibold text-[10px] ${
                    isAssistant ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isAssistant ? 'AI' : 'ME'}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs font-sans shadow-sm leading-relaxed ${
                    isAssistant 
                      ? 'bg-white border border-slate-200/60 text-slate-800' 
                      : 'bg-orange-600 text-white'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`block text-[9px] mt-1.5 text-right font-mono ${
                      isAssistant ? 'text-slate-400' : 'text-orange-200'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Simulating Typings */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-lg shrink-0 bg-orange-600 text-white flex items-center justify-center text-[10px] font-sans font-semibold">
                  AI
                </div>
                <div className="p-3.5 bg-white border border-slate-200/60 rounded-2xl flex items-center gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions pills */}
          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto select-none no-scrollbar">
            {suggestedPills.map((pill, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(pill)}
                className="py-1 px-3 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-100 text-slate-600 hover:text-orange-600 text-[11px] font-sans rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Send Input Footer */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex gap-3">
            <input
              type="text"
              placeholder="Ask the Eduvia Support Assistant..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-sans text-xs outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-600/15 transition-all cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
