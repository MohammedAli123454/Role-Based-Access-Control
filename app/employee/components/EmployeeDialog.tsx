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
} from '@/components/ui/dialog';

import {
  type Employee,
  type EmployeeForm,
  employeeSchema,
} from '../types/employee.types';
import DateInputField from './DateInputField';
import SelectInputField from './SelectInput';
import TextInputField from './TextInput';

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
type Props =
  | {
      mode: 'add';
      canAdd: boolean;
      onSaved?: () => void;
    }
  | {
      mode: 'edit';
      employee: Partial<EmployeeForm> & { id: number };
      canEdit: boolean;
      onSaved?: () => void;
    };

export default function EmployeeDialog(props: Props) {
  const { mode, onSaved } = props;
  const employee = mode === 'edit' ? props.employee : undefined;
  const hasPermission = mode === 'add' ? props.canAdd : props.canEdit;
  const queryClient = useQueryClient();

  /* ------------------------------------------------------------------ */
  /*  Local dialog state                                                */
  /* ------------------------------------------------------------------ */
  const [formOpen, setFormOpen] = useState(false); // add / edit dialog
  const [denyOpen, setDenyOpen] = useState(false); // no-permission dialog

  const isEdit = mode === 'edit';

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

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  /* ------------------------------------------------------------------ */
  /*  Cascading select helpers                                          */
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
      if (mode === 'edit') {
        const { id } = props.employee;
        return fetch('/api/employee', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id }),
        }).then(async (res) => {
          if (!res.ok) {
            throw new Error('Request failed');
          }
          return (await res.json()) as Employee;
        });
      }

      // add
      return fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error('Request failed');
        }
        return (await res.json()) as Employee;
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setFormOpen(false);
      methods.reset();
      onSaved?.();
    },
  });

  /* ------------------------------------------------------------------ */
  /*  Click handler                                                     */
  /* ------------------------------------------------------------------ */
  function handleButtonClick() {
    if (!hasPermission) {
      setDenyOpen(true);
      return;
    }
    setFormOpen(true);
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {/* ---------- The button users click ---------- */}
      <Button
        onClick={handleButtonClick}
        type="button"
        variant={isEdit ? 'outline' : 'default'}
      >
        {isEdit ? 'Edit' : 'Add Employee'}
      </Button>

      {/* ---------- 1 · No-permission dialog ---------- */}
      <Dialog onOpenChange={setDenyOpen} open={denyOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogTitle>Permission Denied</DialogTitle>
          <p className="mt-2 text-red-600 text-sm">
            You do not have permission to {isEdit ? 'edit' : 'add'} employees.
          </p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setDenyOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- 2 · Add / Edit dialog (only rendered for authorised users) ---------- */}
      {hasPermission && (
        <Dialog onOpenChange={setFormOpen} open={formOpen}>
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
                    onClick={() => setFormOpen(false)}
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
      )}
    </>
  );
}
