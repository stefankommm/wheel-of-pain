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
    const currentItems = parseQuestions(text, items);
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
    const newItems = parseQuestions(newText, items);
    onChange(newItems);
  };

  const itemCount = text.split('\n').filter((line) => line.trim()).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <Textarea
        placeholder="Enter questions, one per line..."
        value={text}
        onChange={handleChange}
        className="flex-1 min-h-[100px] font-mono text-sm bg-[#111] border-[#2a2a2a] text-white placeholder:text-[#444] focus:border-[#444] rounded-lg resize-none"
      />
      <div className="flex justify-between text-xs text-[#666] mt-2 shrink-0">
        <span>One per line</span>
        <span>{itemCount} questions</span>
      </div>
    </div>
  );
}
