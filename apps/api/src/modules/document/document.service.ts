import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { DocumentRepository } from './document.repository';
import { StorageService } from './storage.service';
import {
  CreateDocumentDto,
  DocumentQueryDto,
  DocumentResponseDto,
} from './dto';
import { PaginatedResponse } from '@common/interfaces';
import { paginate } from '@common/dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Upload a new document
   */
  async upload(
    file: Express.Multer.File,
    dto: CreateDocumentDto,
    userId: string,
    organizationId: string,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Uploading document: ${file.originalname} for org: ${organizationId}`);

    // Upload file to storage
    const storagePath = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      organizationId,
    );

    // Calculate file hash for deduplication
    const fileHash = await this.storageService.calculateHash(file.buffer);

    // Create document record
    const document = await this.documentRepository.create({
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath,
      fileHash,
      matterId: dto.matterId,
      category: dto.category,
      tags: dto.tags,
      isPrivileged: dto.isPrivileged || false,
      organizationId,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.toResponseDto(document);
  }

  /**
   * Find all documents with filtering
   */
  async findAll(
    query: DocumentQueryDto,
    organizationId: string,
  ): Promise<PaginatedResponse<DocumentResponseDto>> {
    const { data, total } = await this.documentRepository.findMany(
      {
        matterId: query.matterId,
        category: query.category,
        search: query.search,
        tags: query.tags,
      },
      organizationId,
      {
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );

    return paginate(data.map(this.toResponseDto), total, query);
  }

  /**
   * Find a single document by ID
   */
  async findOne(id: string, organizationId: string): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findById(id, organizationId);

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return this.toResponseDto(document);
  }

  /**
   * Download document file
   */
  async download(
    id: string,
    organizationId: string,
  ): Promise<{ stream: Readable; document: DocumentResponseDto }> {
    const document = await this.findOne(id, organizationId);
    const docRecord = await this.documentRepository.findById(id, organizationId);

    if (!docRecord) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const stream = await this.storageService.downloadFile(docRecord['storage_path'] as string);

    // Log download for audit
    await this.documentRepository.logAccess(id, 'download');

    return { stream, document };
  }

  /**
   * Get document version history
   */
  async getVersionHistory(id: string, organizationId: string) {
    // Verify document exists
    await this.findOne(id, organizationId);

    return this.documentRepository.getVersionHistory(id);
  }

  /**
   * Create a new version of a document
   */
  async createVersion(
    documentId: string,
    file: Express.Multer.File,
    userId: string,
    organizationId: string,
  ): Promise<DocumentResponseDto> {
    // Verify document exists
    const existing = await this.documentRepository.findById(documentId, organizationId);
    if (!existing) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Upload new file
    const storagePath = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      organizationId,
    );

    const fileHash = await this.storageService.calculateHash(file.buffer);

    // Create new version (immutable - creates new record)
    const newVersion = await this.documentRepository.createVersion(documentId, {
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath,
      fileHash,
      createdBy: userId,
    });

    return this.toResponseDto(newVersion);
  }

  /**
   * Soft delete a document
   */
  async remove(id: string, userId: string, organizationId: string): Promise<void> {
    // Verify document exists
    await this.findOne(id, organizationId);

    await this.documentRepository.softDelete(id, userId);
  }

  /**
   * Generate a share link for a document
   */
  async generateShareLink(
    documentId: string,
    userId: string,
    organizationId: string,
    expiresInHours: number,
  ): Promise<{ shareUrl: string; expiresAt: Date }> {
    // Verify document exists and user has access
    const document = await this.documentRepository.findById(documentId, organizationId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Generate presigned URL
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const shareUrl = await this.storageService.getPresignedUrl(
      document['storage_path'] as string,
      expiresInHours * 3600,
    );

    // Log share action
    await this.documentRepository.logAccess(documentId, 'share', { sharedBy: userId, expiresAt });

    return { shareUrl, expiresAt };
  }

  /**
   * Transform entity to response DTO
   */
  private toResponseDto(doc: Record<string, unknown>): DocumentResponseDto {
    return {
      id: doc['id'] as string,
      fileName: doc['file_name'] as string,
      mimeType: doc['mime_type'] as string,
      fileSize: doc['file_size'] as number,
      matterId: doc['matter_id'] as string | undefined,
      category: doc['category'] as string | undefined,
      tags: doc['tags'] as string[] | undefined,
      isPrivileged: doc['is_privileged'] as boolean,
      version: doc['version'] as number,
      organizationId: doc['organization_id'] as string,
      createdAt: doc['created_at'] as Date,
      updatedAt: doc['updated_at'] as Date,
      createdBy: doc['created_by'] as string,
    };
  }
}
