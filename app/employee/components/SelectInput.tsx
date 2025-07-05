'use client';
import { Controller, type FieldError, useFormContext } from 'react-hook-form';
import Select from 'react-select';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectInputFieldProps = {
  name: string;
  label: string;
  options: SelectOption[];
  isDisabled?: boolean;
  placeholder?: string;
};

export default function SelectInputField({
  name,
  label,
  options,
  isDisabled = false,
  placeholder,
}: SelectInputFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name] as FieldError | undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <label
          className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
          htmlFor={name}
        >
          {label}
        </label>
        <div className="min-w-0 flex-1">
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                inputId={name}
                isClearable
                isDisabled={isDisabled}
                onChange={(opt) =>
                  field.onChange(opt ? (opt as SelectOption).value : '')
                }
                options={options}
                placeholder={placeholder || `Select ${label}`}
                styles={{
                  container: (base) => ({ ...base, width: '100%' }),
                }}
                value={options.find((opt) => opt.value === field.value) ?? null}
              />
            )}
          />
        </div>
      </div>
      {fieldError?.message && (
        <span className="ml-[130px] text-red-500 text-xs">
          {fieldError.message}
        </span>
      )}
    </div>
  );
}
