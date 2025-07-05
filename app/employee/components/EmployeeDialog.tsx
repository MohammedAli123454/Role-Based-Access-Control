'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { City, Country, State } from 'country-state-city';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type EmployeeForm, employeeSchema } from '../types/employee.types';

import DateInputField from './DateInputField';
import SelectInputField from './SelectInput';
import TextInputField from './TextInput';

type EmployeeDialogProps = {
  afterSave?: () => void;
  initialData?: Partial<EmployeeForm> & { id?: number };
  isEdit?: boolean;
  triggerLabel?: string;
  forceNoPermissionDialog?: boolean;
};

export default function EmployeeDialog({
  afterSave,
  initialData,
  isEdit,
  triggerLabel = 'Add Employee',
  forceNoPermissionDialog = false,
}: EmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [noPermission, setNoPermission] = useState(false);

  const methods = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'Active',
      country: '',
      state: '',
      city: '',
      dob: '',
      date_of_joining: '',
    },
  });
  const { reset, setValue, watch } = methods;
  const queryClient = useQueryClient();

  // Fill form fields on edit
  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    if (!initialData) {
      return;
    }
    setValue('name', initialData.name || '');
    setValue('email', initialData.email || '');
    setValue('status', initialData.status || 'Active');
    setValue('dob', initialData.dob || '');
    setValue('date_of_joining', initialData.date_of_joining || '');
    setValue('country', initialData.country || '');
    setValue('state', initialData.state || '');
    setValue('city', initialData.city || '');
  }, [open, initialData, setValue, reset]);

  // Options for selects
  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        value: c.name,
        label: c.name,
        ...c,
      })),
    []
  );
  const selectedCountry = countryOptions.find(
    (c) => c.value === watch('country')
  );
  const stateOptions = useMemo(
    () =>
      selectedCountry && typeof selectedCountry.isoCode === 'string'
        ? State.getStatesOfCountry(selectedCountry.isoCode).map((s) => ({
            value: s.name,
            label: s.name,
            ...s,
          }))
        : [],
    [selectedCountry]
  );
  const selectedState = stateOptions.find((s) => s.value === watch('state'));
  const cityOptions = useMemo(
    () =>
      selectedCountry &&
      typeof selectedCountry.isoCode === 'string' &&
      selectedState &&
      typeof selectedState.isoCode === 'string'
        ? City.getCitiesOfState(
            selectedCountry.isoCode,
            selectedState.isoCode
          ).map((c) => ({
            value: c.name,
            label: c.name,
            ...c,
          }))
        : [],
    [selectedCountry, selectedState]
  );

  // Form submit
  const mutation = useMutation({
    mutationFn: async (data: EmployeeForm) => {
      if (isEdit && initialData?.id) {
        return await fetch('/api/employee', {
          method: 'PUT',
          body: JSON.stringify({ ...data, id: initialData.id }),
        });
      }
      return await fetch('/api/employee', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpen(false);
      reset();
      afterSave?.();
    },
  });

  return (
    <>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button
            onClick={(e) => {
              e.preventDefault();
              if (forceNoPermissionDialog) {
                setNoPermission(true);
              } else {
                setOpen(true);
              }
            }}
            variant={isEdit ? 'outline' : 'default'}
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-[95vw] rounded-2xl border bg-white p-0 shadow-lg md:max-w-6xl lg:max-w-7xl xl:max-w-[1200px]">
          <DialogTitle
            className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 bg-clip-text px-8 pt-8 pb-4 font-extrabold text-2xl text-transparent tracking-tight"
            style={{ WebkitBackgroundClip: 'text', color: 'transparent' }}
          >
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </DialogTitle>

          <FormProvider {...methods}>
            <form
              className="px-8 pb-8"
              onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextInputField label="Name" name="name" />
                <TextInputField label="Email" name="email" type="email" />
                <DateInputField label="Joining Date" name="date_of_joining" />
                <SelectInputField
                  label="Status"
                  name="status"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
                <DateInputField label="Date of Birth" name="dob" />
                <SelectInputField
                  isDisabled={false}
                  label="Country"
                  name="country"
                  options={countryOptions}
                  placeholder="Select Country"
                />
                <SelectInputField
                  isDisabled={!selectedCountry || stateOptions.length === 0}
                  label="State"
                  name="state"
                  options={stateOptions}
                  placeholder="Select State"
                />
                <SelectInputField
                  isDisabled={!selectedState || cityOptions.length === 0}
                  label="City"
                  name="city"
                  options={cityOptions}
                  placeholder="Select City"
                />
              </div>
              <div className="mt-8 flex flex-col justify-end gap-3 md:flex-row">
                <Button
                  onClick={() => setOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      {/* Loader icon here */}
                      {isEdit ? 'Updating...' : 'Saving...'}
                    </span>
                  ) : isEdit ? (
                    'Update'
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
      {/* No Permission Dialog */}
      <Dialog onOpenChange={setNoPermission} open={noPermission}>
        <DialogContent>
          <DialogTitle>Permission Denied</DialogTitle>
          <p className="text-red-600">
            You do not have permission to edit this record.
          </p>
          <DialogFooter>
            <Button onClick={() => setNoPermission(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
