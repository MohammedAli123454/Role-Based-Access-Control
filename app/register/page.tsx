"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { UserRoleSelect } from "@/components/UserRoleSelect";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Register() {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) router.push("/login");
    else setError("Registration failed (only admin can register users)");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <form className="max-w-md w-full mx-auto bg-white p-8 rounded shadow" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-bold mb-6 text-center">Register User</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input className="mb-4 w-full p-2 border rounded" placeholder="Username" {...register("username")} />
        <input className="mb-4 w-full p-2 border rounded" type="password" placeholder="Password" {...register("password")} />
        <UserRoleSelect value={watch("role")} onChange={val => setValue("role", val)} />
        <Button type="submit" className="w-full mt-2">Register</Button>
      </form>
    </div>
  );
}
