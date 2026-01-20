import { OnModuleDestroy, Injectable } from "@nestjs/common";
import { Pool, QueryResultRow } from "pg";
import 'dotenv/config'

@Injectable()

export class DbService implements OnModuleDestroy {

  private pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]) {
    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}