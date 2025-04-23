import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Note } from "@shared/schema";
import { formatDetailDate } from "@/lib/utils";
import { getColorClass } from "@/lib/colors";

interface ViewNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewNoteModal({ note, isOpen, onClose }: ViewNoteModalProps) {
  if (!note) return null;

  const colorClass = getColorClass(note.color);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Warm Fuzzy Note</DialogTitle>
        </DialogHeader>
        
        <div className={`sticky-note ${colorClass} relative p-6`} style={{ transform: 'none', minHeight: '200px' }}>
          {note.recipient && (
            <div className="absolute top-2 right-3 text-sm font-medium text-gray-600">
              To: {note.recipient}
            </div>
          )}
          <div className={`note-content text-xl leading-relaxed text-gray-800 ${note.recipient ? 'mt-5' : ''}`}>
            <p>{note.message}</p>
          </div>
          <div className="mt-6 text-sm text-gray-700 flex justify-between items-end">
            <span className="italic text-base">- {note.author}</span>
            <span className="text-sm">{formatDetailDate(note.createdAt)}</span>
          </div>
          <div className="folded-corner"></div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
