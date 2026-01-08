import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { WheelItem } from '@/types/wheel';
import { parseQuestions } from '@/lib/wheelUtils';

interface ItemEditorProps {
  items: WheelItem[];
  onChange: (items: WheelItem[]) => void;
}

export function ItemEditor({ items, onChange }: ItemEditorProps) {
  const [text, setText] = useState(() =>
    items.map((item) => item.question).join('\n')
  );
  const isExternalUpdate = useRef(false);

  useEffect(() => {
    const externalText = items.map((item) => item.question).join('\n');
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }
    const currentItems = parseQuestions(text);
    const currentIds = currentItems.map((i) => i.question).sort().join('|');
    const externalIds = items.map((i) => i.question).sort().join('|');
    if (currentIds !== externalIds) {
      setText(externalText);
    }
  }, [items, text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    isExternalUpdate.current = true;
    const newItems = parseQuestions(newText);
    onChange(newItems);
  };

  const itemCount = text.split('\n').filter((line) => line.trim()).length;

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Enter questions, one per line..."
        value={text}
        onChange={handleChange}
        className="min-h-[250px] font-mono text-sm bg-[#111] border-[#2a2a2a] text-white placeholder:text-[#444] focus:border-[#444] rounded-lg resize-y"
      />
      <div className="flex justify-between text-xs text-[#666]">
        <span>One per line</span>
        <span>{itemCount} questions</span>
      </div>
    </div>
  );
}
