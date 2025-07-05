import { roles } from '@/lib/roles';
export function UserRoleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    // biome-ignore assist/source/useSortedAttributes: <explanation>
    <select
      className="mb-4 w-full rounded border p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Role</option>
      {roles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
