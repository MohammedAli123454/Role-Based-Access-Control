import { roles } from "@/lib/roles";
export function UserRoleSelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <select className="mb-4 w-full p-2 border rounded" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select Role</option>
      {roles.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  );
}
