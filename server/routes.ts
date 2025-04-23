import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the Open Graph image directly
  app.get('/og-image.png', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/og-image.png'));
  });
  
  // We no longer clear notes on startup to preserve data between deployments
  // await storage.clearAllNotes();
  // Get notes with pagination
  app.get("/api/notes", async (req: Request, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      const { notes, totalCount } = await storage.getNotesPaginated(page, limit);
      
      res.json({
        notes,
        page,
        limit,
        totalCount,
        hasMore: page * limit < totalCount
      });
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Get note by id
  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  // Create a new note
  app.post("/api/notes", async (req, res) => {
    try {
      const parseResult = insertNoteSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const errorMessage = fromZodError(parseResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      const newNote = await storage.createNote(parseResult.data);
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Enable test mode with sample data
  app.post("/api/test-mode/enable", async (_req, res) => {
    try {
      await storage.loadTestData();
      res.json({ success: true, testMode: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to enable test mode" });
    }
  });

  // Disable test mode and clear sample data
  app.post("/api/test-mode/disable", async (_req, res) => {
    try {
      await storage.clearAllNotes();
      res.json({ success: true, testMode: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to disable test mode" });
    }
  });

  // Check test mode status
  app.get("/api/test-mode/status", (_req, res) => {
    try {
      const isTestMode = storage.isTestMode();
      res.json({ testMode: isTestMode });
    } catch (error) {
      res.status(500).json({ message: "Failed to get test mode status" });
    }
  });
  
  // Export all notes (for database backup/transfer)
  app.get("/api/notes/export", async (_req, res) => {
    try {
      const allNotes = await storage.getNotes();
      res.json({ notes: allNotes });
    } catch (error) {
      console.error("Error exporting notes:", error);
      res.status(500).json({ message: "Failed to export notes" });
    }
  });
  
  // Import notes (for database restore/transfer)
  app.post("/api/notes/import", async (req, res) => {
    try {
      const { notes: notesToImport, clearExisting } = req.body;
      
      if (!Array.isArray(notesToImport)) {
        return res.status(400).json({ message: "Notes must be an array" });
      }
      
      // Optionally clear existing notes first
      if (clearExisting) {
        await storage.clearAllNotes();
      }
      
      // Import all notes
      for (const note of notesToImport) {
        // Strip the ID to avoid conflicts
        const { id, createdAt, ...noteData } = note;
        
        // Keep the original creation date if provided
        const insertData = {
          ...noteData,
          ...(createdAt && { createdAt: new Date(createdAt) })
        };
        
        await storage.createNote(insertData);
      }
      
      res.json({ 
        success: true, 
        message: `Imported ${notesToImport.length} notes successfully` 
      });
    } catch (error) {
      console.error("Error importing notes:", error);
      res.status(500).json({ message: "Failed to import notes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
