import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerProps = {
  label: string;
  date?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
};

export default function DatePicker({
  label,
  date,
  onChange,
  disabled,
}: DatePickerProps) {
  // Generate a unique id for the button and label association
  const id = `date-picker-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex w-full items-center gap-2">
      <label
        className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
        htmlFor={id}
      >
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={label}
            className="min-w-0 flex-1 justify-between"
            disabled={disabled}
            id={id}
            type="button"
            variant="outline"
          >
            {date ? format(date, 'PPP') : 'Pick a date'}
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            captionLayout="dropdown"
            disabled={(d) => d > new Date() || d < new Date('1900-01-01')}
            mode="single"
            onSelect={onChange}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
