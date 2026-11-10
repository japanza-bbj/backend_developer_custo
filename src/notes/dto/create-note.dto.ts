import { IsNotEmpty, IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  is_pinned?: boolean = false;
}