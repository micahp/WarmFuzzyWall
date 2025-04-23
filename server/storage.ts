import { notes, type Note, type InsertNote } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNotesPaginated(page: number, limit: number): Promise<{ notes: Note[], totalCount: number }>;
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

  async getNotesPaginated(page: number, limit: number): Promise<{ notes: Note[], totalCount: number }> {
    const offset = (page - 1) * limit;
    
    // Get paginated notes sorted by creation date, newest first
    const notesResult = await db.select()
      .from(notes)
      .orderBy(desc(notes.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(notes);
    
    return {
      notes: notesResult,
      totalCount: Number(totalCount)
    };
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
        recipient: "Alex Johnson",
        color: "sticky-yellow",
        daysAgo: 0
      },
      {
        message: "Thanks for helping me debug that issue yesterday. You're always so patient and willing to share your knowledge.",
        author: "Michael",
        recipient: "Taylor Smith",
        color: "sticky-blue",
        daysAgo: 0
      },
      {
        message: "You always bring such positive energy to our team meetings. It makes a huge difference to the whole group dynamic!",
        author: "Sarah",
        recipient: "Jamie Rodriguez",
        color: "sticky-pink",
        daysAgo: 1
      },
      {
        message: "I admire how you always volunteer to take on new challenges. Your courage inspires me to step out of my comfort zone too.",
        author: "Anonymous",
        recipient: "Sam Wilson",
        color: "sticky-green",
        daysAgo: 1
      },
      {
        message: "The design work you did on our project was absolutely stunning. You have a real eye for detail!",
        author: "Carlos",
        recipient: "Riley Chen",
        color: "sticky-purple",
        daysAgo: 2
      },
      {
        message: "I wanted to let you know that your hard work doesn't go unnoticed. You're a vital part of our team's success.",
        author: "Jamie",
        recipient: "Jordan Lee",
        color: "sticky-orange",
        daysAgo: 3
      },
      {
        message: "Your problem-solving skills are amazing. You found a solution that none of us could see!",
        author: "Taylor",
        recipient: "Morgan Kim",
        color: "sticky-teal",
        daysAgo: 4
      },
      {
        message: "I really appreciate how you always take time to explain things to newcomers. You're making our onboarding so much better!",
        author: "Anonymous",
        recipient: "Robin Patel",
        color: "sticky-yellow",
        daysAgo: 5
      },
      {
        message: "The way you handled that tough situation with our client was so professional. I learned a lot from watching you navigate that conversation.",
        author: "Alex",
        recipient: "Casey Williams",
        color: "sticky-pink",
        daysAgo: 6
      },
      {
        message: "Your attention to detail saved us from a major issue in production. Thank you for being so thorough!",
        author: "Robin",
        recipient: "Michael Brown",
        color: "sticky-blue",
        daysAgo: 7
      },
      {
        message: "I just wanted to say that you're doing an incredible job, and I'm grateful to have you on our team.",
        author: "Jordan",
        recipient: "Sarah Davis",
        color: "sticky-green",
        daysAgo: 8
      },
      {
        message: "The ideas you shared in the brainstorming session were so creative and innovative. You really got us all thinking outside the box!",
        author: "Casey",
        recipient: "Carlos Martinez",
        color: "sticky-purple",
        daysAgo: 9
      },
      // Add more test data to demonstrate pagination
      {
        message: "I love how you always bring cookies to our team meetings. You make Mondays so much better!",
        author: "Riley",
        recipient: "Lisa Thompson",
        color: "sticky-pink",
        daysAgo: 2
      },
      {
        message: "Thank you for covering for me last week. You're a lifesaver and I really appreciate it!",
        author: "Sam",
        recipient: "Alex Johnson",
        color: "sticky-yellow",
        daysAgo: 3
      },
      {
        message: "The way you handled that difficult client with patience and professionalism was truly impressive.",
        author: "Morgan",
        recipient: "Taylor Smith",
        color: "sticky-blue",
        daysAgo: 4
      },
      {
        message: "Your positivity during our crunch time kept the whole team motivated. Thank you!",
        author: "Anonymous",
        recipient: "Jamie Rodriguez",
        color: "sticky-green",
        daysAgo: 5
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
        recipient: testData.recipient,
        color: testData.color,
        createdAt: date
      });
    }
  }
}

export const storage = new DatabaseStorage();
