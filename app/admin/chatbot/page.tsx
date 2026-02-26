'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

interface IndexStatus {
  index: { totalPages: number; totalChunks: number };
  recentCrawls: Array<{
    id: number;
    job_type: string;
    status: string;
    pages_processed: number;
    chunks_created: number;
    started_at: string;
    completed_at: string | null;
    triggered_by: string;
    error: string | null;
  }>;
  stats: { totalMessages: number; totalFeedback: number };
}

interface Analytics {
  period: string;
  totalQueries: number;
  noAnswerRate: number;
  topQuestions: Array<{ query: string; count: number }>;
  feedback: { thumbs_up: number; thumbs_down: number; report: number };
  cost: {
    totalInputTokens: number;
    totalOutputTokens: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
  };
}

export default function ChatbotAdminPage() {
  const { data: session, status: authStatus } = useSession();
  const [statusData, setStatusData] = useState<IndexStatus | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [reindexUrl, setReindexUrl] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [statusRes, analyticsRes] = await Promise.all([
        fetch('/api/chat/admin/status'),
        fetch('/api/chat/admin/analytics'),
      ]);

      if (statusRes.ok) setStatusData(await statusRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch {
      setMessage('Failed to load data');
    }
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  if (authStatus === 'loading') return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!session) return <div style={{ padding: '2rem' }}>Please log in to access the chatbot admin.</div>;

  async function triggerReindex(fullRebuild: boolean) {
    setReindexing(true);
    setMessage('');
    try {
      const body: Record<string, unknown> = {};
      if (fullRebuild) body.fullRebuild = true;
      else if (reindexUrl.trim()) body.url = reindexUrl.trim();

      const res = await fetch('/api/chat/admin/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Reindex complete: ${data.pagesProcessed} pages, ${data.chunksCreated} chunks`);
        loadData();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Failed: ${(err as Error).message}`);
    } finally {
      setReindexing(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Chatbot Admin</h1>

      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`,
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          {message}
        </div>
      )}

      {/* Index Status */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Index Status</h2>
        {statusData ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <StatCard label="Pages Indexed" value={statusData.index.totalPages} />
            <StatCard label="Total Chunks" value={statusData.index.totalChunks} />
            <StatCard label="Total Messages" value={statusData.stats.totalMessages} />
            <StatCard label="Feedback Items" value={statusData.stats.totalFeedback} />
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>Loading...</p>
        )}
      </section>

      {/* Reindex Controls */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Reindex</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="url"
            placeholder="URL to reindex (optional)"
            value={reindexUrl}
            onChange={(e) => setReindexUrl(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: '0.875rem',
            }}
          />
          <button
            onClick={() => triggerReindex(false)}
            disabled={reindexing}
            style={btnStyle('#990000')}
          >
            {reindexing ? 'Indexing...' : 'Reindex URL'}
          </button>
          <button
            onClick={() => triggerReindex(true)}
            disabled={reindexing}
            style={btnStyle('#243142')}
          >
            Full Rebuild
          </button>
        </div>
      </section>

      {/* Analytics */}
      {analytics && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>Analytics (30 days)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard label="Total Queries" value={analytics.totalQueries} />
            <StatCard label="No-Answer Rate" value={`${analytics.noAnswerRate}%`} />
            <StatCard label="Avg Latency" value={`${analytics.cost.avgLatencyMs}ms`} />
            <StatCard label="Est. Cost" value={`$${analytics.cost.estimatedCostUsd}`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Top Questions</h3>
              {analytics.topQuestions.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No queries yet</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem' }}>
                  {analytics.topQuestions.slice(0, 10).map((q, i) => (
                    <li key={i} style={{ padding: '0.25rem 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280', marginRight: 8 }}>{q.count}x</span>
                      {q.query}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Feedback</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem' }}>
                <li style={{ padding: '0.25rem 0' }}>👍 Helpful: {analytics.feedback.thumbs_up}</li>
                <li style={{ padding: '0.25rem 0' }}>👎 Not helpful: {analytics.feedback.thumbs_down}</li>
                <li style={{ padding: '0.25rem 0' }}>⚠️ Reports: {analytics.feedback.report}</li>
              </ul>

              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1rem' }}>Token Usage</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem' }}>
                <li>Input: {analytics.cost.totalInputTokens.toLocaleString()}</li>
                <li>Output: {analytics.cost.totalOutputTokens.toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Crawl History */}
      {statusData?.recentCrawls && statusData.recentCrawls.length > 0 && (
        <section>
          <h2>Recent Crawl Jobs</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Type', 'Status', 'Pages', 'Chunks', 'Started', 'By'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e5e7eb', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statusData.recentCrawls.map((crawl) => (
                  <tr key={crawl.id}>
                    <td style={tdStyle}>{crawl.job_type}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: crawl.status === 'completed' ? '#dcfce7' : crawl.status === 'failed' ? '#fef2f2' : '#fef9c3',
                        color: crawl.status === 'completed' ? '#166534' : crawl.status === 'failed' ? '#991b1b' : '#854d0e',
                      }}>
                        {crawl.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{crawl.pages_processed}</td>
                    <td style={tdStyle}>{crawl.chunks_created}</td>
                    <td style={tdStyle}>{new Date(crawl.started_at).toLocaleString()}</td>
                    <td style={tdStyle}>{crawl.triggered_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#243142' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '0.5rem 1rem',
    borderRadius: 6,
    border: 'none',
    background: bg,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderBottom: '1px solid #f3f4f6',
};
