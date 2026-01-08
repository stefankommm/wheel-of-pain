import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { WheelItem } from '@/types/wheel';

interface QuestionModalProps {
  item: WheelItem | null;
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onKeep: () => void;
}

export function QuestionModal({
  item,
  open,
  onClose,
  onRemove,
  onKeep,
}: QuestionModalProps) {
  if (!item) return null;

  const handleRemove = () => {
    onRemove(item.id);
    onClose();
  };

  const handleKeep = () => {
    onKeep();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Your Task</DialogTitle>
          <DialogDescription className="sr-only">
            The wheel has selected a task for you
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center">
          <p className="text-[#888] text-lg mb-3">Great, now the task is to</p>
          <div
            className="text-2xl font-bold p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: `${item.color}15`,
              borderColor: item.color,
            }}
          >
            {item.question}
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleKeep}
            className="flex-1 bg-[#222] border-[#333] text-white hover:bg-[#2a2a2a] hover:text-white"
          >
            Keep on Wheel
          </Button>
          <Button
            onClick={handleRemove}
            className="flex-1 bg-[#e74c3c] text-white font-semibold hover:bg-[#c0392b]"
          >
            Done! Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
