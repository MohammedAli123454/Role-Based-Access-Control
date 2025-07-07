'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarLoader } from 'react-spinners';
import type { Employee } from '../../employee/types/employee.types';
import DeleteButton from './DeleteButton';
import EmployeeDialog from './EmployeeDialog';

export default function EmployeeTable() {
  const queryClient = useQueryClient();

  /* All employees */
  const { data = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => fetch('/api/employee').then((r) => r.json()),
  });

  /* Current user (to decide who can edit) */
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => fetch('/api/me').then((r) => r.json()),
  });

  const canEdit = user?.role === 'admin' || user?.role === 'superuser';

  return (
    <div className="w-full px-4 py-4">
      {(isLoading || userLoading) && (
        <div className="mb-4 w-full">
          <BarLoader color="#2563eb" height={6} width="100%" />
        </div>
      )}

      {/* “Add Employee” button – only for admin / superuser */}
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
                      className={`rounded px-2 py-1 ${
                        emp.status === 'Active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
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

                    {/* <— the new, self-contained delete button */}
                    <DeleteButton id={emp.id} />
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
    </div>
  );
}
