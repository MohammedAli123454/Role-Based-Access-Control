"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ItemDialog({ afterSave }: { afterSave?: () => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/item-master", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Only admin or superuser can add items.");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setOpen(false);
      reset();
      afterSave?.();
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || "Only admin or superuser can add items.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={handleSubmit(data => createMutation.mutate(data))}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded font-semibold">
              {error}
            </div>
          )}
          <input
            className="w-full p-2 border rounded"
            placeholder="Name"
            {...register("name")}
            required
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="SKU"
            {...register("sku")}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Quantity"
            type="number"
            min={0}
            {...register("quantity", { valueAsNumber: true })}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
