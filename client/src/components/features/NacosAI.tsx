'use client';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
  'What is a binary search tree?',
  'Explain Big O notation simply',
  'How do I calculate my CGPA?',
  'What is the difference between TCP and UDP?',
  'Explain object-oriented programming',
];

export default function NacosAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/nacos-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not connect right now. Please make sure the AI service is configured.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)', minHeight: 500 }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>NACOS AI</p>
          <p className="text-xs text-gray-400">Your personal study assistant · Powered by Claude</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-5 pt-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <p className="text-base font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Hi! I'm NACOS AI
              </p>
              <p className="text-sm text-gray-400 mt-1">Ask me anything about your courses, assignments, or tech topics.</p>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3 text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Suggested Questions</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="px-3.5 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600
                      hover:border-gray-900 hover:text-gray-900 transition-all"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${m.role === 'user'
                ? 'bg-gray-900 text-white rounded-br-md'
                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
              }`}>
              {m.content.split('\n').map((line, li) => (
                <span key={li}>{line}{li < m.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t border-gray-100">
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your courses..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm
              focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          <button type="submit" disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-40 hover:bg-gray-800 transition
              shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-gray-300 mt-2 text-center">
          NACOS AI may make mistakes. Always verify important information with your lecturers.
        </p>
      </div>
    </div>
  );
}
