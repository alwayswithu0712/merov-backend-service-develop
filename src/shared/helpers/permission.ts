import { ForbiddenException } from '@nestjs/common';
import { capitalize } from '../helpers/capitalize';
import * as set  from '../helpers/set';
import { Permission } from '../typings';


export function castPermission(permString: string): Permission {
    return Permission[capitalize(permString.toLowerCase())];
}

export function AssertPermissions(actingUserPerms: Permission[], subjectUserPerms: Permission[], subjectUserNewPerms?: Permission[]) {

    let actingPerms = new Set(actingUserPerms);
    let subjectPerms = new Set(subjectUserPerms);
    let subjectNewPerms = subjectUserNewPerms? new Set(subjectUserNewPerms) : null;
    let commonPerms = set.intersection(actingPerms, subjectPerms);

    // Admin without the Owner permission cant edit/delete another Admin
    if (commonPerms.has(Permission.Admin) && !actingPerms.has(Permission.Owner)) {
        throw new ForbiddenException("Admins can't edit or delete other admins.");
    }

    // Owner's can't edit/delete owners. Needs to ask Merov service.
    if (commonPerms.has(Permission.Owner)) {
        throw new ForbiddenException("Owner's can't edit or delete owners. Please contact Merov support.");
    }

    // Owner's are the only ones allowed to create Admins.
    if (subjectNewPerms) {

        if (subjectNewPerms.has(Permission.Admin) && !actingPerms.has(Permission.Owner)) {
            throw new ForbiddenException("Only Owner can create new Admins.");
        }

        if (subjectNewPerms.has(Permission.Owner) && !actingPerms.has(Permission.Owner)) {
            throw new ForbiddenException("Only Owner can create new Owners.");
        }

    }

}
