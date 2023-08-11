import { Controller, Body, Param, UseGuards, Patch, Get, ClassSerializerInterceptor, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../shared/pipes/validation.pipe';
import { updateIdentityVerificationSchema } from '../schema/update-identity-verification.schema';
import { GetPagination } from '../../shared/decorators/pagination.decorator';
import { Pagination } from '../../shared/typings/pagination';
import { IdentityVerificationsService } from '../identity-verifications.service';
import { Role } from '../../auth/typings/role';
import RoleGuard from '../../auth/role.guard';
import { SardineService } from '../../sardine/sardine.service';
import { MEROV_ADMIN } from 'src/shared/typings/groups';

@Controller('admin/identity/verifications')
@ApiTags('Identity verifications')
@UseGuards(AuthGuard('jwt'))
@UseGuards(RoleGuard(Role.MerovAdmin))
@SerializeOptions({ groups: [MEROV_ADMIN] })
@UseInterceptors(ClassSerializerInterceptor)
export class AdminVerificationsController {
    constructor(private readonly identityService: IdentityVerificationsService, private readonly sardineService: SardineService) {}

    @Get()
    async get(@GetPagination() pagination: Pagination) {
        return this.identityService.findAll(pagination) 
    }

    @Get(':id/documents/images')
    async getImages(@Param('id') id: string) {
        return this.sardineService.getVerificationImages(id);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.identityService.getById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body(new JoiValidationPipe(updateIdentityVerificationSchema)) verification) {
        return this.identityService.update(id, verification.status);
    }
}
