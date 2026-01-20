import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { dbModuel } from './db/db.module';

@Module({
  imports: [AuthModule, dbModuel],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
