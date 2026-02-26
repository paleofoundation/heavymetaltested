'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { SectionDef } from '@/lib/metal-sections';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface SectionEditorProps {
  sectionDefs: SectionDef[];
  initialSections: Record<string, string>;
  onSectionsChange: (sections: Record<string, string>) => void;
  onImportMeta?: (meta: { description?: string; references?: string[] }) => void;
}

function CollapsibleSection({
  heading,
  value,
  onChange,
}: {
  heading: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(!!value.trim());
  const hasContent = !!value.trim();

  return (
    <div style={{ border: '1px solid var(--iu-border)', borderRadius: 'var(--iu-radius-md)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'var(--iu-space-md) var(--iu-space-lg)',
          background: hasContent ? 'var(--iu-bg-light)' : 'var(--iu-white)',
          border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--iu-ts-16)',
          color: 'var(--iu-text)', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span>{heading} {hasContent && <span style={{ color: 'var(--iu-text-muted)', fontWeight: 400, fontSize: 'var(--iu-ts-14)' }}> -- has content</span>}</span>
        <span style={{ fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)' }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div style={{ padding: 'var(--iu-space-md)', borderTop: '1px solid var(--iu-border)' }} data-color-mode="light">
          <MDEditor value={value} onChange={(v) => onChange(v ?? '')} height={300} />
        </div>
      )}
    </div>
  );
}

export default function SectionEditor({ sectionDefs, initialSections, onSectionsChange, onImportMeta }: SectionEditorProps) {
  const [sections, setSections] = useState<Record<string, string>>(initialSections);
  const [unmatched, setUnmatched] = useState<{ heading: string; content: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const updateSection = useCallback((key: string, value: string) => {
    setSections((prev) => {
      const next = { ...prev, [key]: value };
      onSectionsChange(next);
      return next;
    });
  }, [onSectionsChange]);

  async function handleImport(file: File) {
    if (!file.name.endsWith('.docx')) {
      setImportMessage('Please upload a .docx file (export from Pages via File > Export To > Word).');
      return;
    }
    setImporting(true);
    setImportMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/import', { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json();
        setImportMessage(`Error: ${data.error || 'Import failed'}`);
        return;
      }
      const data = await res.json();

      const newSections = { ...sections };
      for (const def of sectionDefs) {
        if (data.sections[def.key]) {
          newSections[def.key] = data.sections[def.key];
        }
      }
      setSections(newSections);
      onSectionsChange(newSections);

      if (data.unmatched?.length > 0) {
        setUnmatched(data.unmatched);
      }

      if (onImportMeta) {
        const meta: { description?: string; references?: string[] } = {};
        if (data.description) meta.description = data.description;
        if (data.references?.length > 0) meta.references = data.references;
        onImportMeta(meta);
      }

      const filledCount = sectionDefs.filter((d) => newSections[d.key]?.trim()).length;
      setImportMessage(`Imported successfully. ${filledCount}/${sectionDefs.length} sections populated.${data.unmatched?.length ? ` ${data.unmatched.length} unmatched heading(s) below.` : ''}`);
    } catch {
      setImportMessage('Error: Network request failed.');
    } finally {
      setImporting(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImport(file);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--iu-space-lg)' }}>
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--iu-blue)' : 'var(--iu-border)'}`,
          borderRadius: 'var(--iu-radius-lg)',
          padding: 'var(--iu-space-xl)',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--iu-blue-bg)' : 'var(--iu-bg-light)',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".docx"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); }}
        />
        <p style={{ fontWeight: 600, marginBottom: 'var(--iu-space-xs)' }}>
          {importing ? 'Importing...' : 'Import from .docx'}
        </p>
        <p style={{ fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)', margin: 0 }}>
          Drag a Word file here or click to upload. Sections will auto-populate.
        </p>
      </div>

      {importMessage && (
        <p style={{
          padding: 'var(--iu-space-sm) var(--iu-space-md)',
          borderRadius: 'var(--iu-radius-md)',
          fontSize: 'var(--iu-ts-14)',
          background: importMessage.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
          color: importMessage.startsWith('Error') ? '#b91c1c' : '#166534',
        }}>
          {importMessage}
        </p>
      )}

      {/* Section editors */}
      {sectionDefs.map((def) => (
        <CollapsibleSection
          key={def.key}
          heading={def.heading}
          value={sections[def.key] ?? ''}
          onChange={(v) => updateSection(def.key, v)}
        />
      ))}

      {/* Unmatched content */}
      {unmatched.length > 0 && (
        <div style={{ border: '2px solid #f59e0b', borderRadius: 'var(--iu-radius-lg)', padding: 'var(--iu-space-lg)', background: '#fffbeb' }}>
          <h3 style={{ fontSize: 'var(--iu-ts-18)', marginBottom: 'var(--iu-space-md)', color: '#92400e' }}>
            Unmatched Content ({unmatched.length})
          </h3>
          <p style={{ fontSize: 'var(--iu-ts-14)', color: '#92400e', marginBottom: 'var(--iu-space-md)' }}>
            These headings from the document did not match any section. Copy their content into the appropriate section above.
          </p>
          {unmatched.map((u, i) => (
            <details key={i} style={{ marginBottom: 'var(--iu-space-sm)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{u.heading}</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--iu-ts-14)', padding: 'var(--iu-space-sm)', background: 'var(--iu-white)', borderRadius: 'var(--iu-radius-md)', marginTop: 'var(--iu-space-xs)', maxHeight: 200, overflow: 'auto' }}>
                {u.content}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
