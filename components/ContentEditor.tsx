'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { FieldDef } from '@/lib/content-schemas';
import type { SectionDef } from '@/lib/metal-sections';
import SectionEditor from './SectionEditor';
import { splitBodyIntoSections, assembleSectionsToBody } from '@/lib/metal-sections';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface ContentEditorProps {
  contentType: string;
  slug?: string;
  fields: FieldDef[];
  initialFrontmatter: Record<string, unknown>;
  initialBody: string;
  isNew?: boolean;
  sections?: SectionDef[];
}

const COMPRESS_MAX_DIMENSION = 1920;
const COMPRESS_QUALITY = 0.85;
const COMPRESS_THRESHOLD = 3 * 1024 * 1024; // compress if over 3 MB

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (file.size <= COMPRESS_THRESHOLD && !file.type.includes('bmp') && !file.type.includes('tiff')) {
      return resolve(file);
    }
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > COMPRESS_MAX_DIMENSION || height > COMPRESS_MAX_DIMENSION) {
        const scale = COMPRESS_MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          const ext = blob.type === 'image/png' ? '.png' : '.webp';
          const name = file.name.replace(/\.[^.]+$/, ext);
          resolve(new File([blob], name, { type: blob.type }));
        },
        'image/webp',
        COMPRESS_QUALITY,
      );
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = URL.createObjectURL(file);
  });
}

function ImageUpload({ value, onChange, fieldName, destination }: { value: string; onChange: (v: string) => void; fieldName: string; destination?: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(rawFile: File) {
    setUploading(true);
    setError('');
    try {
      const file = await compressImage(rawFile);
      const form = new FormData();
      form.append('file', file);
      form.append('destination', destination || 'public/images/uploads');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        let msg = `Upload failed (${res.status})`;
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch { /* non-JSON response */ }
        setError(msg);
        return;
      }
      const data = await res.json();
      onChange(data.path);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--iu-space-xs)' }}>
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--iu-space-sm)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={fieldName}
            style={{
              width: fieldName === 'avatar' ? 64 : 120,
              height: fieldName === 'avatar' ? 64 : 68,
              borderRadius: fieldName === 'avatar' ? '50%' : 'var(--iu-radius-md)',
              objectFit: 'cover',
              border: '2px solid var(--iu-border)',
            }}
          />
          <span style={{ fontSize: 'var(--iu-ts-12)', color: 'var(--iu-text-muted)', wordBreak: 'break-all' }}>{value}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--iu-space-xs)', alignItems: 'center' }}>
        <label className="ms-btn ms-btn-outline" style={{ cursor: 'pointer', fontSize: 'var(--iu-ts-14)' }}>
          {uploading ? 'Uploading...' : value ? 'Change Photo' : 'Upload Photo'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
        <input
          className="ms-input"
          placeholder="Or paste image path"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, fontSize: 'var(--iu-ts-14)' }}
        />
      </div>
      {error && <span style={{ color: '#b91c1c', fontSize: 'var(--iu-ts-12)' }}>{error}</span>}
    </div>
  );
}

interface AuthorOption {
  slug: string;
  title: string;
  avatar: string | null;
  role: string | null;
}

function AuthorPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/authors')
      .then((r) => r.json())
      .then((data) => setAuthors(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(slug: string) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  }

  if (loading) {
    return <span style={{ fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)' }}>Loading authors...</span>;
  }

  if (authors.length === 0) {
    return <span style={{ fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)' }}>No authors found. Create one first.</span>;
  }

  const selected = authors.filter((a) => value.includes(a.slug));
  const unselected = authors.filter((a) => !value.includes(a.slug));
  const sorted = [...selected, ...unselected];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--iu-space-xs)' }}>
      {sorted.map((author) => {
        const checked = value.includes(author.slug);
        return (
          <label
            key={author.slug}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--iu-space-sm)',
              padding: '6px 10px',
              borderRadius: 'var(--iu-radius-md)',
              cursor: 'pointer',
              background: checked ? '#f0fdf4' : 'transparent',
              border: checked ? '1px solid #86efac' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(author.slug)}
              style={{ accentColor: 'var(--iu-crimson)', width: 16, height: 16, flexShrink: 0 }}
            />
            <span style={{
              width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              background: 'var(--iu-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--iu-border)', fontSize: 'var(--iu-ts-12)', fontWeight: 600, color: 'var(--iu-text-muted)',
            }}>
              {author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                author.title.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
              )}
            </span>
            <span style={{ fontSize: 'var(--iu-ts-14)', fontWeight: checked ? 600 : 400 }}>
              {author.title}
            </span>
            {author.role && (
              <span style={{ fontSize: 'var(--iu-ts-12)', color: 'var(--iu-text-muted)', marginLeft: 'auto' }}>
                {author.role}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: value.length ? 6 : 0 }}>
        {value.map((tag) => (
          <span key={tag} className="tag" style={{ cursor: 'pointer' }} onClick={() => onChange(value.filter((t) => t !== tag))}>
            {tag} &times;
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--iu-space-xs)' }}>
        <input
          className="ms-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Type and press Enter"
          style={{ flex: 1 }}
        />
        <button type="button" className="ms-btn ms-btn-outline" onClick={addTag} style={{ flexShrink: 0, fontSize: 'var(--iu-ts-14)' }}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function ContentEditor({ contentType, slug, fields, initialFrontmatter, initialBody, isNew, sections: sectionDefs }: ContentEditorProps) {
  const router = useRouter();
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>(initialFrontmatter);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const initialSectionValues = useMemo(
    () => sectionDefs ? splitBodyIntoSections(initialBody) : {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [sectionValues, setSectionValues] = useState<Record<string, string>>(initialSectionValues);

  const setField = useCallback((name: string, value: unknown) => {
    setFrontmatter((prev) => ({ ...prev, [name]: value }));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const targetSlug = (frontmatter.slug as string) || slug;
      const url = isNew ? `/api/content/${contentType}` : `/api/content/${contentType}/${slug}`;
      const method = isNew ? 'POST' : 'PUT';
      const finalBody = sectionDefs
        ? assembleSectionsToBody(sectionValues, frontmatter.references as string[] | undefined)
        : body;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontmatter, body: finalBody }),
      });
      if (!res.ok) {
        let errMsg = `Save failed (${res.status})`;
        try {
          const data = await res.json();
          if (data.error) errMsg = data.error;
        } catch {
          const text = await res.text().catch(() => '');
          if (text.includes('EROFS') || text.includes('read-only')) {
            errMsg = 'Server filesystem is read-only. Content editing requires a local dev server, not the production Vercel deployment.';
          }
        }
        setMessage(`Error: ${errMsg}`);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.via === 'github') {
          setMessage('Saved — committed to GitHub. Site will redeploy in ~30 seconds.');
        } else {
          setMessage('Saved successfully.');
        }
        if (isNew && targetSlug) {
          router.push(`/admin/edit/${contentType}/${targetSlug}`);
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${detail}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!slug || isNew) return;
    if (!confirm(`Delete "${frontmatter.title || slug}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/content/${contentType}/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        router.push(`/admin/${contentType}`);
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.error || 'Delete failed'}`);
      }
    } catch {
      setMessage('Error: Network request failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--iu-space-lg)' }}>
      <div style={{ background: 'var(--iu-bg-light)', padding: 'var(--iu-space-lg)', borderRadius: 'var(--iu-radius-lg)', border: '1px solid var(--iu-border)' }}>
        <h2 style={{ fontSize: 'var(--iu-ts-20)', marginBottom: 'var(--iu-space-lg)' }}>Frontmatter</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--iu-space-md)' }}>
          {fields.map((field) => (
            <label key={field.name} style={{ display: 'block' }}>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--iu-ts-14)', marginBottom: 'var(--iu-space-xxs)' }}>
                {field.label}{field.required ? ' *' : ''}
              </span>
              {field.type === 'text' && (
                <input
                  className="ms-input"
                  value={(frontmatter[field.name] as string) ?? ''}
                  onChange={(e) => setField(field.name, e.target.value)}
                  readOnly={field.name === 'slug' && !isNew}
                />
              )}
              {field.type === 'textarea' && (
                <textarea
                  className="ms-input"
                  rows={3}
                  value={(frontmatter[field.name] as string) ?? ''}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              )}
              {field.type === 'date' && (
                <input
                  className="ms-input"
                  type="date"
                  value={(frontmatter[field.name] as string) ?? ''}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              )}
              {field.type === 'image' && (
                <ImageUpload
                  value={(frontmatter[field.name] as string) ?? ''}
                  onChange={(v) => setField(field.name, v)}
                  fieldName={field.name}
                  destination={
                    field.name === 'avatar' ? 'public/images/authors'
                      : `public/images/${contentType}`
                  }
                />
              )}
              {field.type === 'authorPicker' && (
                <AuthorPicker
                  value={Array.isArray(frontmatter[field.name]) ? (frontmatter[field.name] as string[]) : []}
                  onChange={(v) => setField(field.name, v)}
                />
              )}
              {field.type === 'tags' && (
                <TagInput
                  value={Array.isArray(frontmatter[field.name]) ? (frontmatter[field.name] as string[]) : []}
                  onChange={(v) => setField(field.name, v)}
                />
              )}
            </label>
          ))}
        </div>
      </div>

      {sectionDefs ? (
        <div>
          <h2 style={{ fontSize: 'var(--iu-ts-20)', marginBottom: 'var(--iu-space-sm)' }}>Sections</h2>
          <SectionEditor
            sectionDefs={sectionDefs}
            initialSections={sectionValues}
            onSectionsChange={setSectionValues}
            onImportMeta={(meta) => {
              if (meta.description) setField('description', meta.description);
              if (meta.references) setField('references', meta.references);
            }}
          />
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: 'var(--iu-ts-20)', marginBottom: 'var(--iu-space-sm)' }}>Body (Markdown)</h2>
          <div data-color-mode="light">
            <MDEditor value={body} onChange={(v) => setBody(v ?? '')} height={500} />
          </div>
        </div>
      )}

      {message && (
        <p style={{
          padding: 'var(--iu-space-sm) var(--iu-space-md)',
          borderRadius: 'var(--iu-radius-md)',
          fontSize: 'var(--iu-ts-14)',
          background: message.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
          color: message.startsWith('Error') ? '#b91c1c' : '#166534',
        }}>
          {message}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--iu-space-sm)', alignItems: 'center' }}>
        <button className="ms-btn ms-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isNew ? 'Create' : 'Save Changes'}
        </button>
        {!isNew && slug && (
          <button className="ms-btn ms-btn-outline" onClick={handleDelete} disabled={saving} style={{ color: '#b91c1c', borderColor: '#b91c1c' }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
