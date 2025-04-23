import { useState } from "react";
import StickyNoteWall from "@/components/StickyNoteWall";
import AddNoteButton from "@/components/AddNoteButton";
import AddNoteModal from "@/components/AddNoteModal";
import ViewNoteModal from "@/components/ViewNoteModal";
import { Note } from "@shared/schema";
import { motion } from "framer-motion";

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleAddNote = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {/* Header Section */}
      <header className="text-center mb-8">
        <motion.h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-800" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>Warm and Fuzzies Wall</motion.h1>
        <motion.p className="text-base text-gray-600 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          We had a warm fuzzy wall at our annual Posse Plus Retreat at UT to share positive messages and compliments with our peers. I thought it would be nice to create a digital version.
        </motion.p>
        <motion.p className="text-lg font-bold text-gray-700 max-w-2xl mx-auto mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          Today's topic: Micah Turns 30! 🥳
        </motion.p>
      </header>
      
      {/* Sticky Notes Wall */}
      <StickyNoteWall onNoteClick={handleNoteClick} />
      
      {/* Add Button */}
      <AddNoteButton onClick={handleAddNote} />
      
      {/* Modals */}
      <AddNoteModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} />
      <ViewNoteModal note={selectedNote} isOpen={isViewModalOpen} onClose={handleCloseViewModal} />
    </div>
  );
}
