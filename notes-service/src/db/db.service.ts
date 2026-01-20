import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Pool, QueryResultRow } from 'pg'
import 'dotenv/config'


@Injectable()
export class DbService implements OnModuleDestroy{
  private pool: Pool
  
  constructor(){
    if(!process.env.DATABASE_URL){
      throw new Error("DATABASE_URL is missing.")
    }
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL});
  }

  query<T extends QueryResultRow = any>(text:string, params?:any[]){
    return this.pool.query<T>(text,params);
  }
  async onModuleDestroy() {
      await this.pool.end();
  }

}