'use client';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Controller, type FieldError, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DateInputFieldProps = {
  name: string;
  label: string;
  disabled?: boolean;
};

export default function DateInputField({
  name,
  label,
  disabled = false,
}: DateInputFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div className="flex flex-col gap-1">
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          // Get Date object from string (assume yyyy-MM-dd or "")
          const date =
            typeof field.value === 'string' && field.value
              ? new Date(field.value)
              : undefined;
          // Unique id for accessibility
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
                    disabled={(d) =>
                      d > new Date() || d < new Date('1900-01-01')
                    }
                    mode="single"
                    onSelect={(d) =>
                      field.onChange(d ? format(d, 'yyyy-MM-dd') : '')
                    }
                    // Store as "yyyy-MM-dd" in the form state for consistency
                    selected={date}
                  />
                </PopoverContent>
              </Popover>
            </div>
          );
        }}
      />
      {fieldError?.message && (
        <span className="ml-[130px] text-red-500 text-xs">
          {fieldError.message}
        </span>
      )}
    </div>
  );
}
