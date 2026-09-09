import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Mic, MapPin, Sparkles, X, Bot, User, Maximize2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/assistant') || location.pathname.startsWith('/chat')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am WeatherGPT, your AI-powered personal weather assistant. Ask me anything about the weather!',
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'There is an 80% chance of rain tomorrow evening in Rajkot. Rain is most likely between 5 PM and 8 PM. I recommend carrying an umbrella if you are going outside.'
      }]);
    }, 1500);
  };

  const suggestions = [
    "Will it rain today?",
    "Should I carry an umbrella?",
    "What is tomorrow's weather?"
  ];

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-weathergpt', handleOpen);
    return () => window.removeEventListener('open-weathergpt', handleOpen);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-primary-foreground px-4 py-3 md:px-5 md:py-3 rounded-full shadow-xl hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 hover:scale-105 z-50 flex items-center gap-2.5 border border-white/20 backdrop-blur-md cursor-pointer"
        title="Chat with WeatherGPT AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
          </span>
        </div>
        <span className="font-semibold text-sm tracking-wide">Ask WeatherGPT</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full h-[80vh] md:h-[600px] md:w-[400px] md:bottom-6 md:right-6 bg-card border shadow-2xl md:rounded-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-8">
      {/* Header */}
      <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Ask WeatherGPT</h3>
            <p className="text-xs text-primary-foreground/80">Your AI weather assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/assistant');
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Open Fullscreen ChatGPT Voice Assistant"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", 
              msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className={cn(
              "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-card border shadow-sm text-foreground rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-card border shadow-sm rounded-tl-sm flex gap-1 items-center">
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t">
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s)}
                className="text-xs bg-muted hover:bg-accent hover:text-accent-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-muted rounded-full px-4 py-2 border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
            <button className="p-1 hover:text-primary transition-colors text-muted-foreground">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
