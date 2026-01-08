import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SpinSpeed } from '@/types/wheel';

interface SpeedSelectorProps {
  value: SpinSpeed;
  onChange: (speed: SpinSpeed) => void;
}

export function SpeedSelector({ value, onChange }: SpeedSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[#666]">Speed</span>
      <Select value={value} onValueChange={(v) => onChange(v as SpinSpeed)}>
        <SelectTrigger className="w-[110px] bg-[#222] border-[#333] text-white hover:bg-[#2a2a2a] focus:ring-[#444] focus:border-[#444]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-[#333]">
          <SelectItem value="slow" className="text-[#ccc] focus:bg-[#2a2a2a] focus:text-white">
            Slow
          </SelectItem>
          <SelectItem value="medium" className="text-[#ccc] focus:bg-[#2a2a2a] focus:text-white">
            Medium
          </SelectItem>
          <SelectItem value="fast" className="text-[#ccc] focus:bg-[#2a2a2a] focus:text-white">
            Fast
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
