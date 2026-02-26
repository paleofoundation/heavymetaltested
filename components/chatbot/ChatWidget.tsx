'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage, { MessageData } from './ChatMessage';
import ChatInput from './ChatInput';

interface StreamEvent {
  type: 'sources' | 'text' | 'citation' | 'done' | 'error';
  text?: string;
  citedText?: string;
  documentIndex?: number;
  url?: string;
  title?: string;
  sources?: Array<{ url: string; title: string; sectionTitle: string; sectionAnchor: string }>;
  conversationId?: string;
  messageId?: number;
  message?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend(text: string) {
    setError(null);
    const userMsg: MessageData = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const assistantMsg: MessageData = {
      role: 'assistant',
      content: '',
      citations: [],
      sources: [],
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      abortRef.current = new AbortController();

      const history = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, conversationId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          setMessages((prev) => {
            const updated = [...prev];
            const last = { ...updated[updated.length - 1] };

            switch (event.type) {
              case 'text':
                last.content += event.text || '';
                break;

              case 'sources':
                last.sources = event.sources || [];
                break;

              case 'citation':
                if (event.url && event.title && event.citedText) {
                  last.citations = [
                    ...(last.citations || []),
                    { citedText: event.citedText, url: event.url, title: event.title },
                  ];
                }
                break;

              case 'done':
                last.isStreaming = false;
                last.id = event.messageId;
                if (event.conversationId) setConversationId(event.conversationId);
                break;

              case 'error':
                last.isStreaming = false;
                last.content = last.content || `Sorry, something went wrong: ${event.message}`;
                setError(event.message || null);
                break;
            }

            updated[updated.length - 1] = last;
            return updated;
          });
        }
      }

      // Mark streaming done if not already
      setMessages((prev) => {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        if (last.isStreaming) last.isStreaming = false;
        updated[updated.length - 1] = last;
        return updated;
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Request failed';
      setError(msg);
      setMessages((prev) => {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        last.isStreaming = false;
        last.content = last.content || `I'm sorry, I couldn't process your request. ${msg}`;
        updated[updated.length - 1] = last;
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  async function handleFeedback(messageId: number | undefined, type: 'thumbs_up' | 'thumbs_down') {
    if (!messageId) return;
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          conversationId,
          feedbackType: type,
        }),
      });
    } catch {
      // Silently fail — feedback is non-critical
    }
  }

  function handleNewChat() {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  }

  if (!isOpen) {
    return (
      <button
        className="chat-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
        title="Ask about heavy metals"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="chat-widget" role="dialog" aria-label="Chat assistant">
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <div>
            <strong>Heavy Metal Facts</strong>
            <small>Evidence-based research assistant</small>
          </div>
        </div>
        <div className="chat-header-actions">
          <button onClick={handleNewChat} title="New chat" className="chat-header-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button onClick={() => setIsOpen(false)} title="Close" className="chat-header-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <h3>Welcome to Heavy Metal Facts</h3>
            <p>Ask me about heavy metal contamination, health effects, regulatory standards, or testing methods. All answers are sourced from our research library.</p>
            <div className="chat-suggestions">
              {[
                'What are safe lead levels in drinking water?',
                'How does arsenic get into rice?',
                'What is ICP-MS testing?',
                'Compare FDA and EU cadmium limits',
              ].map((q) => (
                <button
                  key={q}
                  className="chat-suggestion-chip"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <ChatMessage msg={msg} />
            {msg.role === 'assistant' && !msg.isStreaming && msg.id && (
              <div className="chat-feedback-row">
                <button
                  className="chat-feedback-btn"
                  onClick={() => handleFeedback(msg.id, 'thumbs_up')}
                  title="Helpful"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </button>
                <button
                  className="chat-feedback-btn"
                  onClick={() => handleFeedback(msg.id, 'thumbs_down')}
                  title="Not helpful"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="chat-error-banner">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <ChatInput onSend={handleSend} disabled={isLoading} />
        <p className="chat-disclaimer">
          Answers are sourced from heavymetalfacts.com. Not medical advice.
        </p>
      </div>
    </div>
  );
}
