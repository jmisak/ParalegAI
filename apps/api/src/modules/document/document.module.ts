import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentRepository } from './document.repository';
import { StorageService } from './storage.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository, StorageService],
  exports: [DocumentService, StorageService],
})
export class DocumentModule {}
