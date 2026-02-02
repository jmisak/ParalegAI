import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { FullTextSearchService } from './fulltext-search.service';
import { SemanticSearchService } from './semantic-search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, FullTextSearchService, SemanticSearchService],
  exports: [SearchService],
})
export class SearchModule {}
