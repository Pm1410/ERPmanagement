import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, MaterialQueryDto } from './dto/materials.dto';

@ApiTags('materials')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a study material' })
  create(
    @Body() dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.materialsService.create(dto, file, user);
  }

  @Get()
  @Roles('STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List study materials (filterable)' })
  findAll(@Query() q: MaterialQueryDto, @CurrentUser() user: any) {
    return this.materialsService.findAll(q, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material (uploader or admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.materialsService.remove(id, user);
  }
}

