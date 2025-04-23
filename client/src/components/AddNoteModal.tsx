import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { InsertNote } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatNoteDate, getCurrentDateFormatted } from "@/lib/utils";
import { STICKY_COLORS, getColorClass } from "@/lib/colors";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNoteModal({ isOpen, onClose }: AddNoteModalProps) {
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0].value);
  const { toast } = useToast();

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: InsertNote) => {
      const response = await apiRequest("POST", "/api/notes", newNote);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Success!",
        description: "Your warm fuzzy note was added to the wall.",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add your note: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setMessage("");
    setAuthor("");
    setSelectedColor(STICKY_COLORS[0].value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message for your warm fuzzy note.",
        variant: "destructive",
      });
      return;
    }

    const newNote: InsertNote = {
      message: message.trim(),
      author: author.trim() || "Anonymous",
      color: selectedColor,
    };

    createNoteMutation.mutate(newNote);
  };

  const colorClass = getColorClass(selectedColor);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add a Warm Fuzzy</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="note-message">Your message:</Label>
            <Textarea
              id="note-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your warm and fuzzy message here..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Choose a color:</Label>
            <div className="flex flex-wrap gap-2">
              {STICKY_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full ${getColorClass(color.value)} hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 ${
                    selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedColor(color.value)}
                  aria-label={`Select ${color.label} color`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-author">Your name (optional):</Label>
            <Input
              id="note-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Leave blank to remain anonymous"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview:</h3>
            <div className={`sticky-note ${colorClass} relative`} style={{ transform: 'rotate(-2deg)' }}>
              <div className="note-content text-lg leading-relaxed text-gray-800">
                <p>{message || "Your warm and fuzzy message will appear here..."}</p>
              </div>
              <div className="mt-4 text-sm text-gray-700 flex justify-between items-end">
                <span className="italic">- {author || "Anonymous"}</span>
                <span className="text-xs">{getCurrentDateFormatted()}</span>
              </div>
              <div className="folded-corner"></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
