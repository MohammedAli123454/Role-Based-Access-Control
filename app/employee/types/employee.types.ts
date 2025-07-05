// /types/employee.types.ts

import { z } from 'zod';

// Zod schema for form validation
export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  date_of_joining: z.string().min(1, 'Joining date is required'),
  status: z.string().min(1, 'Status is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
});

// Type for Employee object (API table row)
export type Employee = {
  id: number;
  name: string;
  email?: string;
  date_of_joining?: string;
  status: string;
  dob?: string;
  country: string;
  state: string;
  city: string;
};

// Type for Employee form
export type EmployeeForm = z.infer<typeof employeeSchema>;

// Type for react-select options
export type SelectOption = {
  value: string;
  label: string;
  [key: string]: unknown;
};
