'use client';

import React from 'react';

interface Citation {
  citedText: string;
  url: string;
  title: string;
}

interface Source {
  url: string;
  title: string;
  sectionTitle: string;
  sectionAnchor: string;
}

export interface MessageData {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  sources?: Source[];
  isStreaming?: boolean;
}

export default function ChatMessage({ msg }: { msg: MessageData }) {
  if (msg.role === 'user') {
    return (
      <div className="chat-msg chat-msg-user">
        <div className="chat-msg-bubble chat-msg-bubble-user">{msg.content}</div>
      </div>
    );
  }

  const uniqueSources = msg.sources
    ? Array.from(new Map(msg.sources.map((s) => [s.url, s])).values())
    : [];

  return (
    <div className="chat-msg chat-msg-assistant">
      <div className="chat-msg-bubble chat-msg-bubble-assistant">
        <div className="chat-msg-text">
          {msg.content}
          {msg.isStreaming && <span className="chat-cursor" />}
        </div>

        {msg.citations && msg.citations.length > 0 && (
          <div className="chat-citations">
            {msg.citations.map((cite, i) => (
              <a
                key={i}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="chat-citation-chip"
                title={cite.citedText}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                </svg>
                {cite.title}
              </a>
            ))}
          </div>
        )}

        {uniqueSources.length > 0 && !msg.isStreaming && (
          <details className="chat-sources">
            <summary>Sources ({uniqueSources.length})</summary>
            <ul>
              {uniqueSources.map((source, i) => (
                <li key={i}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                    {source.sectionTitle ? ` — ${source.sectionTitle}` : ''}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
