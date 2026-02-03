import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideLeaveDto {
  @ApiProperty({
    enum: ['APPROVED', 'REJECTED'],
    example: 'APPROVED',
    description: 'Decision on the leave request',
  })
  @IsIn(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    example: 'Enjoy your time off',
    maxLength: 500,
    description: 'Optional note for the decision',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
