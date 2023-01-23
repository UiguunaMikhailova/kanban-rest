import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class UpdateBoardDto {
  @ApiProperty({ example: 'Homework tasks', description: 'Board title' })
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @ApiProperty({ example: 'My board tasks', description: 'Board description' })
  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @ApiProperty({
    example: '[{id: "1", login: "Jane"}, {id: "2", login: "John"}]',
    description: 'Users, this board shared with',
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => String)
  readonly sharedWith?: string[];
}
