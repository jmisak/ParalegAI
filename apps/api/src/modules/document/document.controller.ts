import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentService } from './document.service';
import {
  CreateDocumentDto,
  DocumentQueryDto,
  DocumentResponseDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard } from '@common/guards';
import { CurrentUser, OrganizationId, Permissions, Permission } from '@common/decorators';
import { JwtPayload, PaginatedResponse } from '@common/interfaces';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PermissionsGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @Permissions(Permission.DOCUMENT_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        matterId: { type: 'string', format: 'uuid' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        isPrivileged: { type: 'boolean' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded', type: DocumentResponseDto })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<DocumentResponseDto> {
    return this.documentService.upload(file, createDocumentDto, user.sub, organizationId);
  }

  @Get()
  @Permissions(Permission.DOCUMENT_READ)
  @ApiOperation({ summary: 'List documents with filtering' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async findAll(
    @Query() query: DocumentQueryDto,
    @OrganizationId() organizationId: string,
  ): Promise<PaginatedResponse<DocumentResponseDto>> {
    return this.documentService.findAll(query, organizationId);
  }

  @Get(':id')
  @Permissions(Permission.DOCUMENT_READ)
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Document found', type: DocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ): Promise<DocumentResponseDto> {
    return this.documentService.findOne(id, organizationId);
  }

  @Get(':id/download')
  @Permissions(Permission.DOCUMENT_DOWNLOAD)
  @ApiOperation({ summary: 'Download document file' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, document } = await this.documentService.download(id, organizationId);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.fileName)}"`,
      'Content-Length': document.fileSize,
    });

    return new StreamableFile(stream);
  }

  @Get(':id/versions')
  @Permissions(Permission.DOCUMENT_READ)
  @ApiOperation({ summary: 'Get document version history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Version history' })
  async getVersions(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ) {
    return this.documentService.getVersionHistory(id, organizationId);
  }

  @Post(':id/versions')
  @Permissions(Permission.DOCUMENT_UPDATE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new version of a document' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'New version uploaded', type: DocumentResponseDto })
  async uploadVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<DocumentResponseDto> {
    return this.documentService.createVersion(id, file, user.sub, organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.DOCUMENT_DELETE)
  @ApiOperation({ summary: 'Soft delete a document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<void> {
    await this.documentService.remove(id, user.sub, organizationId);
  }

  @Post(':id/share')
  @Permissions(Permission.DOCUMENT_SHARE)
  @ApiOperation({ summary: 'Generate a share link for a document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Share link generated' })
  async generateShareLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { expiresInHours?: number },
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<{ shareUrl: string; expiresAt: Date }> {
    return this.documentService.generateShareLink(
      id,
      user.sub,
      organizationId,
      body.expiresInHours || 24,
    );
  }
}
