'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

type ItemForm = {
  name: string;
  sku?: string;
  quantity?: number;
};

export default function ItemDialog({ afterSave }: { afterSave?: () => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<ItemForm>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: ItemForm) => {
      const res = await fetch('/api/item-master', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(
          result.error || 'Only admin or superuser can add items.'
        );
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setOpen(false);
      reset();
      afterSave?.();
      setError(null);
    },
    onError: (err: unknown) => {
      if (err instanceof Error && typeof err.message === 'string') {
        setError(err.message);
      } else if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        setError((err as Record<string, unknown>).message as string);
      } else {
        setError('Only admin or superuser can add items.');
      }
    },
  });

  const onSubmit: SubmitHandler<ItemForm> = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Add Item</Button>
      </DialogTrigger>
      <DialogContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded border-red-500 border-l-4 bg-red-100 p-2 font-semibold text-red-700">
              {error}
            </div>
          )}
          <input
            className="w-full rounded border p-2"
            placeholder="Name"
            {...register('name')}
            required
          />
          <input
            className="w-full rounded border p-2"
            placeholder="SKU"
            {...register('sku')}
          />
          <input
            className="w-full rounded border p-2"
            min={0}
            placeholder="Quantity"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
          />
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
