'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { City, Country, State } from 'country-state-city';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  type Employee, // <— NEW
  type EmployeeForm,
  employeeSchema,
} from '../types/employee.types';
import DateInputField from './DateInputField';
import SelectInputField from './SelectInput';
import TextInputField from './TextInput';

type Props = {
  /** Omit for “Add”; provide for “Edit” */
  employee?: Partial<EmployeeForm> & { id?: number };
  /** Whether the current user is allowed to add / edit */
  canEdit: boolean;
  /** Callback after a successful save */
  onSaved?: () => void;
  /** Optional override for the button caption */
  triggerLabel?: string;
};

export default function EmployeeDialog({
  employee,
  canEdit,
  onSaved,
  triggerLabel,
}: Props) {
  /* ------------------------------------------------------------------ */
  /*  Local state / hooks                                               */
  /* ------------------------------------------------------------------ */

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(employee?.id);

  /* ------------------------------------------------------------------ */
  /*  Form setup                                                        */
  /* ------------------------------------------------------------------ */
  const defaultValues: EmployeeForm = useMemo(
    () => ({
      name: employee?.name ?? '',
      email: employee?.email ?? '',
      status: employee?.status ?? 'Active',
      country: employee?.country ?? '',
      state: employee?.state ?? '',
      city: employee?.city ?? '',
      dob: employee?.dob ?? '',
      date_of_joining: employee?.date_of_joining ?? '',
    }),
    [employee]
  );

  const methods = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  // Keep the form in sync if the user switches rows quickly
  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  /* ------------------------------------------------------------------ */
  /*  Cascading selects                                                 */
  /* ------------------------------------------------------------------ */
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
    (c) => c.value === methods.watch('country')
  );

  const stateOptions = useMemo(
    () =>
      selectedCountry
        ? State.getStatesOfCountry(selectedCountry.isoCode).map((s) => ({
            value: s.name,
            label: s.name,
            ...s,
          }))
        : [],
    [selectedCountry]
  );

  const selectedState = stateOptions.find(
    (s) => s.value === methods.watch('state')
  );

  const cityOptions = useMemo(
    () =>
      selectedCountry && selectedState
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

  /* ------------------------------------------------------------------ */
  /*  Save / update mutation                                            */
  /* ------------------------------------------------------------------ */
  const mutation = useMutation({
    mutationFn: (data: EmployeeForm) => {
      const method = isEdit ? 'PUT' : 'POST';

      // ---------- build the payload without non-null assertion ----------
      const payload: unknown = (() => {
        if (isEdit) {
          // Guard: make sure we really have an ID
          if (employee?.id == null) {
            throw new Error('Employee id is missing for edit operation');
          }
          return { ...data, id: employee.id };
        }
        return data;
      })();
      // ------------------------------------------------------------------

      return fetch('/api/employee', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error('Request failed');
        }
        return (await res.json()) as Employee; // or just `return res.json();`
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpen(false);
      methods.reset();

      toast.success(isEdit ? 'Employee updated' : 'Employee added', {
        description: 'Changes were saved successfully.',
        id: 'employee-save',
      });

      onSaved?.();
    },
  });

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          onClick={(e) => {
            e.preventDefault();
            if (!canEdit) {
              toast('Permission denied', {
                description: 'You do not have permission for this action.',
                className: 'bg-red-600 text-white',
                closeButton: true,
              });
              return;
            }
            setOpen(true);
          }}
          variant={isEdit ? 'outline' : 'default'}
        >
          {triggerLabel ?? (isEdit ? 'Edit' : 'Add Employee')}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-[95vw] rounded-2xl border bg-white p-0 shadow-lg md:max-w-6xl lg:max-w-7xl xl:max-w-[1200px]">
        <DialogTitle className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 bg-clip-text px-8 pt-8 pb-4 font-extrabold text-2xl text-transparent tracking-tight">
          {isEdit ? 'Edit Employee' : 'Add Employee'}
        </DialogTitle>

        <FormProvider {...methods}>
          <form
            className="px-8 pb-8"
            onSubmit={methods.handleSubmit((d) => mutation.mutate(d))}
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
                {mutation.isPending
                  ? isEdit
                    ? 'Updating…'
                    : 'Saving…'
                  : isEdit
                    ? 'Update'
                    : 'Save'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
