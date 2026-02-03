import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsAfterStartDate', async: false })
export class IsAfterStartDate implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments): boolean {
    const [startDateField] = args.constraints;
    const startDate = (args.object as any)[startDateField];
    
    if (!startDate || !endDate) {
      return true; // Let @IsISO8601 handle presence validation
    }
    
    return new Date(endDate) >= new Date(startDate);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'endDate must be greater than or equal to startDate';
  }
}
