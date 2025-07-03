"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import ItemDialog from "./ItemDialog";

// Utility to extract backend error message or show a fallback
function getErrorMessage(error: any, fallback: string) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  return fallback;
}

export default function ItemTable() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: async () => fetch("/api/item-master").then(r => r.json()),
  });

  const [error, setError] = useState<string | null>(null);

  // Delete mutation with permission error handling
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api/item-master", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "You do not have permission to delete this item.");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setError(null);
    },
    onError: (err: any) => {
      setError(getErrorMessage(err, "Only admin can delete records."));
    },
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div>
      <ItemDialog afterSave={() => queryClient.invalidateQueries({ queryKey: ["items"] })} />
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded font-semibold">
          {error}
        </div>
      )}
      <table className="min-w-full mt-4 border rounded shadow">
        <thead className="bg-blue-100">
          <tr>
            <th className="text-left px-4 py-2">Name</th>
            <th className="text-left px-4 py-2">SKU</th>
            <th className="text-left px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: any) => (
            <tr key={item.id} className="border-b">
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.sku}</td>
              <td className="px-4 py-2">{item.quantity}</td>
              <td className="px-4 py-2">
                {/* You can add edit logic here the same way as delete */}
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowDelete(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <p>Are you sure you want to delete this item?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (selectedId) {
                  setError(null);
                  await deleteMutation.mutateAsync(selectedId);
                  setShowDelete(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
