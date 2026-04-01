'use client';

import { useState, useRef } from 'react';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Link as LinkIcon, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [headingLevel, setHeadingLevel] = useState('normal');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const actualSuffix = suffix !== undefined ? suffix : prefix;
    const newText = beforeText + prefix + selectedText + actualSuffix + afterText;
    const newCursorPos = start + prefix.length + selectedText.length + actualSuffix.length;

    onChange(newText);

    setTimeout(() => {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const applyHeading = (level: string) => {
    setHeadingLevel(level);
    if (level === 'normal') return;

    const prefix = level === 'h1' ? '# ' : level === 'h2' ? '## ' : level === 'h3' ? '### ' : '';
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const beforeText = value.substring(0, lineStart);
    const afterText = value.substring(lineStart);

    onChange(beforeText + prefix + afterText);
  };

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50">
      <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-slate-900/50 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('**')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('*')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('~~')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('`')}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('- ', '')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('1. ', '')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('> ', '')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('[', '](url)')}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <Select value={headingLevel} onValueChange={applyHeading}>
          <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Heading" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Welcome to Testandi! 👋

Dive into a vibrant community dedicated to the world of art! Testandi is all about connection, inspiration, and creativity. Here's what makes us special:

• Passionate Artists Unite: Furthers your artistic journey alongside like-minded individuals who share your love for creativity.
• Diverse Art Forms: Explore various genres including painting, digital art, sculpture, and beyond!
• Showcase Your Work: A supportive environment for sharing and receiving feedback on your creations."
        className="min-h-[400px] border-0 rounded-none resize-none focus-visible:ring-0 bg-slate-800/30 text-base leading-relaxed"
      />
    </div>
  );
}
