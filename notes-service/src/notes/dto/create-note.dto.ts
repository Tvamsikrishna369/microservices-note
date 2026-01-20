import {IsNotEmpty, IsString, MaxLength, MinLength} from 'class-validator';

export class CreateNoteDto{
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @MinLength(5)
  text: string;
}