import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthProxyController } from './auth-proxy/auth-proxy.controller';
import { NotesProxyController } from './notes-proxy/notes-proxy.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true})],
  controllers: [AppController, AuthProxyController, NotesProxyController],
  providers: [AppService],
})
export class AppModule {}
