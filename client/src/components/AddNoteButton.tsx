import { PlusIcon } from "lucide-react";

interface AddNoteButtonProps {
  onClick: () => void;
}

export default function AddNoteButton({ onClick }: AddNoteButtonProps) {
  return (
    <div className="fixed bottom-8 right-8">
      <button 
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition duration-300 flex items-center justify-center"
        aria-label="Add a new warm fuzzy note"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        <span className="font-medium">Add Warm Fuzzy</span>
      </button>
    </div>
  );
}
