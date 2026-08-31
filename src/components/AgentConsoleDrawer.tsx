import React, { useState } from 'react';
import {
  Terminal,
  X,
  Send,
  Bot,
  Sparkles,
  User,
  CheckCircle2,
  Code,
} from 'lucide-react';
import { api } from '../services/api';

interface AgentConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAll: () => void;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  toolsInvoked?: string[];
  timestamp: string;
}

export const AgentConsoleDrawer: React.FC<AgentConsoleDrawerProps> = ({
  isOpen,
  onClose,
  onRefreshAll,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: 'WasteOps autonomous agent is online. I am actively monitoring 30 smart-bins across San Francisco. How can I assist municipal operations?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendAgentConsole(query);
      const agentMsg: Message = {
        sender: 'agent',
        text: res.response,
        toolsInvoked: res.toolsInvoked,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      onRefreshAll();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Error processing operational query. Local fallback active.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    'Why is BIN-104 critical?',
    'Which vehicles are currently available?',
    'Resolve current crisis across all zones',
    'List all high-risk bins',
  ];

  return (
    <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Agent Operations Console</h3>
            <span className="text-[11px] text-emerald-400 font-mono">Gemini 3.7 Flash • Live Operational Context</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1.5">
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80'
              }`}
            >
              <p>{msg.text}</p>

              {msg.toolsInvoked && msg.toolsInvoked.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Code className="w-3 h-3 text-emerald-600" />
                  <span>Tools: {msg.toolsInvoked.join(', ')}</span>
                </div>
              )}

              <div className="text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-2">
            <Bot className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Agent reasoning over operational telemetry...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask agent or command dispatch..."
            className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-900"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
