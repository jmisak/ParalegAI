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
import { MatterService } from './matter.service';
import {
  CreateMatterDto,
  UpdateMatterDto,
  MatterQueryDto,
  MatterResponseDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard } from '@common/guards';
import { CurrentUser, OrganizationId, Permissions, Permission } from '@common/decorators';
import { JwtPayload, PaginatedResponse } from '@common/interfaces';

@ApiTags('matters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PermissionsGuard)
@Controller('matters')
export class MatterController {
  constructor(private readonly matterService: MatterService) {}

  @Post()
  @Permissions(Permission.MATTER_CREATE)
  @ApiOperation({ summary: 'Create a new matter' })
  @ApiResponse({ status: 201, description: 'Matter created', type: MatterResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createMatterDto: CreateMatterDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<MatterResponseDto> {
    return this.matterService.create(createMatterDto, user.sub, organizationId);
  }

  @Get()
  @Permissions(Permission.MATTER_READ)
  @ApiOperation({ summary: 'List all matters with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of matters' })
  async findAll(
    @Query() query: MatterQueryDto,
    @OrganizationId() organizationId: string,
  ): Promise<PaginatedResponse<MatterResponseDto>> {
    return this.matterService.findAll(query, organizationId);
  }

  @Get(':id')
  @Permissions(Permission.MATTER_READ)
  @ApiOperation({ summary: 'Get a matter by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Matter found', type: MatterResponseDto })
  @ApiResponse({ status: 404, description: 'Matter not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ): Promise<MatterResponseDto> {
    return this.matterService.findOne(id, organizationId);
  }

  @Put(':id')
  @Permissions(Permission.MATTER_UPDATE)
  @ApiOperation({ summary: 'Update a matter' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Matter updated', type: MatterResponseDto })
  @ApiResponse({ status: 404, description: 'Matter not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMatterDto: UpdateMatterDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<MatterResponseDto> {
    return this.matterService.update(id, updateMatterDto, user.sub, organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.MATTER_DELETE)
  @ApiOperation({ summary: 'Soft delete a matter' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Matter deleted' })
  @ApiResponse({ status: 404, description: 'Matter not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<void> {
    await this.matterService.remove(id, user.sub, organizationId);
  }

  @Post(':id/assign')
  @Permissions(Permission.MATTER_ASSIGN)
  @ApiOperation({ summary: 'Assign team members to a matter' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Team members assigned' })
  async assignTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { userIds: string[] },
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<MatterResponseDto> {
    return this.matterService.assignTeam(id, body.userIds, user.sub, organizationId);
  }

  @Get(':id/activity')
  @Permissions(Permission.MATTER_READ)
  @ApiOperation({ summary: 'Get matter activity history' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity history' })
  async getActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ) {
    return this.matterService.getActivityHistory(id, organizationId);
  }

  @Post('conflicts/check')
  @Permissions(Permission.MATTER_READ)
  @ApiOperation({ summary: 'Check for conflicts of interest' })
  @ApiResponse({ status: 200, description: 'Conflict check result' })
  async checkConflicts(
    @Body() body: { partyIds: string[]; excludeMatterId?: string },
    @OrganizationId() organizationId: string,
  ) {
    return this.matterService.checkConflicts(
      body.partyIds,
      organizationId,
      body.excludeMatterId,
    );
  }

  @Post(':id/parties')
  @Permissions(Permission.MATTER_UPDATE)
  @ApiOperation({ summary: 'Add parties to a matter (with conflict checking)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Parties added' })
  @ApiResponse({ status: 409, description: 'Conflict of interest detected' })
  async addParties(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { parties: Array<{ partyId: string; role: string }> },
    @OrganizationId() organizationId: string,
  ) {
    // skipConflictCheck is never user-controlled — always enforce conflict checks
    return this.matterService.addParties(
      id,
      body.parties,
      organizationId,
      false,
    );
  }

  @Get(':id/parties')
  @Permissions(Permission.MATTER_READ)
  @ApiOperation({ summary: 'Get parties on a matter' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of parties' })
  async getParties(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ) {
    return this.matterService.getParties(id, organizationId);
  }
}
