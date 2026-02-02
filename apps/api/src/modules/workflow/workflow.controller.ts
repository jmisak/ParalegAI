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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import {
  CreateTaskDto,
  TaskQueryDto,
  TaskResponseDto,
  JobStatusDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard } from '@common/guards';
import { CurrentUser, OrganizationId, Permissions, Permission } from '@common/decorators';
import { JwtPayload, PaginatedResponse } from '@common/interfaces';

@ApiTags('workflows')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PermissionsGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('tasks')
  @Permissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Create a new workflow task' })
  @ApiResponse({ status: 201, description: 'Task created', type: TaskResponseDto })
  async createTask(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<TaskResponseDto> {
    return this.workflowService.createTask(dto, user.sub, organizationId);
  }

  @Get('tasks')
  @Permissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List workflow tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  async listTasks(
    @Query() query: TaskQueryDto,
    @OrganizationId() organizationId: string,
  ): Promise<PaginatedResponse<TaskResponseDto>> {
    return this.workflowService.listTasks(query, organizationId);
  }

  @Get('tasks/:id')
  @Permissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get task details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task details', type: TaskResponseDto })
  async getTask(
    @Param('id', ParseUUIDPipe) id: string,
    @OrganizationId() organizationId: string,
  ): Promise<TaskResponseDto> {
    return this.workflowService.getTask(id, organizationId);
  }

  @Post('tasks/:id/complete')
  @Permissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Mark task as complete' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task completed' })
  async completeTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<TaskResponseDto> {
    return this.workflowService.completeTask(id, user.sub, organizationId);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions(Permission.WORKFLOW_DELETE)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<void> {
    await this.workflowService.deleteTask(id, user.sub, organizationId);
  }

  @Get('jobs')
  @Permissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List queued jobs' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  async listJobs(
    @Query('queue') queue: string,
    @Query('status') status?: string,
  ): Promise<JobStatusDto[]> {
    return this.workflowService.listJobs(queue, status);
  }

  @Get('jobs/:jobId')
  @Permissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get job status' })
  @ApiParam({ name: 'jobId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Job status', type: JobStatusDto })
  async getJobStatus(
    @Param('jobId') jobId: string,
    @Query('queue') queue: string,
  ): Promise<JobStatusDto> {
    return this.workflowService.getJobStatus(queue, jobId);
  }

  @Post('process/document')
  @Permissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Queue a document for processing' })
  @ApiResponse({ status: 201, description: 'Document queued for processing' })
  async queueDocumentProcessing(
    @Body() body: { documentId: string; operations: string[] },
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<{ jobId: string }> {
    const jobId = await this.workflowService.queueDocumentProcessing(
      body.documentId,
      body.operations,
      user.sub,
      organizationId,
    );
    return { jobId };
  }

  @Get('deadlines')
  @Permissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get upcoming deadlines' })
  @ApiResponse({ status: 200, description: 'List of upcoming deadlines' })
  async getUpcomingDeadlines(
    @Query('days') days: number = 7,
    @OrganizationId() organizationId: string,
  ) {
    return this.workflowService.getUpcomingDeadlines(organizationId, days);
  }
}
