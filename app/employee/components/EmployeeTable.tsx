'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarLoader } from 'react-spinners';
import type { Employee } from '../../employee/types/employee.types';

import DeleteButton from './DeleteButton';
import EmployeeDialog from './EmployeeDialog';

export default function EmployeeTable() {
  const queryClient = useQueryClient();

  /* ------------------------------------------------------------------ */
  /*  Data                                                              */
  /* ------------------------------------------------------------------ */
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => fetch('/api/employee').then((r) => r.json()),
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/me').then((r) => r.json()),
  });

  const canEdit = user?.role === 'admin' || user?.role === 'superuser';
  const isLoading = employeesLoading || userLoading;

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="w-full px-4 py-4">
      {isLoading && (
        <div className="mb-4 w-full">
          <BarLoader color="#2563eb" height={6} width="100%" />
        </div>
      )}

      {/* “Add Employee” (admins only) */}
      {canEdit && (
        <EmployeeDialog
          canEdit={canEdit}
          onSaved={() =>
            queryClient.invalidateQueries({ queryKey: ['employees'] })
          }
        />
      )}

      <table className="mt-4 w-full table-fixed border-collapse rounded-lg bg-white shadow">
        <thead className="sticky top-0 z-10 bg-gray-100">
          <tr>
            {[
              { label: 'Sr.No', w: '5%' },
              { label: 'Name', w: '15%' },
              { label: 'Email', w: '15%' },
              { label: 'Joining', w: '9%' },
              { label: 'DOB', w: '9%' },
              { label: 'Country', w: '8%' },
              { label: 'State', w: '8%' },
              { label: 'City', w: '8%' },
              { label: 'Status', w: '8%', center: true },
              { label: 'Actions', w: '15%', center: true },
            ].map(({ label, w, center }) => (
              <th
                className={`border-gray-200 border-b px-2 py-2 text-gray-700 ${
                  center ? 'text-center' : 'text-left'
                }`}
                key={label}
                style={{ width: w }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="font-sans text-sm">
          {!isLoading && employees.length > 0
            ? employees.map((emp: Employee, idx: number) => (
                <tr
                  className="h-10 transition-colors duration-150 odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                  key={emp.id}
                >
                  <td className="border-gray-200 border-b px-2 py-2">
                    {idx + 1}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
                    <div className="truncate">{emp.name}</div>
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
                    <div className="truncate">{emp.email}</div>
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
                    {emp.date_of_joining?.slice(0, 10) ?? ''}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
                    {emp.dob?.slice(0, 10) ?? ''}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
                    {emp.country}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
                    {emp.state}
                  </td>
                  <td className="border-gray-200 border-b px-2 py-2">
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
                  <td className="border-gray-200 border-b px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <EmployeeDialog
                        canEdit={canEdit}
                        employee={emp}
                        onSaved={() =>
                          queryClient.invalidateQueries({
                            queryKey: ['employees'],
                          })
                        }
                        triggerLabel="Edit"
                      />
                      <DeleteButton id={emp.id} />
                    </div>
                  </td>
                </tr>
              ))
            : !isLoading && (
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
