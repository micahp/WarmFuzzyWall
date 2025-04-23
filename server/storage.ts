import { notes, type Note, type InsertNote } from "@shared/schema";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
}

export class MemStorage implements IStorage {
  private notes: Map<number, Note>;
  private currentId: number;

  constructor() {
    this.notes = new Map();
    this.currentId = 1;
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id, 
      createdAt: now 
    };
    this.notes.set(id, note);
    return note;
  }
}

export const storage = new MemStorage();
