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
  
  // Clear all test data on server startup
  await storage.clearAllNotes();
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

  const httpServer = createServer(app);
  return httpServer;
}
