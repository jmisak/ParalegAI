import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AIGatewayService } from './services/ai-gateway.service';
import { PromptTemplateService } from './services/prompt-template.service';
import { TokenUsageService } from './services/token-usage.service';
import { JwtAuthGuard, RolesGuard, PermissionsGuard, TenantGuard } from '@common/guards';
import { CurrentUser, OrganizationId, Permissions, Permission } from '@common/decorators';
import { JwtPayload } from '@common/interfaces';
import {
  AnalyzeDocumentDto,
  GenerateDocumentDto,
  AIResponseDto,
  TokenUsageQueryDto,
} from './dto';

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PermissionsGuard)
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiGateway: AIGatewayService,
    private readonly promptService: PromptTemplateService,
    private readonly tokenUsageService: TokenUsageService,
  ) {}

  @Post('analyze')
  @Permissions(Permission.AI_ANALYZE)
  @ApiOperation({ summary: 'Analyze a document using AI' })
  @ApiResponse({ status: 200, description: 'Analysis complete', type: AIResponseDto })
  async analyzeDocument(
    @Body() dto: AnalyzeDocumentDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<AIResponseDto> {
    return this.aiGateway.analyzeDocument(dto, user.sub, organizationId);
  }

  @Post('generate')
  @Permissions(Permission.AI_GENERATE)
  @ApiOperation({ summary: 'Generate document content using AI' })
  @ApiResponse({ status: 200, description: 'Content generated', type: AIResponseDto })
  async generateContent(
    @Body() dto: GenerateDocumentDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<AIResponseDto> {
    return this.aiGateway.generateContent(dto, user.sub, organizationId);
  }

  @Post('review')
  @Permissions(Permission.AI_REVIEW)
  @ApiOperation({ summary: 'AI-assisted contract review' })
  @ApiResponse({ status: 200, description: 'Review complete', type: AIResponseDto })
  async reviewContract(
    @Body() dto: AnalyzeDocumentDto,
    @CurrentUser() user: JwtPayload,
    @OrganizationId() organizationId: string,
  ): Promise<AIResponseDto> {
    return this.aiGateway.reviewContract(dto, user.sub, organizationId);
  }

  @Get('templates')
  @Permissions(Permission.AI_ANALYZE)
  @ApiOperation({ summary: 'List available prompt templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async listTemplates() {
    return this.promptService.listTemplates();
  }

  @Get('usage')
  @Permissions(Permission.AI_ANALYZE)
  @ApiOperation({ summary: 'Get token usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  async getUsage(
    @Query() query: TokenUsageQueryDto,
    @OrganizationId() organizationId: string,
  ) {
    return this.tokenUsageService.getUsage(organizationId, query);
  }
}
