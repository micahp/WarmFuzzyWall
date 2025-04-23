import { Note } from "@shared/schema";
import { useCallback } from "react";
import { formatNoteDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { getColorClass } from "@/lib/colors";

interface StickyNoteProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  animation?: boolean;
}

export default function StickyNote({ note, onNoteClick, animation = false }: StickyNoteProps) {
  // Generate a random rotation between -5 and 5 degrees
  const rotation = note.id ? (note.id % 10) - 5 : Math.floor(Math.random() * 10) - 5;
  
  const colorClass = getColorClass(note.color);
  
  const handleClick = useCallback(() => {
    onNoteClick(note);
  }, [note, onNoteClick]);

  return (
    <motion.div
      className={`sticky-note ${colorClass} relative ${animation ? 'add-animation' : ''}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={handleClick}
      initial={animation ? { opacity: 0, y: 40 } : undefined}
      animate={animation ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {note.recipient && (
        <div className="absolute top-2 right-3 text-sm text-gray-600">
          To: {note.recipient}
        </div>
      )}
      <div className={`note-content text-lg leading-relaxed text-gray-800 ${note.recipient ? 'mt-4' : ''}`}>
        <p>{note.message}</p>
      </div>
      <div className="mt-4 text-sm text-gray-700 flex justify-between items-end">
        <span className="italic">- {note.author}</span>
        <span className="text-xs">{formatNoteDate(note.createdAt)}</span>
      </div>
      <div className="folded-corner"></div>
    </motion.div>
  );
}
