import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { JwtAuthGuard, TenantGuard } from '@common/guards';
import { CurrentUser, OrganizationId, Permissions, Permission } from '@common/decorators';
import { JwtPayload } from '@common/interfaces';
import { TenantScoped } from '../../common/decorators/tenant-scoped.decorator';
import { TemplateCategory, TemplateVariable, ResolutionContext } from './template.types';

@ApiTags('templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard)
@TenantScoped()
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async create(
    @Body()
    body: {
      name: string;
      description: string;
      category: TemplateCategory;
      content: string;
      variables?: TemplateVariable[];
      jurisdiction?: string;
    },
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ) {
    return this.templateService.create(body, user.sub, organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'List document templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async findAll(
    @OrganizationId() organizationId: string,
    @Query('category') category?: TemplateCategory,
    @Query('search') search?: string,
    @Query('jurisdiction') jurisdiction?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.templateService.findAll(
      organizationId,
      { category, search, jurisdiction },
      {
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        sortBy,
        sortOrder,
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ) {
    return this.templateService.findOne(id, organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      content?: string;
      variables?: TemplateVariable[];
      jurisdiction?: string;
    },
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ) {
    return this.templateService.update(id, body, user.sub, organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a template' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ) {
    await this.templateService.remove(id, user.sub, organizationId);
  }

  @Post(':id/render')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Render a template with context data' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Rendered template' })
  async render(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { context: ResolutionContext },
    @OrganizationId() organizationId: string,
  ) {
    return this.templateService.render(id, body.context, organizationId);
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview a template render without saving' })
  @ApiResponse({ status: 200, description: 'Preview result' })
  async preview(
    @Body()
    body: {
      content: string;
      variables: TemplateVariable[];
      context: ResolutionContext;
    },
  ) {
    return this.templateService.preview(body.content, body.variables, body.context);
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate template can be rendered with context' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async validate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { context: ResolutionContext },
    @OrganizationId() organizationId: string,
  ) {
    return this.templateService.validate(id, body.context, organizationId);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a template' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Template cloned' })
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string },
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ) {
    return this.templateService.clone(id, body.name, user.sub, organizationId);
  }
}
