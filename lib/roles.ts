export const roles = ["admin", "superuser", "user"] as const;
export function getRolePermissions(role: string) {
  switch (role) {
    case "admin":      return { canCreate: true, canEdit: true, canDelete: true, canRegister: true };
    case "superuser":  return { canCreate: true, canEdit: true, canDelete: false, canRegister: false };
    default:           return { canCreate: false, canEdit: false, canDelete: false, canRegister: false };
  }
}
