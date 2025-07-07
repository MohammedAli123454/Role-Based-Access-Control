'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

type DeleteButtonProps = {
  id: number;
  label?: string;
};

export default function DeleteButton({
  id,
  label = 'Delete',
}: DeleteButtonProps) {
  const queryClient = useQueryClient();

  /* Who am I? */
  const { data: user, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => fetch('/api/me').then((r) => r.json()),
  });

  /* DELETE /api/employee */
  const deleteMutation = useMutation({
    mutationFn: async (empId: number) =>
      fetch('/api/employee', {
        method: 'DELETE',
        body: JSON.stringify({ id: empId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noPermissionOpen, setNoPermissionOpen] = useState(false);

  const canDelete = user?.role === 'admin';

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleClick = () => {
    if (canDelete) {
      setConfirmOpen(true);
    } else {
      setNoPermissionOpen(true);
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    setConfirmOpen(false);
  };

  /* ── Loading while /me is still fetching ─────────────────────────── */
  if (meLoading) {
    return (
      <div className="inline-flex items-center">
        <BarLoader height={4} width={40} />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      <Button
        disabled={deleteMutation.isPending}
        onClick={handleClick}
        variant="destructive"
      >
        {label}
      </Button>

      {/* ── Confirm dialog ─────────────────────────────────────────── */}
      <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <DialogContent>
          <DialogTitle>Delete Employee</DialogTitle>
          <p>Are you sure you want to delete this employee?</p>

          <DialogFooter>
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => setConfirmOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              className="flex items-center justify-center"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
              variant="destructive"
            >
              {deleteMutation.isPending ? (
                /* Loader visible **during** the delete call */
                <BarLoader color="#ffffff" height={4} width={60} />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── No-permission dialog ────────────────────────────────────── */}
      <Dialog onOpenChange={setNoPermissionOpen} open={noPermissionOpen}>
        <DialogContent>
          <DialogTitle>Permission Denied</DialogTitle>
          <p className="text-red-600">
            You do not have permission to delete this record.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setNoPermissionOpen(false)}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
