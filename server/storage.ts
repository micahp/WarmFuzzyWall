import { notes, type Note, type InsertNote } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  loadTestData(): Promise<void>;
  clearAllNotes(): Promise<void>;
  isTestMode(): boolean;
}

export class DatabaseStorage implements IStorage {
  private testMode: boolean;

  constructor() {
    this.testMode = false;
  }

  async getNotes(): Promise<Note[]> {
    // Get all notes sorted by creation date, newest first
    return await db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    const result = await db.select().from(notes).where(eq(notes.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    // Ensure author is set to "Anonymous" if not provided
    const noteToInsert = {
      ...insertNote,
      author: insertNote.author || "Anonymous"
    };
    
    const [newNote] = await db.insert(notes).values(noteToInsert).returning();
    return newNote;
  }

  isTestMode(): boolean {
    return this.testMode;
  }

  async clearAllNotes(): Promise<void> {
    await db.delete(notes);
    this.testMode = false;
  }

  async loadTestData(): Promise<void> {
    this.testMode = true;
    await this.clearAllNotes();
    
    const testMessages = [
      {
        message: "Your presentation today was amazing! You explained complex concepts so clearly that even I could understand them. Keep up the great work!",
        author: "Lisa",
        color: "sticky-yellow",
        daysAgo: 0
      },
      {
        message: "Thanks for helping me debug that issue yesterday. You're always so patient and willing to share your knowledge.",
        author: "Michael",
        color: "sticky-blue",
        daysAgo: 0
      },
      {
        message: "You always bring such positive energy to our team meetings. It makes a huge difference to the whole group dynamic!",
        author: "Sarah",
        color: "sticky-pink",
        daysAgo: 1
      },
      {
        message: "I admire how you always volunteer to take on new challenges. Your courage inspires me to step out of my comfort zone too.",
        author: "Anonymous",
        color: "sticky-green",
        daysAgo: 1
      },
      {
        message: "The design work you did on our project was absolutely stunning. You have a real eye for detail!",
        author: "Carlos",
        color: "sticky-purple",
        daysAgo: 2
      },
      {
        message: "I wanted to let you know that your hard work doesn't go unnoticed. You're a vital part of our team's success.",
        author: "Jamie",
        color: "sticky-orange",
        daysAgo: 3
      },
      {
        message: "Your problem-solving skills are amazing. You found a solution that none of us could see!",
        author: "Taylor",
        color: "sticky-teal",
        daysAgo: 4
      },
      {
        message: "I really appreciate how you always take time to explain things to newcomers. You're making our onboarding so much better!",
        author: "Anonymous",
        color: "sticky-yellow",
        daysAgo: 5
      },
      {
        message: "The way you handled that tough situation with our client was so professional. I learned a lot from watching you navigate that conversation.",
        author: "Alex",
        color: "sticky-pink",
        daysAgo: 6
      },
      {
        message: "Your attention to detail saved us from a major issue in production. Thank you for being so thorough!",
        author: "Robin",
        color: "sticky-blue",
        daysAgo: 7
      },
      {
        message: "I just wanted to say that you're doing an incredible job, and I'm grateful to have you on our team.",
        author: "Jordan",
        color: "sticky-green",
        daysAgo: 8
      },
      {
        message: "The ideas you shared in the brainstorming session were so creative and innovative. You really got us all thinking outside the box!",
        author: "Casey",
        color: "sticky-purple",
        daysAgo: 9
      }
    ];

    // Insert test notes with dates distributed over the past days
    for (const testData of testMessages) {
      const date = new Date();
      date.setDate(date.getDate() - testData.daysAgo);
      
      // Add some hour variation so notes from the same day have different timestamps
      date.setHours(date.getHours() - Math.floor(Math.random() * 8));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      await db.insert(notes).values({
        message: testData.message,
        author: testData.author,
        color: testData.color,
        createdAt: date
      });
    }
  }
}

export const storage = new DatabaseStorage();
