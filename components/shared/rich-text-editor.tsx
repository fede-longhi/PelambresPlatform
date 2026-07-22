'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Color,
  FontSize,
  TextStyle,
} from '@tiptap/extension-text-style';
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type RichTextEditorProps = {
  name: string;
  label?: string;
  initialHtml?: string;
  disabled?: boolean;
  errorId?: string;
  className?: string;
  minHeightClassName?: string;
};

const FONT_SIZE_OPTIONS = [
  { value: '', label: 'Tamaño' },
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
] as const;

const COLOR_PRESETS = [
  '#0f172a',
  '#475569',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#2563eb',
  '#7c3aed',
] as const;

function isEmptyHtml(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length === 0;
}

export function RichTextEditor({
  name,
  label = 'Descripción',
  initialHtml = '',
  disabled,
  errorId,
  className,
  minHeightClassName = 'min-h-[180px]',
}: RichTextEditorProps) {
  const startingContent =
    initialHtml && !isEmptyHtml(initialHtml) ? initialHtml : '<p></p>';
  const [htmlContent, setHtmlContent] = useState(() =>
    isEmptyHtml(startingContent) ? '' : startingContent
  );
  const [, setToolbarTick] = useState(0);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize],
    content: startingContent,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          'w-full bg-white px-3 py-2 text-sm outline-none max-w-none',
          minHeightClassName,
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-base [&_h2]:font-semibold'
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      setHtmlContent(isEmptyHtml(html) ? '' : html);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const refreshToolbar = () => setToolbarTick((tick) => tick + 1);
    editor.on('selectionUpdate', refreshToolbar);
    editor.on('transaction', refreshToolbar);

    return () => {
      editor.off('selectionUpdate', refreshToolbar);
      editor.off('transaction', refreshToolbar);
    };
  }, [editor]);

  const currentFontSize =
    (editor?.getAttributes('textStyle').fontSize as string | undefined) ?? '';
  const currentColor =
    (editor?.getAttributes('textStyle').color as string | undefined) ?? '#0f172a';

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label>{label}</Label> : null}
      <input type="hidden" name={name} value={htmlContent} />

      <div
        className={cn(
          'overflow-hidden rounded-md border border-slate-200 bg-white transition',
          'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary'
        )}
      >
        {editor ? (
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-1.5 py-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor.isActive('bold') && 'bg-slate-200')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled}
              aria-label="Negrita"
            >
              <Bold size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                editor.isActive('italic') && 'bg-slate-200'
              )}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled}
              aria-label="Cursiva"
            >
              <Italic size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                editor.isActive('heading', { level: 2 }) && 'bg-slate-200'
              )}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              disabled={disabled}
              aria-label="Título"
            >
              <Heading2 size={16} aria-hidden="true" />
            </Button>

            <div className="mx-0.5 h-6 w-px self-center bg-slate-200" />

            <label className="sr-only" htmlFor={`${name}-font-size`}>
              Tamaño de letra
            </label>
            <select
              id={`${name}-font-size`}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              value={currentFontSize}
              disabled={disabled}
              onChange={(event) => {
                const nextSize = event.target.value;
                if (!nextSize) {
                  editor.chain().focus().unsetFontSize().run();
                  return;
                }
                editor.chain().focus().setFontSize(nextSize).run();
              }}
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5">
              <label className="sr-only" htmlFor={`${name}-font-color`}>
                Color de fuente
              </label>
              <input
                id={`${name}-font-color`}
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(currentColor) ? currentColor : '#0f172a'}
                disabled={disabled}
                onChange={(event) => {
                  editor.chain().focus().setColor(event.target.value).run();
                }}
                className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                title="Color de fuente"
              />
              <div className="flex items-center gap-0.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={disabled}
                    aria-label={`Color ${preset}`}
                    onClick={() => editor.chain().focus().setColor(preset).run()}
                    className={cn(
                      'size-4 rounded-full border border-slate-200 transition hover:scale-110 disabled:opacity-50',
                      currentColor.toLowerCase() === preset.toLowerCase() &&
                        'ring-2 ring-primary ring-offset-1'
                    )}
                    style={{ backgroundColor: preset }}
                  />
                ))}
              </div>
            </div>

            <div className="mx-0.5 h-6 w-px self-center bg-slate-200" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                editor.isActive('bulletList') && 'bg-slate-200'
              )}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled}
              aria-label="Lista"
            >
              <List size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                editor.isActive('orderedList') && 'bg-slate-200'
              )}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled}
              aria-label="Lista numerada"
            >
              <ListOrdered size={16} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
              onClick={() => {
                editor.chain().focus().clearContent().run();
                setHtmlContent('');
              }}
              disabled={disabled}
              aria-label="Limpiar"
            >
              <RotateCcw size={14} aria-hidden="true" />
            </Button>
          </div>
        ) : null}

        <EditorContent editor={editor} aria-describedby={errorId} />
      </div>
    </div>
  );
}
