'use client';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderLine = (line: string, index: number): JSX.Element => {
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-bold mb-4 mt-6">{processInlineMarkdown(line.substring(2))}</h1>;
    }

    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mb-3 mt-5">{processInlineMarkdown(line.substring(3))}</h2>;
    }

    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-semibold mb-2 mt-4">{processInlineMarkdown(line.substring(4))}</h3>;
    }

    if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <li key={index} className="ml-6 mb-2 list-decimal">
          {processInlineMarkdown(content)}
        </li>
      );
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.substring(2);
      return (
        <li key={index} className="ml-6 mb-2 list-disc">
          {processInlineMarkdown(content)}
        </li>
      );
    }

    if (line.startsWith('> ')) {
      return (
        <blockquote key={index} className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-3">
          {processInlineMarkdown(line.substring(2))}
        </blockquote>
      );
    }

    if (line.startsWith('~~') && line.endsWith('~~')) {
      return (
        <p key={index} className="mb-3">
          {processInlineMarkdown(line)}
        </p>
      );
    }

    if (line.trim() === '') {
      return <div key={index} className="h-3" />;
    }

    return <p key={index} className="mb-3 leading-relaxed">{processInlineMarkdown(line)}</p>;
  };

  const processInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    const patterns = [
      { regex: /\*\*\*(.*?)\*\*\*/g, render: (match: string) => <strong key={key++} className="font-bold italic">{match}</strong> },
      { regex: /\*\*(.*?)\*\*/g, render: (match: string) => <strong key={key++} className="font-bold">{match}</strong> },
      { regex: /\*(.*?)\*/g, render: (match: string) => <em key={key++} className="italic">{match}</em> },
      { regex: /~~(.*?)~~/g, render: (match: string) => <del key={key++} className="line-through opacity-70">{match}</del> },
      { regex: /`(.*?)`/g, render: (match: string) => <code key={key++} className="bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">{match}</code> },
    ];

    const allMatches: Array<{ index: number; length: number; fullMatch: string; content: string; type: number }> = [];

    patterns.forEach((pattern, typeIndex) => {
      const regex = new RegExp(pattern.regex.source, 'g');
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index !== undefined) {
          allMatches.push({
            index: match.index,
            length: match[0].length,
            fullMatch: match[0],
            content: match[1],
            type: typeIndex
          });
        }
      }
    });

    allMatches.sort((a, b) => a.index - b.index);

    const processedRanges: Array<{ start: number; end: number }> = [];

    allMatches.forEach(match => {
      const isOverlapping = processedRanges.some(
        range => match.index < range.end && match.index + match.length > range.start
      );

      if (!isOverlapping) {
        if (match.index > currentIndex) {
          parts.push(text.substring(currentIndex, match.index));
        }

        parts.push(patterns[match.type].render(match.content));
        currentIndex = match.index + match.length;

        processedRanges.push({
          start: match.index,
          end: match.index + match.length
        });
      }
    });

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const lines = content.split('\n');

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
}
