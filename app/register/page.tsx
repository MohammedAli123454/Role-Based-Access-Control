'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserRoleSelect } from '@/components/UserRoleSelect';
import { Button } from '@/components/ui/button';

type RegisterForm = {
  username: string;
  password: string;
  role: string;
};

export default function Register() {
  const { register, handleSubmit, watch, setValue } = useForm<RegisterForm>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      router.push('/login');
    } else {
      setError(
        result.error || 'Registration failed (only admin can register users)'
      );
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form
        className="mx-auto w-full max-w-md rounded bg-white p-8 shadow"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="mb-6 text-center font-bold text-2xl">Register User</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input
          className="mb-4 w-full rounded border p-2"
          placeholder="Username"
          {...register('username', { required: true })}
        />
        <input
          className="mb-4 w-full rounded border p-2"
          placeholder="Password"
          type="password"
          {...register('password', { required: true })}
        />
        <UserRoleSelect
          onChange={(val) => setValue('role', val)}
          value={watch('role')}
        />
        <Button className="mt-2 w-full" type="submit">
          Register
        </Button>
      </form>
    </div>
  );
}
