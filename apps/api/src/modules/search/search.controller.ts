import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, SearchResultDto } from './dto';
import { JwtAuthGuard, TenantGuard } from '@common/guards';
import { OrganizationId } from '@common/decorators';

@ApiTags('search')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across matters, documents, and tasks' })
  @ApiResponse({ status: 200, description: 'Search results', type: SearchResultDto })
  async search(
    @Query() query: SearchQueryDto,
    @OrganizationId() organizationId: string,
  ): Promise<SearchResultDto> {
    return this.searchService.search(query, organizationId);
  }

  @Get('matters')
  @ApiOperation({ summary: 'Search matters only' })
  @ApiResponse({ status: 200, description: 'Matter search results' })
  async searchMatters(
    @Query() query: SearchQueryDto,
    @OrganizationId() organizationId: string,
  ) {
    return this.searchService.searchMatters(query, organizationId);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Search documents only' })
  @ApiResponse({ status: 200, description: 'Document search results' })
  async searchDocuments(
    @Query() query: SearchQueryDto,
    @OrganizationId() organizationId: string,
  ) {
    return this.searchService.searchDocuments(query, organizationId);
  }

  @Get('semantic')
  @ApiOperation({ summary: 'Semantic search using AI embeddings' })
  @ApiResponse({ status: 200, description: 'Semantic search results' })
  async semanticSearch(
    @Query() query: SearchQueryDto,
    @OrganizationId() organizationId: string,
  ) {
    return this.searchService.semanticSearch(query, organizationId);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions' })
  async getSuggestions(
    @Query('q') q: string,
    @OrganizationId() organizationId: string,
  ): Promise<string[]> {
    return this.searchService.getSuggestions(q, organizationId);
  }
}
