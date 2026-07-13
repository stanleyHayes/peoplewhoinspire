import { useRef, useState, type ReactNode } from 'react';
import {
  FaBold,
  FaItalic,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaLink,
  FaImage,
  FaPen,
  FaEye,
} from 'react-icons/fa';
import Markdown from './Markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/**
 * Lightweight Markdown editor: a formatting toolbar over a textarea with a
 * Write/Preview toggle. The preview uses the same <Markdown> renderer as the
 * public blog, so what you preview is exactly what gets published.
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your article in Markdown…',
  rows = 14,
}: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const apply = (transform: (sel: string) => { text: string; selStart: number; selEnd: number }) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const { text, selStart, selEnd } = transform(selected);
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + selStart, start + selEnd);
    });
  };

  const wrap = (before: string, after: string, ph: string) =>
    apply((sel) => {
      const body = sel || ph;
      return { text: `${before}${body}${after}`, selStart: before.length, selEnd: before.length + body.length };
    });

  const linePrefix = (prefix: string, ph: string) =>
    apply((sel) => {
      const body = sel || ph;
      const text = body
        .split('\n')
        .map((line) => `${prefix}${line}`)
        .join('\n');
      return { text, selStart: prefix.length, selEnd: text.length };
    });

  const tools: { icon: ReactNode; title: string; run: () => void }[] = [
    { icon: <FaBold />, title: 'Bold', run: () => wrap('**', '**', 'bold text') },
    { icon: <FaItalic />, title: 'Italic', run: () => wrap('_', '_', 'italic text') },
    { icon: <FaHeading />, title: 'Heading', run: () => linePrefix('## ', 'Heading') },
    { icon: <FaQuoteLeft />, title: 'Quote', run: () => linePrefix('> ', 'Quote') },
    { icon: <FaListUl />, title: 'Bullet list', run: () => linePrefix('- ', 'List item') },
    { icon: <FaListOl />, title: 'Numbered list', run: () => linePrefix('1. ', 'List item') },
    { icon: <FaCode />, title: 'Inline code', run: () => wrap('`', '`', 'code') },
    { icon: <FaLink />, title: 'Link', run: () => wrap('[', '](https://)', 'link text') },
    { icon: <FaImage />, title: 'Image', run: () => wrap('![', '](https://)', 'alt text') },
  ];

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
      active ? 'bg-white text-navy-800 border-b-2 border-[#d4a843]' : 'text-gray-500 hover:text-navy-800'
    }`;

  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200 focus-within:border-[#d4a843] transition-colors">
      {/* Tabs + toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 pr-2">
        <div className="flex">
          <button type="button" onClick={() => setTab('write')} className={tabClass(tab === 'write')}>
            <FaPen className="text-xs" /> Write
          </button>
          <button type="button" onClick={() => setTab('preview')} className={tabClass(tab === 'preview')}>
            <FaEye className="text-xs" /> Preview
          </button>
        </div>
        {tab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 py-1">
            {tools.map((tool) => (
              <button
                key={tool.title}
                type="button"
                title={tool.title}
                onClick={tool.run}
                className="flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-navy-900 hover:text-[#d4a843] transition-colors cursor-pointer"
              >
                {tool.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="block w-full resize-y bg-white px-4 py-3 font-mono text-sm leading-6 text-navy-900 placeholder:text-gray-400 focus:outline-none"
        />
      ) : (
        <div className="min-h-[16rem] bg-white px-4 py-4">
          {value.trim() ? (
            <Markdown source={value} />
          ) : (
            <p className="text-sm text-gray-400">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
