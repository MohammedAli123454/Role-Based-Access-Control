"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <form className="max-w-md w-full mx-auto bg-white p-8 rounded shadow" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input className="mb-4 w-full p-2 border rounded" placeholder="Username" {...register("username")} />
        <input className="mb-4 w-full p-2 border rounded" type="password" placeholder="Password" {...register("password")} />
        <Button type="submit" className="w-full mt-2">Login</Button>
      </form>
    </div>
  );
}
