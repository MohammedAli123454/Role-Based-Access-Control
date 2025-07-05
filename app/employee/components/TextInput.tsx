'use client';
import { type FieldError, useFormContext } from 'react-hook-form';

type TextInputFieldProps = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'password';
  placeholder?: string;
  disabled?: boolean;
};

export default function TextInputField({
  name,
  label,
  type = 'text',
  placeholder,
  disabled = false,
}: TextInputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Typesafe error extraction
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
        <input
          id={name}
          type={type}
          {...register(name)}
          className="min-w-0 flex-1 rounded border p-2 text-base"
          disabled={disabled}
          placeholder={placeholder || label}
        />
      </div>
      {fieldError?.message && (
        <span className="ml-[130px] text-red-500 text-xs">
          {fieldError.message}
        </span>
      )}
    </div>
  );
}
