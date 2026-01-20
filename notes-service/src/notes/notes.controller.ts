// import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
// import { JwtGuard } from 'src/auth/guards/jwt.guard';
// import { NotesService } from './notes.service';

// @Controller('notes')
// @UseGuards(JwtGuard)
// export class NotesController {
//   constructor(private readonly notesService: NotesService) { }

//   @Post()
//   create(@Body() body: { userId: string, text: string }) {
//     return this.notesService.createNote(body.userId, body.text);
//   }

//   @Get()
//   list(@Query('userId') userId: string) {
//     return this.notesService.getNotes(userId);
//   }

// }


import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('notes')
@UseGuards(JwtGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Post()
  // create(@Body() body: { text: string }, @Req() req: any) {
  create(@Body() dto: CreateNoteDto, @Req() req: any) {
    const text = dto.text?.trim();
    if (!text) throw new BadRequestException('text cannot be empty');

    return this.notesService.createNote(req.user.sub, text);
  }

  @Get()
  list(@Req() req: any) {
    return this.notesService.getNotes(req.user.sub);
  }
}
