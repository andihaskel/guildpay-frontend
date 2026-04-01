'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  'Frequently Used': ['✨', '🎯', '💡', '🚀', '⚡', '🔥', '💎', '🎨', '🎵', '📱', '💻', '🌟', '💪', '👍', '❤️', '🎉'],
  'Symbols': ['✅', '❌', '⭐', '💫', '🔔', '🔒', '🔓', '🔑', '💰', '💵', '📊', '📈', '📉', '🎯', '🏆', '🥇'],
  'Communication': ['💬', '💭', '🗨️', '🗯️', '💌', '📧', '📨', '📩', '📤', '📥', '📮', '📬', '📭', '📪', '📫', '✉️'],
  'Technology': ['💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💾', '💿', '📀', '📱', '☎️', '📞', '📟', '📠', '📡', '🔋'],
  'People': ['👤', '👥', '👨', '👩', '👶', '👧', '👦', '🧑', '👴', '👵', '🙋', '🙌', '👏', '🤝', '👍', '👎'],
  'Nature': ['🌟', '⭐', '🌙', '☀️', '⛅', '🌈', '🌊', '🔥', '💧', '🌸', '🌺', '🌻', '🌹', '🌷', '🌿', '🍀']
};

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-16 h-10 text-xl bg-slate-900/50 border-slate-600 hover:bg-slate-800/50 p-0"
        >
          {value || '😀'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-slate-900 border-slate-700" align="start">
        <div className="max-h-96 overflow-y-auto p-3">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 px-1">{category}</h4>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-800 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
