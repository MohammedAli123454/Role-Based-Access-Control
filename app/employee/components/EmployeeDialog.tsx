'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { City, Country, State } from 'country-state-city';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  type UseFormReset,
  type UseFormSetValue,
  type UseFormTrigger,
  useForm,
} from 'react-hook-form';
import Select from 'react-select';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DatePicker from './DatePicker';

// Zod schema
const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  date_of_joining: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  dob: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
});
type EmployeeForm = z.infer<typeof employeeSchema>;

type SelectOption = {
  value: string;
  label: string;
  [key: string]: unknown;
};

type EmployeeDialogProps = {
  afterSave?: () => void;
  initialData?: Partial<EmployeeForm> & { id?: number };
  isEdit?: boolean;
  triggerLabel?: string;
  forceNoPermissionDialog?: boolean;
};

type UseInitializeFieldsProps = {
  open: boolean;
  initialData?: Partial<EmployeeForm> & { id?: number };
  setValue: UseFormSetValue<EmployeeForm>;
  setDob: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setDoj: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setSelectedCountry: React.Dispatch<React.SetStateAction<SelectOption | null>>;
  setSelectedState: React.Dispatch<React.SetStateAction<SelectOption | null>>;
  setSelectedCity: React.Dispatch<React.SetStateAction<SelectOption | null>>;
  reset: UseFormReset<EmployeeForm>;
};

function useInitializeFields({
  open,
  initialData,
  setValue,
  setDob,
  setDoj,
  setSelectedCountry,
  setSelectedState,
  setSelectedCity,
  reset,
}: UseInitializeFieldsProps) {
  useEffect(() => {
    if (!(open && initialData)) {
      return;
    }
    setValue('name', initialData.name || '');
    setValue('email', initialData.email || '');
    setValue('status', initialData.status || 'Active');
  }, [open, initialData, setValue]);
  useEffect(() => {
    if (!(open && initialData && initialData.date_of_joining)) {
      return;
    }
    setDoj(new Date(initialData.date_of_joining));
  }, [open, initialData, setDoj]);
  useEffect(() => {
    if (!(open && initialData && initialData.dob)) {
      return;
    }
    setDob(new Date(initialData.dob));
  }, [open, initialData, setDob]);
  useEffect(() => {
    if (!(open && initialData && initialData.country)) {
      return;
    }
    setSelectedCountry({
      value: initialData.country,
      label: initialData.country,
    });
    setValue('country', initialData.country);
  }, [open, initialData, setValue, setSelectedCountry]);
  useEffect(() => {
    if (!(open && initialData && initialData.state)) {
      return;
    }
    setSelectedState({ value: initialData.state, label: initialData.state });
    setValue('state', initialData.state);
  }, [open, initialData, setValue, setSelectedState]);
  useEffect(() => {
    if (!(open && initialData && initialData.city)) {
      return;
    }
    setSelectedCity({ value: initialData.city, label: initialData.city });
    setValue('city', initialData.city);
  }, [open, initialData, setValue, setSelectedCity]);
  useEffect(() => {
    if (open) {
      return;
    }
    reset();
    setDob(undefined);
    setDoj(undefined);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
  }, [
    open,
    reset,
    setDob,
    setDoj,
    setSelectedCountry,
    setSelectedState,
    setSelectedCity,
  ]);
}

function useSelectOptions(
  selectedCountry: SelectOption | null,
  selectedState: SelectOption | null
) {
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.name,
    label: country.name,
    ...country,
  }));

  const stateOptions =
    selectedCountry &&
    typeof selectedCountry.value === 'string' &&
    'isoCode' in selectedCountry &&
    typeof selectedCountry.isoCode === 'string'
      ? State.getStatesOfCountry(selectedCountry.isoCode).map((state) => ({
          value: state.name,
          label: state.name,
          ...state,
        }))
      : [];

  const cityOptions =
    selectedCountry &&
    typeof selectedCountry.value === 'string' &&
    'isoCode' in selectedCountry &&
    typeof selectedCountry.isoCode === 'string' &&
    selectedState &&
    typeof selectedState.value === 'string' &&
    'isoCode' in selectedState &&
    typeof selectedState.isoCode === 'string'
      ? City.getCitiesOfState(
          selectedCountry.isoCode,
          selectedState.isoCode
        ).map((city) => ({
          value: city.name,
          label: city.name,
          ...city,
        }))
      : [];

  return { countryOptions, stateOptions, cityOptions };
}

function useSelectHandlers(
  setSelectedCountry: React.Dispatch<React.SetStateAction<SelectOption | null>>,
  setSelectedState: React.Dispatch<React.SetStateAction<SelectOption | null>>,
  setSelectedCity: React.Dispatch<React.SetStateAction<SelectOption | null>>,
  setValue: UseFormSetValue<EmployeeForm>,
  trigger: UseFormTrigger<EmployeeForm>
) {
  const handleCountryChange = (opt: SelectOption | null) => {
    setSelectedCountry(opt);
    setSelectedState(null);
    setSelectedCity(null);
    setValue('country', opt?.value || '');
    setValue('state', '');
    setValue('city', '');
    trigger(['country', 'state', 'city']);
  };
  const handleStateChange = (opt: SelectOption | null) => {
    setSelectedState(opt);
    setSelectedCity(null);
    setValue('state', opt?.value || '');
    setValue('city', '');
    trigger(['state', 'city']);
  };
  const handleCityChange = (opt: SelectOption | null) => {
    setSelectedCity(opt);
    setValue('city', opt?.value || '');
    trigger('city');
  };
  return { handleCountryChange, handleStateChange, handleCityChange };
}

