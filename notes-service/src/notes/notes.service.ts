import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

type Note = { id: string; userId: string; text: string };

@Injectable()
export class NotesService {
  // private notes: Note[] = [];

  // create(userId: string, text: string) {
  //   const note: Note = { id: String(Date.now()), userId, text };
  //   this.notes.push(note);
  //   return note;
  // }

  // list(userId: string) {
  //   return this.notes.filter(n => n.userId === userId);
  // }


  constructor(private readonly db: DbService) { }

  async createNote(userId: string, text: string) {
    const result = await this.db.query(
      `INSERT INTO "notes"(user_id, text)
       VALUES ($1::uuid, $2)
       RETURNING id, user_id, text, created_at`,
      [userId, text],
    )
    return result.rows[0];
  }

  async getNotes(userId: string) {
    const result = await this.db.query(
      `SELECT id, user_id, text, created_at
       FROM "notes"
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC`,
      [userId],
    )
    return result.rows;
  }

}
