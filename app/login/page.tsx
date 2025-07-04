'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

type LoginForm = {
  username: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form
        className="mx-auto w-full max-w-md rounded bg-white p-8 shadow"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="mb-6 text-center font-bold text-2xl">Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input
          className="mb-4 w-full rounded border p-2"
          placeholder="Username"
          {...register('username')}
        />
        <input
          className="mb-4 w-full rounded border p-2"
          placeholder="Password"
          type="password"
          {...register('password')}
        />
        <Button className="mt-2 w-full" type="submit">
          Login
        </Button>
      </form>
    </div>
  );
}