export default function EmployeeDialog({
  afterSave,
  initialData,
  isEdit,
  triggerLabel = 'Add Employee',
  forceNoPermissionDialog = false,
}: EmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [noPermission, setNoPermission] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'Active',
      country: '',
      state: '',
      city: '',
    },
  });

  const queryClient = useQueryClient();

  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [doj, setDoj] = useState<Date | undefined>(undefined);

  useInitializeFields({
    open,
    initialData,
    setValue,
    setDob,
    setDoj,
    setSelectedCountry,
    setSelectedState,
    setSelectedCity,
    reset,
  });

  const { countryOptions, stateOptions, cityOptions } = useSelectOptions(
    selectedCountry,
    selectedState
  );

  const { handleCountryChange, handleStateChange, handleCityChange } =
    useSelectHandlers(
      setSelectedCountry,
      setSelectedState,
      setSelectedCity,
      setValue,
      trigger
    );

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

  function onSubmit(data: EmployeeForm) {
    data.dob = dob ? format(dob, 'yyyy-MM-dd') : undefined;
    data.date_of_joining = doj ? format(doj, 'yyyy-MM-dd') : undefined;
    mutation.mutate(data);
  }

  let buttonContent: React.ReactNode;

  if (mutation.isPending) {
    buttonContent = (
      <span className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        {isEdit ? 'Updating...' : 'Saving...'}
      </span>
    );
  } else if (isEdit) {
    buttonContent = 'Update';
  } else {
    buttonContent = 'Save';
  }

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
        <DialogContent
          className="w-full max-w-[95vw] rounded-2xl border bg-white p-0 shadow-lg md:max-w-6xl lg:max-w-7xl xl:max-w-[1200px]"
          style={{ width: '100%', minWidth: 0 }}
        >
          <DialogTitle
            className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 bg-clip-text px-8 pt-8 pb-4 font-extrabold text-2xl text-transparent tracking-tight"
            style={{
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </DialogTitle>
          <form className="px-8 pb-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label
                    className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    className="min-w-0 flex-1 rounded border p-2 text-base"
                    id="name"
                    placeholder="Name"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label
                    className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="min-w-0 flex-1 rounded border p-2 text-base"
                    id="email"
                    placeholder="Email"
                    {...register('email')}
                    type="email"
                  />
                </div>
                {errors.email && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>
              {/* Date of Joining */}
              <div className="flex flex-col gap-1">
                <DatePicker date={doj} label="Joining Date" onChange={setDoj} />
                {errors.date_of_joining && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.date_of_joining.message}
                  </span>
                )}
              </div>
              {/* Status */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label
                    className="w-[140px] flex-shrink-0 font-medium text-base text-gray-700"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    className="min-w-0 flex-1 rounded border p-2 text-base"
                    id="status"
                    {...register('status')}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                {errors.status && (
                  <span className="ml-[140px] text-red-500 text-xs">
                    {errors.status.message}
                  </span>
                )}
              </div>
              {/* Date of Birth */}
              <div className="flex flex-col gap-1">
                <DatePicker
                  date={dob}
                  label="Date of Birth"
                  onChange={setDob}
                />
                {errors.dob && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.dob.message}
                  </span>
                )}
              </div>
              {/* Country */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label
                    className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
                    htmlFor="country"
                  >
                    Country
                  </label>
                  <div className="min-w-0 flex-1">
                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      inputId="country"
                      isClearable
                      onChange={handleCountryChange}
                      options={countryOptions}
                      placeholder="Select Country"
                      styles={{
                        container: (base) => ({ ...base, width: '100%' }),
                      }}
                      value={selectedCountry}
                    />
                  </div>
                </div>
                {errors.country && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.country.message}
                  </span>
                )}
              </div>
              {/* State */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label
                    className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
                    htmlFor="state"
                  >
                    State
                  </label>
                  <div className="min-w-0 flex-1">
                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      inputId="state"
                      isClearable
                      isDisabled={!selectedCountry || stateOptions.length === 0}
                      onChange={handleStateChange}
                      options={stateOptions}
                      placeholder="Select State"
                      styles={{
                        container: (base) => ({ ...base, width: '100%' }),
                      }}
                      value={selectedState}
                    />
                  </div>
                </div>
                {errors.state && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.state.message}
                  </span>
                )}
              </div>
              {/* City */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label
                    className="w-[130px] flex-shrink-0 font-medium text-base text-gray-700"
                    htmlFor="city"
                  >
                    City
                  </label>
                  <div className="min-w-0 flex-1">
                    <Select
                      className="react-select-container"
                      classNamePrefix="react-select"
                      inputId="city"
                      isClearable
                      isDisabled={!selectedState || cityOptions.length === 0}
                      onChange={handleCityChange}
                      options={cityOptions}
                      placeholder="Select City"
                      styles={{
                        container: (base) => ({ ...base, width: '100%' }),
                      }}
                      value={selectedCity}
                    />
                  </div>
                </div>
                {errors.city && (
                  <span className="ml-[130px] text-red-500 text-xs">
                    {errors.city.message}
                  </span>
                )}
              </div>
            </div>
            {/* Form buttons */}
            <div className="mt-8 flex flex-col justify-end gap-3 md:flex-row">
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={mutation.isPending} type="submit">
                {buttonContent}
              </Button>
            </div>
          </form>
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
