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
import type { Employee } from '../../employee/types/employee.types';
import EmployeeDialog from './EmployeeDialog';

export default function EmployeeTable() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => fetch('/api/employee').then((r) => r.json()),
  });
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => fetch('/api/me').then((r) => r.json()),
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showNoPermission, setShowNoPermission] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      fetch('/api/employee', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
  const canDelete = user?.role === 'admin';
  const canEdit = user?.role === 'admin' || user?.role === 'superuser';

  return (
    <div className="w-full px-4 py-4">
      {(isLoading || userLoading) && (
        <div className="mb-4 w-full">
          <BarLoader color="#2563eb" height={6} width="100%" />
        </div>
      )}
      {(user?.role === 'admin' || user?.role === 'superuser') && (
        <EmployeeDialog
          afterSave={() =>
            queryClient.invalidateQueries({ queryKey: ['employees'] })
          }
        />
      )}

      <table className="mt-4 w-full table-fixed border-collapse rounded-lg bg-white shadow">
        <thead className="sticky top-0 z-10 bg-gray-100">
          <tr>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '5%' }}
            >
              Sr.No
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '15%' }}
            >
              Name
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '15%' }}
            >
              Email
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '9%' }}
            >
              Joining
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '9%' }}
            >
              DOB
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '8%' }}
            >
              Country
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '8%' }}
            >
              State
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-left text-gray-700"
              style={{ width: '8%' }}
            >
              City
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-center text-gray-700"
              style={{ width: '8%' }}
            >
              Status
            </th>
            <th
              className="border-gray-200 border-b px-2 py-2 text-center text-gray-700"
              style={{ width: '15%' }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="font-sans text-sm">
          {!(isLoading || userLoading) && Array.isArray(data) && data.length > 0
            ? data.map((emp: Employee, idx) => (
                <tr
                  className="h-10 transition-colors duration-150 odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                  key={emp.id}
                >
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    <div className="truncate">{idx + 1}</div>
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    <div className="truncate">{emp.name}</div>
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    <div className="truncate">{emp.email}</div>
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    {emp.date_of_joining
                      ? emp.date_of_joining.slice(0, 10)
                      : ''}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    {emp.dob ? emp.dob.slice(0, 10) : ''}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    {emp.country}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    {emp.state}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-left">
                    {emp.city}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2 text-center">
                    <span
                      className={`rounded px-2 py-1 ${emp.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="space-x-2 border-gray-200 border-b px-2 py-2 text-center">
                    <EmployeeDialog
                      afterSave={() =>
                        queryClient.invalidateQueries({
                          queryKey: ['employees'],
                        })
                      }
                      forceNoPermissionDialog={!canEdit}
                      initialData={emp}
                      isEdit
                      triggerLabel="Edit"
                    />
                    <Button
                      onClick={() => {
                        if (canDelete) {
                          setSelectedId(emp.id);
                          setShowDelete(true);
                        } else {
                          setShowNoPermission(true);
                        }
                      }}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            : !(isLoading || userLoading) && (
                <tr>
                  <td className="py-4 text-center text-red-500" colSpan={10}>
                    No employees found.
                  </td>
                </tr>
              )}
        </tbody>
      </table>
      {/* Delete Confirmation */}
      <Dialog onOpenChange={setShowDelete} open={showDelete}>
        <DialogContent>
          <DialogTitle>Delete Employee</DialogTitle>
          <p>Are you sure you want to delete this employee?</p>
          <DialogFooter>
            <Button onClick={() => setShowDelete(false)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (selectedId) {
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
      {/* No Permission Dialog for Delete */}
      <Dialog onOpenChange={setShowNoPermission} open={showNoPermission}>
        <DialogContent>
          <DialogTitle>Permission Denied</DialogTitle>
          <p className="text-red-600">
            You do not have permission to delete this record.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setShowNoPermission(false)}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
