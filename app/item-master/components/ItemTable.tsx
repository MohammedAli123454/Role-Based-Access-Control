'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import ItemDialog from './ItemDialog';

type Item = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if ('error' in errorObj && typeof errorObj.error === 'string') {
      return errorObj.error;
    }
  }
  return fallback;
}

export default function ItemTable() {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => fetch('/api/item-master').then((r) => r.json()),
  });

  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/item-master', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || 'You do not have permission to delete this item.'
        );
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setError(null);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, 'Only admin can delete records.'));
    },
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div>
      <ItemDialog
        afterSave={() => queryClient.invalidateQueries({ queryKey: ['items'] })}
      />
      {error && (
        <div className="my-4 rounded border-red-500 border-l-4 bg-red-100 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}
      <table className="mt-4 min-w-full rounded border shadow">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">SKU</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: Item) => (
            <tr className="border-b" key={item.id}>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.sku}</td>
              <td className="px-4 py-2">{item.quantity}</td>
              <td className="px-4 py-2">
                <Button
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowDelete(true);
                  }}
                  variant="destructive"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog onOpenChange={setShowDelete} open={showDelete}>
        <DialogContent>
          <p>Are you sure you want to delete this item?</p>
          <DialogFooter>
            <Button onClick={() => setShowDelete(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedId) {
                  setError(null);
                  await deleteMutation.mutateAsync(selectedId);
                  setShowDelete(false);
                }
              }}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
