'use client';

import { useState, useCallback, useMemo } from 'react';
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
        const data = await res.json();
        setMessage(`Error: ${data.error || 'Save failed'}`);
      } else {
        setMessage('Saved successfully.');
        if (isNew && targetSlug) {
          router.push(`/admin/edit/${contentType}/${targetSlug}`);
        }
      }
    } catch {
      setMessage('Error: Network request failed.');
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
