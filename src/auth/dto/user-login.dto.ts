import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDTO {
  @ApiProperty({
    description: 'The email of User',
    example: 'admin@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of User',
    example: 'Admin123!',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
