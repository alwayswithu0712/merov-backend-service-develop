import { Permission } from "../typings";

export const hasPermission = (userPermissions: string[], allowedPermissions: string[]): boolean => {
    return userPermissions.includes(Permission.Owner) ||
           userPermissions.includes(Permission.Admin) ||
           allowedPermissions.some(permission => userPermissions.includes(permission));

  }