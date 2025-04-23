import { useQuery } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import StickyNote from "./StickyNote";
import { Skeleton } from "@/components/ui/skeleton";

interface StickyNoteWallProps {
  onNoteClick: (note: Note) => void;
}

export default function StickyNoteWall({ onNoteClick }: StickyNoteWallProps) {
  const { data: notes, isLoading, error } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });

  // Display loading skeletons while fetching notes
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="min-h-[150px]">
            <Skeleton className="h-[150px] w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  // Display error message if fetching notes fails
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Notes</h2>
        <p className="text-gray-800">
          Unable to load the warm and fuzzy notes. Please try again later.
        </p>
      </div>
    );
  }

  // Display empty state if no notes exist
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center p-8 bg-blue-50 rounded-lg max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">No Warm Fuzzies Yet</h2>
        <p className="text-gray-800">
          Be the first to add a warm and fuzzy note! Click the "Add Warm Fuzzy" button below.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {notes.map(note => (
        <StickyNote key={note.id} note={note} onNoteClick={onNoteClick} />
      ))}
    </div>
  );
}
