/**
 * IRONCLAD - Prisma Seed Script
 *
 * Seeds the database with sample data for development and testing.
 * Run with: pnpm db:seed
 */

import { PrismaClient, UserRole, MatterStatus, TransactionType, PropertyType, PartyType, PartyRole, DocumentStatus, TaskStatus, TaskPriority, DeadlineType, CommunicationChannel, CommunicationDirection, TrustTransactionType, ComplianceCheckType, ComplianceCheckStatus, WorkflowStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Helper to generate consistent UUIDs for referential integrity
function generateId(): string {
  return randomUUID();
}

async function main() {
  console.log('Seeding IRONCLAD database...');

  // ==========================================================================
  // ORGANIZATION
  // ==========================================================================
  const orgId = generateId();
  const organization = await prisma.organization.upsert({
    where: { slug: 'stark-law-group' },
    update: {},
    create: {
      id: orgId,
      name: 'Stark Law Group, PLLC',
      slug: 'stark-law-group',
      email: 'info@starklawgroup.com',
      phone: '(555) 123-4567',
      website: 'https://starklawgroup.com',
      address: {
        street: '100 Legal Plaza, Suite 500',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
      jurisdictions: ['TX', 'CA', 'NY'],
      settings: {
        timezone: 'America/Chicago',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        defaultBillingRate: 350.00,
        trustAccountRequired: true
      },
      trustAccountInfo: {
        bankName: 'First National Bank',
        accountType: 'IOLTA',
        routingNumber: '111000000',
        accountNumber: '****1234'
      }
    }
  });
  console.log(`Created organization: ${organization.name}`);

  // ==========================================================================
  // USERS
  // ==========================================================================
  const adminId = generateId();
  const attorneyId = generateId();
  const paralegalId = generateId();
  const assistantId = generateId();

  const users = await Promise.all([
    prisma.user.upsert({
      where: { organizationId_email: { organizationId: orgId, email: 'tony.stark@starklawgroup.com' } },
      update: {},
      create: {
        id: adminId,
        organizationId: orgId,
        email: 'tony.stark@starklawgroup.com',
        firstName: 'Tony',
        lastName: 'Stark',
        displayName: 'Tony Stark',
        role: UserRole.ADMIN,
        barNumber: '24087654',
        barState: 'TX',
        jurisdictions: ['TX', 'CA', 'NY'],
        isActive: true,
        emailVerified: true,
        mfaEnabled: true,
        preferences: {
          theme: 'dark',
          notifications: { email: true, sms: true, push: true }
        }
      }
    }),
    prisma.user.upsert({
      where: { organizationId_email: { organizationId: orgId, email: 'pepper.potts@starklawgroup.com' } },
      update: {},
      create: {
        id: attorneyId,
        organizationId: orgId,
        email: 'pepper.potts@starklawgroup.com',
        firstName: 'Pepper',
        lastName: 'Potts',
        displayName: 'Virginia Potts',
        role: UserRole.ATTORNEY,
        barNumber: '24098765',
        barState: 'TX',
        jurisdictions: ['TX'],
        isActive: true,
        emailVerified: true,
        preferences: {
          theme: 'light',
          notifications: { email: true, sms: false, push: true }
        }
      }
    }),
    prisma.user.upsert({
      where: { organizationId_email: { organizationId: orgId, email: 'happy.hogan@starklawgroup.com' } },
      update: {},
      create: {
        id: paralegalId,
        organizationId: orgId,
        email: 'happy.hogan@starklawgroup.com',
        firstName: 'Happy',
        lastName: 'Hogan',
        displayName: 'Happy Hogan',
        role: UserRole.PARALEGAL,
        jurisdictions: ['TX'],
        isActive: true,
        emailVerified: true,
        preferences: {
          theme: 'system',
          notifications: { email: true, sms: false, push: false }
        }
      }
    }),
    prisma.user.upsert({
      where: { organizationId_email: { organizationId: orgId, email: 'jarvis@starklawgroup.com' } },
      update: {},
      create: {
        id: assistantId,
        organizationId: orgId,
        email: 'jarvis@starklawgroup.com',
        firstName: 'J.A.R.V.I.S.',
        lastName: 'AI',
        displayName: 'JARVIS',
        role: UserRole.LEGAL_ASSISTANT,
        isActive: true,
        emailVerified: true,
        preferences: {
          theme: 'dark',
          notifications: { email: false, sms: false, push: false }
        }
      }
    })
  ]);
  console.log(`Created ${users.length} users`);

  // ==========================================================================
  // PARTIES (Clients, Lenders, etc.)
  // ==========================================================================
  const buyerPartyId = generateId();
  const sellerPartyId = generateId();
  const lenderPartyId = generateId();
  const titleCompanyId = generateId();

  const parties = await Promise.all([
    prisma.party.upsert({
      where: { id: buyerPartyId },
      update: {},
      create: {
        id: buyerPartyId,
        organizationId: orgId,
        partyType: PartyType.MARRIED_COUPLE,
        firstName: 'Peter',
        lastName: 'Parker',
        displayName: 'Peter and Mary Jane Parker',
        email: 'peter.parker@email.com',
        phone: '(555) 234-5678',
        mailingAddress: {
          street: '20 Ingram Street',
          city: 'Queens',
          state: 'NY',
          zipCode: '11375'
        },
        dateOfBirth: new Date('1990-08-10'),
        maritalStatus: 'married',
        usCitizen: true,
        identityVerified: true,
        identityVerifiedAt: new Date()
      }
    }),
    prisma.party.upsert({
      where: { id: sellerPartyId },
      update: {},
      create: {
        id: sellerPartyId,
        organizationId: orgId,
        partyType: PartyType.TRUST,
        lastName: 'Osborn Family Trust',
        displayName: 'Osborn Family Trust',
        email: 'trust@osbornfamily.com',
        phone: '(555) 345-6789',
        mailingAddress: {
          street: '500 Fifth Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10110'
        },
        trustDate: new Date('2015-03-15'),
        trustees: ['Norman Osborn', 'Harry Osborn'],
        identityVerified: true,
        identityVerifiedAt: new Date()
      }
    }),
    prisma.party.upsert({
      where: { id: lenderPartyId },
      update: {},
      create: {
        id: lenderPartyId,
        organizationId: orgId,
        partyType: PartyType.CORPORATION,
        lastName: 'Avengers National Bank',
        displayName: 'Avengers National Bank',
        email: 'closings@avengersbank.com',
        phone: '(555) 456-7890',
        stateOfFormation: 'DE',
        entityNumber: 'DE-12345678',
        dateOfFormation: new Date('1998-05-01'),
        mailingAddress: {
          street: '890 Fifth Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10021'
        },
        identityVerified: true,
        identityVerifiedAt: new Date()
      }
    }),
    prisma.party.upsert({
      where: { id: titleCompanyId },
      update: {},
      create: {
        id: titleCompanyId,
        organizationId: orgId,
        partyType: PartyType.CORPORATION,
        lastName: 'Shield Title Insurance Company',
        displayName: 'Shield Title Insurance Company',
        email: 'closings@shieldtitle.com',
        phone: '(555) 567-8901',
        stateOfFormation: 'TX',
        entityNumber: 'TX-87654321',
        mailingAddress: {
          street: '1000 Main Street',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701'
        },
        identityVerified: true,
        identityVerifiedAt: new Date()
      }
    })
  ]);
  console.log(`Created ${parties.length} parties`);

  // ==========================================================================
  // MATTER (Case/File)
  // ==========================================================================
  const matterId = generateId();
  const matter = await prisma.matter.upsert({
    where: { organizationId_fileNumber: { organizationId: orgId, fileNumber: '2024-RE-001' } },
    update: {},
    create: {
      id: matterId,
      organizationId: orgId,
      fileNumber: '2024-RE-001',
      name: 'Parker Purchase - 123 Main Street',
      description: 'Residential purchase transaction for the Parker family. Single family home in Austin, TX.',
      status: MatterStatus.ACTIVE,
      transactionType: TransactionType.PURCHASE,
      targetClosingDate: new Date('2024-03-15'),
      responsibleAttorneyId: attorneyId,
      originatingAttorneyId: adminId,
      jurisdiction: 'TX',
      county: 'Travis',
      conflictCheckCompleted: true,
      conflictCheckDate: new Date('2024-01-15'),
      engagementSigned: true,
      engagementDate: new Date('2024-01-16'),
      metadata: {
        source: 'referral',
        referralSource: 'Avengers National Bank',
        estimatedValue: 450000
      },
      billingRates: {
        attorney: 350.00,
        paralegal: 150.00
      }
    }
  });
  console.log(`Created matter: ${matter.fileNumber}`);

  // ==========================================================================
  // PROPERTY
  // ==========================================================================
  const propertyId = generateId();
  const property = await prisma.property.create({
    data: {
      id: propertyId,
      organizationId: orgId,
      matterId: matterId,
      propertyType: PropertyType.SINGLE_FAMILY,
      streetAddress: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      county: 'Travis',
      legalDescription: 'Lot 15, Block 3, RIVERSIDE HEIGHTS ADDITION, an addition to the City of Austin, Travis County, Texas, according to the map or plat thereof recorded in Volume 12, Page 45 of the Plat Records of Travis County, Texas.',
      parcelNumber: '01-2345-0015-0003',
      lot: '15',
      block: '3',
      subdivision: 'Riverside Heights Addition',
      acreage: 0.25,
      squareFeet: 2400,
      yearBuilt: 2018,
      units: 1,
      zoning: 'SF-3',
      assessedValue: 425000.00,
      assessedYear: 2023,
      annualTaxes: 8500.00,
      hoaName: 'Riverside Heights HOA',
      hoaDues: 150.00,
      surveyDate: new Date('2024-02-01'),
      surveyor: 'Atlas Surveying, Inc.',
      floodZone: 'X',
      latitude: 30.2672,
      longitude: -97.7431,
      metadata: {
        bedrooms: 4,
        bathrooms: 3,
        garage: '2-car attached',
        pool: false
      }
    }
  });
  console.log(`Created property: ${property.streetAddress}`);

  // ==========================================================================
  // TRANSACTION
  // ==========================================================================
  const transactionId = generateId();
  const transaction = await prisma.transaction.create({
    data: {
      id: transactionId,
      organizationId: orgId,
      matterId: matterId,
      purchasePrice: 450000.00,
      earnestMoney: 10000.00,
      earnestMoneyHolder: 'Shield Title Insurance Company',
      contractDate: new Date('2024-01-20'),
      contractDeadlines: {
        optionPeriod: '2024-01-30',
        financingContingency: '2024-02-15',
        appraisal: '2024-02-20',
        inspection: '2024-01-28',
        titleCommitment: '2024-02-10'
      },
      financingType: 'conventional',
      loanAmount: 360000.00,
      interestRate: 6.875,
      loanTermMonths: 360,
      loanType: 'fixed',
      downPayment: 90000.00,
      sellerConcessions: 5000.00,
      titleInsurancePremium: 2850.00,
      ownersPolicyAmount: 450000.00,
      lendersPolicyAmount: 360000.00,
      recordingFees: 125.00,
      surveyCost: 450.00,
      inspectionCost: 500.00,
      prorationDate: new Date('2024-03-15'),
      taxProration: 2125.00,
      hoaProration: 75.00,
      commissionDetails: {
        listingAgent: { name: 'Mary Jane Watson', brokerage: 'Daily Bugle Realty', rate: 3.0 },
        buyerAgent: { name: 'Ned Leeds', brokerage: 'Friendly Neighborhood Realty', rate: 3.0 }
      }
    }
  });
  console.log(`Created transaction for matter: ${matter.fileNumber}`);

  // ==========================================================================
  // MATTER PARTIES
  // ==========================================================================
  const matterParties = await Promise.all([
    prisma.matterParty.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        partyId: buyerPartyId,
        role: PartyRole.BUYER,
        isPrimary: true,
        isClient: true,
        notes: 'Primary contact is Peter Parker'
      }
    }),
    prisma.matterParty.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        partyId: sellerPartyId,
        role: PartyRole.SELLER,
        isPrimary: true,
        isClient: false
      }
    }),
    prisma.matterParty.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        partyId: lenderPartyId,
        role: PartyRole.LENDER,
        isPrimary: true,
        isClient: false
      }
    }),
    prisma.matterParty.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        partyId: titleCompanyId,
        role: PartyRole.TITLE_COMPANY,
        isPrimary: true,
        isClient: false
      }
    })
  ]);
  console.log(`Created ${matterParties.length} matter-party relationships`);

  // ==========================================================================
  // DOCUMENTS
  // ==========================================================================
  const contractDocId = generateId();
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        id: contractDocId,
        organizationId: orgId,
        matterId: matterId,
        title: 'One to Four Family Residential Contract (Resale)',
        description: 'Executed purchase contract between Parker and Osborn Family Trust',
        documentType: 'contract',
        status: DocumentStatus.EXECUTED,
        currentVersion: 1,
        mimeType: 'application/pdf',
        fileSize: 245678,
        storagePath: 'documents/2024-RE-001/contracts/purchase-contract-v1.pdf',
        storageBucket: 'ironclad-documents',
        originalFilename: 'TREC-1-4-Contract-Executed.pdf',
        tags: ['contract', 'executed', 'trec'],
        executedDate: new Date('2024-01-20'),
        executedBy: ['Peter Parker', 'Mary Jane Parker', 'Norman Osborn (Trustee)'],
        metadata: {
          trecForm: '1-4',
          optionFee: 100
        }
      }
    }),
    prisma.document.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Title Commitment',
        description: 'Preliminary title commitment from Shield Title',
        documentType: 'title_commitment',
        status: DocumentStatus.APPROVED,
        currentVersion: 1,
        mimeType: 'application/pdf',
        fileSize: 156789,
        storagePath: 'documents/2024-RE-001/title/commitment-v1.pdf',
        storageBucket: 'ironclad-documents',
        originalFilename: 'Title-Commitment-123-Main.pdf',
        tags: ['title', 'commitment'],
        metadata: {
          commitmentNumber: 'GF-2024-00123',
          effectiveDate: '2024-02-05'
        }
      }
    }),
    prisma.document.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Survey',
        description: 'Property survey by Atlas Surveying',
        documentType: 'survey',
        status: DocumentStatus.APPROVED,
        currentVersion: 1,
        mimeType: 'application/pdf',
        fileSize: 2345678,
        storagePath: 'documents/2024-RE-001/survey/survey-v1.pdf',
        storageBucket: 'ironclad-documents',
        originalFilename: 'Survey-123-Main-Street.pdf',
        tags: ['survey'],
        metadata: {
          surveyor: 'Atlas Surveying, Inc.',
          surveyDate: '2024-02-01',
          surveyType: 'Category 1A'
        }
      }
    })
  ]);
  console.log(`Created ${documents.length} documents`);

  // ==========================================================================
  // DOCUMENT VERSION
  // ==========================================================================
  await prisma.documentVersion.create({
    data: {
      organizationId: orgId,
      documentId: contractDocId,
      versionNumber: 1,
      createdById: paralegalId,
      storagePath: 'documents/2024-RE-001/contracts/purchase-contract-v1.pdf',
      fileSize: 245678,
      fileHash: 'sha256:abc123def456...',
      changeDescription: 'Initial executed version'
    }
  });
  console.log('Created document version');

  // ==========================================================================
  // DEADLINES
  // ==========================================================================
  const deadlines = await Promise.all([
    prisma.deadline.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Option Period Expires',
        description: 'Buyer option period ends - must terminate or waive by this date',
        deadlineType: DeadlineType.CONTRACTUAL,
        dueDate: new Date('2024-01-30T23:59:59'),
        priority: TaskPriority.HIGH,
        source: 'Contract Paragraph 23',
        calculationRule: {
          baseDate: 'contractDate',
          offsetDays: 10,
          excludeWeekends: false
        },
        completed: true,
        completedAt: new Date('2024-01-28')
      }
    }),
    prisma.deadline.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Financing Contingency',
        description: 'Buyer must obtain financing approval or provide waiver',
        deadlineType: DeadlineType.CONTRACTUAL,
        dueDate: new Date('2024-02-15T23:59:59'),
        priority: TaskPriority.CRITICAL,
        source: 'Contract Third Party Financing Addendum',
        completed: true,
        completedAt: new Date('2024-02-12')
      }
    }),
    prisma.deadline.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Closing Date',
        description: 'Target closing date per contract',
        deadlineType: DeadlineType.CONTRACTUAL,
        dueDate: new Date('2024-03-15T14:00:00'),
        priority: TaskPriority.CRITICAL,
        source: 'Contract Paragraph 9',
        completed: false
      }
    }),
    prisma.deadline.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Title Objection Period',
        description: 'Deadline to object to title commitment exceptions',
        deadlineType: DeadlineType.CONTRACTUAL,
        dueDate: new Date('2024-02-20T23:59:59'),
        priority: TaskPriority.HIGH,
        source: 'Contract Paragraph 6.D',
        completed: true,
        completedAt: new Date('2024-02-18')
      }
    })
  ]);
  console.log(`Created ${deadlines.length} deadlines`);

  // ==========================================================================
  // TASKS
  // ==========================================================================
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Order Title Commitment',
        description: 'Order title commitment from Shield Title',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-01-25'),
        estimatedHours: 0.5,
        actualHours: 0.25,
        category: 'title',
        startedAt: new Date('2024-01-22'),
        completedAt: new Date('2024-01-22'),
        assignments: {
          create: {
            organizationId: orgId,
            userId: paralegalId,
            isPrimary: true
          }
        }
      }
    }),
    prisma.task.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Review Title Commitment',
        description: 'Review title commitment for exceptions and requirements',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-02-10'),
        estimatedHours: 2.0,
        actualHours: 1.5,
        category: 'title',
        startedAt: new Date('2024-02-06'),
        completedAt: new Date('2024-02-06'),
        assignments: {
          create: {
            organizationId: orgId,
            userId: attorneyId,
            isPrimary: true
          }
        }
      }
    }),
    prisma.task.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Prepare Closing Documents',
        description: 'Prepare all closing documents including deed, bill of sale, etc.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-10'),
        estimatedHours: 4.0,
        category: 'closing',
        startedAt: new Date('2024-03-01'),
        assignments: {
          create: {
            organizationId: orgId,
            userId: paralegalId,
            isPrimary: true
          }
        }
      }
    }),
    prisma.task.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Review Closing Documents',
        description: 'Attorney review of all closing documents',
        status: TaskStatus.NOT_STARTED,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-12'),
        estimatedHours: 2.0,
        category: 'closing',
        assignments: {
          create: {
            organizationId: orgId,
            userId: attorneyId,
            isPrimary: true
          }
        }
      }
    }),
    prisma.task.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        title: 'Coordinate Closing',
        description: 'Coordinate with all parties for closing date, time, and location',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-03-08'),
        estimatedHours: 1.0,
        category: 'closing',
        assignments: {
          create: {
            organizationId: orgId,
            userId: paralegalId,
            isPrimary: true
          }
        }
      }
    })
  ]);
  console.log(`Created ${tasks.length} tasks`);

  // ==========================================================================
  // TIME ENTRIES
  // ==========================================================================
  const timeEntries = await Promise.all([
    prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: attorneyId,
        workDate: new Date('2024-01-16'),
        hours: 0.5,
        rate: 350.00,
        amount: 175.00,
        description: 'Initial client consultation; review of proposed transaction; engagement letter.',
        activityCode: 'CONF',
        isBillable: true,
        isBilled: true,
        invoiceDate: new Date('2024-02-01')
      }
    }),
    prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: paralegalId,
        workDate: new Date('2024-01-22'),
        hours: 0.25,
        rate: 150.00,
        amount: 37.50,
        description: 'Order title commitment from Shield Title.',
        activityCode: 'TITLE',
        isBillable: true,
        isBilled: true,
        invoiceDate: new Date('2024-02-01')
      }
    }),
    prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: attorneyId,
        workDate: new Date('2024-02-06'),
        hours: 1.5,
        rate: 350.00,
        amount: 525.00,
        description: 'Review title commitment; identify Schedule B exceptions; draft title objection letter.',
        activityCode: 'TITLE',
        isBillable: true,
        isBilled: false
      }
    }),
    prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: paralegalId,
        workDate: new Date('2024-03-01'),
        hours: 2.0,
        rate: 150.00,
        amount: 300.00,
        description: 'Begin preparation of closing documents; draft warranty deed.',
        activityCode: 'DOC',
        isBillable: true,
        isBilled: false
      }
    })
  ]);
  console.log(`Created ${timeEntries.length} time entries`);

  // ==========================================================================
  // COMMUNICATIONS
  // ==========================================================================
  const communications = await Promise.all([
    prisma.communication.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: attorneyId,
        channel: CommunicationChannel.EMAIL,
        direction: CommunicationDirection.OUTBOUND,
        subject: 'Welcome - Parker Purchase Transaction',
        content: 'Email to clients confirming engagement and outlining next steps in the transaction.',
        participants: ['peter.parker@email.com', 'pepper.potts@starklawgroup.com'],
        occurredAt: new Date('2024-01-16T10:30:00'),
        isPrivileged: true,
        isBillable: true
      }
    }),
    prisma.communication.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: paralegalId,
        channel: CommunicationChannel.EMAIL,
        direction: CommunicationDirection.OUTBOUND,
        subject: 'Title Order - 123 Main Street',
        content: 'Email to Shield Title ordering title commitment for the property.',
        participants: ['closings@shieldtitle.com', 'happy.hogan@starklawgroup.com'],
        occurredAt: new Date('2024-01-22T09:15:00'),
        isPrivileged: false,
        isBillable: true
      }
    }),
    prisma.communication.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: paralegalId,
        channel: CommunicationChannel.EMAIL,
        direction: CommunicationDirection.INBOUND,
        subject: 'RE: Title Order - 123 Main Street - Commitment Attached',
        content: 'Received title commitment from Shield Title. GF-2024-00123.',
        participants: ['closings@shieldtitle.com'],
        occurredAt: new Date('2024-02-05T14:22:00'),
        attachments: [{ filename: 'Title-Commitment-123-Main.pdf', size: 156789 }],
        isPrivileged: false,
        isBillable: false
      }
    }),
    prisma.communication.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        userId: attorneyId,
        channel: CommunicationChannel.PHONE,
        direction: CommunicationDirection.OUTBOUND,
        subject: 'Client call - title review',
        content: 'Called clients to discuss title commitment findings and explain standard exceptions.',
        participants: ['Peter Parker', '(555) 234-5678'],
        occurredAt: new Date('2024-02-08T16:00:00'),
        durationSeconds: 900,
        isPrivileged: true,
        isBillable: true
      }
    })
  ]);
  console.log(`Created ${communications.length} communications`);

  // ==========================================================================
  // TRUST TRANSACTIONS
  // ==========================================================================
  const trustTransactions = await Promise.all([
    prisma.trustTransaction.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        partyId: buyerPartyId,
        transactionType: TrustTransactionType.DEPOSIT,
        amount: 10000.00,
        runningBalance: 10000.00,
        transactionDate: new Date('2024-01-21'),
        payee: 'Peter and Mary Jane Parker',
        bankReference: 'DEP-20240121-001',
        description: 'Earnest money deposit received from buyers',
        bankAccountId: 'IOLTA-001',
        isReconciled: true,
        reconciledAt: new Date('2024-01-31')
      }
    })
  ]);
  console.log(`Created ${trustTransactions.length} trust transactions`);

  // ==========================================================================
  // TITLE RECORDS
  // ==========================================================================
  const titleRecords = await Promise.all([
    prisma.titleRecord.create({
      data: {
        organizationId: orgId,
        propertyId: propertyId,
        recordType: 'warranty_deed',
        recordingNumber: '2018-0123456',
        recordingDate: new Date('2018-06-15'),
        recordingBook: '12345',
        recordingPage: '678',
        instrumentDate: new Date('2018-06-10'),
        grantors: ['ABC Development, LLC'],
        grantees: ['Norman Osborn, Trustee of the Osborn Family Trust dated March 15, 2015'],
        consideration: 375000.00,
        searchDate: new Date('2024-02-05'),
        searchedBy: 'Shield Title Insurance Company'
      }
    }),
    prisma.titleRecord.create({
      data: {
        organizationId: orgId,
        propertyId: propertyId,
        recordType: 'deed_of_trust',
        recordingNumber: '2018-0123457',
        recordingDate: new Date('2018-06-15'),
        recordingBook: '12345',
        recordingPage: '690',
        instrumentDate: new Date('2018-06-10'),
        grantors: ['Norman Osborn, Trustee of the Osborn Family Trust'],
        grantees: ['First National Bank'],
        consideration: 300000.00,
        notes: 'To be paid off at closing',
        searchDate: new Date('2024-02-05'),
        searchedBy: 'Shield Title Insurance Company'
      }
    })
  ]);
  console.log(`Created ${titleRecords.length} title records`);

  // ==========================================================================
  // ENCUMBRANCES
  // ==========================================================================
  const encumbrances = await Promise.all([
    prisma.encumbrance.create({
      data: {
        organizationId: orgId,
        propertyId: propertyId,
        encumbranceType: 'DEED_OF_TRUST',
        description: 'Deed of Trust securing note to First National Bank',
        holder: 'First National Bank',
        originalAmount: 300000.00,
        currentBalance: 265000.00,
        recordingNumber: '2018-0123457',
        recordingDate: new Date('2018-06-15'),
        priorityPosition: 1,
        isCleared: false,
        exceptionNumber: 'B-3',
        notes: 'Payoff letter requested. Expected payoff: $264,532.18'
      }
    }),
    prisma.encumbrance.create({
      data: {
        organizationId: orgId,
        propertyId: propertyId,
        encumbranceType: 'EASEMENT',
        description: 'Utility easement - Austin Energy 10-foot easement along rear property line',
        holder: 'Austin Energy',
        recordingNumber: 'VOL-1234-PG-567',
        recordingDate: new Date('1995-03-20'),
        isCleared: false,
        exceptionNumber: 'B-5',
        notes: 'Standard utility easement - no action required'
      }
    }),
    prisma.encumbrance.create({
      data: {
        organizationId: orgId,
        propertyId: propertyId,
        encumbranceType: 'RESTRICTION',
        description: 'Riverside Heights Addition deed restrictions',
        holder: 'Riverside Heights HOA',
        recordingNumber: 'VOL-789-PG-123',
        recordingDate: new Date('1985-01-15'),
        isCleared: false,
        exceptionNumber: 'B-6',
        notes: 'Standard subdivision restrictions. HOA assessment is current.'
      }
    })
  ]);
  console.log(`Created ${encumbrances.length} encumbrances`);

  // ==========================================================================
  // COMPLIANCE CHECKS
  // ==========================================================================
  const complianceChecks = await Promise.all([
    prisma.complianceCheck.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        checkType: ComplianceCheckType.IDENTITY_VERIFICATION,
        subject: 'Peter Parker',
        status: ComplianceCheckStatus.PASSED,
        performedAt: new Date('2024-01-18'),
        expiresAt: new Date('2025-01-18'),
        serviceName: 'IDology',
        resultDetails: {
          verificationScore: 100,
          documentType: 'Drivers License',
          documentState: 'NY'
        },
        reviewedBy: 'Happy Hogan',
        reviewedAt: new Date('2024-01-18')
      }
    }),
    prisma.complianceCheck.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        checkType: ComplianceCheckType.SANCTIONS_SCREENING,
        subject: 'Peter Parker',
        status: ComplianceCheckStatus.PASSED,
        performedAt: new Date('2024-01-18'),
        expiresAt: new Date('2024-04-18'),
        serviceName: 'OFAC SDN Check',
        resultDetails: {
          listsChecked: ['SDN', 'Non-SDN', 'Sectoral Sanctions'],
          matchFound: false
        },
        reviewedBy: 'Happy Hogan',
        reviewedAt: new Date('2024-01-18')
      }
    }),
    prisma.complianceCheck.create({
      data: {
        organizationId: orgId,
        matterId: matterId,
        checkType: ComplianceCheckType.CONFLICT_CHECK,
        subject: 'Osborn Family Trust',
        status: ComplianceCheckStatus.PASSED,
        performedAt: new Date('2024-01-15'),
        serviceName: 'Internal Conflict Database',
        resultDetails: {
          searchTerms: ['Osborn', 'Norman Osborn', 'Harry Osborn', 'Osborn Family Trust'],
          priorMatters: [],
          conflictFound: false
        },
        reviewedBy: 'Pepper Potts',
        reviewedAt: new Date('2024-01-15'),
        notes: 'No conflicts identified. Cleared to proceed.'
      }
    })
  ]);
  console.log(`Created ${complianceChecks.length} compliance checks`);

  // ==========================================================================
  // DOCUMENT TEMPLATES
  // ==========================================================================
  const documentTemplates = await Promise.all([
    prisma.documentTemplate.create({
      data: {
        organizationId: orgId,
        name: 'General Warranty Deed',
        description: 'Standard general warranty deed for Texas residential transactions',
        documentType: 'deed',
        transactionTypes: [TransactionType.PURCHASE, TransactionType.SALE],
        jurisdictions: ['TX'],
        category: 'closing',
        templatePath: 'templates/tx/general-warranty-deed.docx',
        templateFormat: 'docx',
        variables: [
          { name: 'grantor_name', type: 'string', required: true },
          { name: 'grantee_name', type: 'string', required: true },
          { name: 'legal_description', type: 'text', required: true },
          { name: 'consideration', type: 'currency', required: true },
          { name: 'county', type: 'string', required: true }
        ],
        isDefault: true,
        isActive: true
      }
    }),
    prisma.documentTemplate.create({
      data: {
        organizationId: orgId,
        name: 'Bill of Sale (Personal Property)',
        description: 'Bill of sale for personal property conveyed with real estate',
        documentType: 'bill_of_sale',
        transactionTypes: [TransactionType.PURCHASE, TransactionType.SALE],
        jurisdictions: ['TX', 'CA', 'NY'],
        category: 'closing',
        templatePath: 'templates/common/bill-of-sale.docx',
        templateFormat: 'docx',
        variables: [
          { name: 'seller_name', type: 'string', required: true },
          { name: 'buyer_name', type: 'string', required: true },
          { name: 'property_address', type: 'string', required: true },
          { name: 'personal_property_list', type: 'text', required: true }
        ],
        isDefault: true,
        isActive: true
      }
    }),
    prisma.documentTemplate.create({
      data: {
        organizationId: orgId,
        name: 'Title Opinion Letter',
        description: 'Attorney title opinion letter for Texas properties',
        documentType: 'title_opinion',
        transactionTypes: [TransactionType.PURCHASE, TransactionType.OPINION_LETTER],
        jurisdictions: ['TX'],
        category: 'title',
        templatePath: 'templates/tx/title-opinion-letter.docx',
        templateFormat: 'docx',
        variables: [
          { name: 'addressee', type: 'string', required: true },
          { name: 'property_address', type: 'string', required: true },
          { name: 'legal_description', type: 'text', required: true },
          { name: 'vesting_owner', type: 'string', required: true },
          { name: 'exceptions', type: 'text', required: false }
        ],
        isDefault: true,
        isActive: true
      }
    })
  ]);
  console.log(`Created ${documentTemplates.length} document templates`);

  // ==========================================================================
  // WORKFLOW
  // ==========================================================================
  const workflowId = generateId();
  const workflow = await prisma.workflow.create({
    data: {
      id: workflowId,
      organizationId: orgId,
      name: 'Texas Residential Purchase',
      description: 'Standard workflow for residential purchase transactions in Texas',
      transactionTypes: [TransactionType.PURCHASE],
      jurisdictions: ['TX'],
      status: WorkflowStatus.ACTIVE,
      isDefault: true,
      config: {
        autoCreateTasks: true,
        autoCalculateDeadlines: true
      }
    }
  });

  const workflowSteps = await Promise.all([
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Intake and Conflict Check',
        description: 'Initial client intake, engagement letter, and conflict check',
        stepType: 'task',
        sortOrder: 1,
        assigneeRole: UserRole.PARALEGAL,
        estimatedHours: 1.0,
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Order Title',
        description: 'Order title commitment from title company',
        stepType: 'task',
        sortOrder: 2,
        assigneeRole: UserRole.PARALEGAL,
        estimatedHours: 0.5,
        deadlineRule: {
          baseDate: 'matterCreated',
          offsetDays: 3
        },
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Review Title Commitment',
        description: 'Attorney review of title commitment and exceptions',
        stepType: 'task',
        sortOrder: 3,
        assigneeRole: UserRole.ATTORNEY,
        estimatedHours: 2.0,
        deadlineRule: {
          baseDate: 'titleCommitmentReceived',
          offsetDays: 5
        },
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Survey Review',
        description: 'Review survey for encroachments and easements',
        stepType: 'task',
        sortOrder: 4,
        assigneeRole: UserRole.ATTORNEY,
        estimatedHours: 1.0,
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Prepare Closing Documents',
        description: 'Prepare all closing documents',
        stepType: 'task',
        sortOrder: 5,
        assigneeRole: UserRole.PARALEGAL,
        estimatedHours: 4.0,
        deadlineRule: {
          baseDate: 'closingDate',
          offsetDays: -5
        },
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Attorney Document Review',
        description: 'Attorney review and approval of closing documents',
        stepType: 'task',
        sortOrder: 6,
        assigneeRole: UserRole.ATTORNEY,
        estimatedHours: 2.0,
        deadlineRule: {
          baseDate: 'closingDate',
          offsetDays: -3
        },
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Closing',
        description: 'Conduct closing, collect signatures, disburse funds',
        stepType: 'task',
        sortOrder: 7,
        assigneeRole: UserRole.ATTORNEY,
        estimatedHours: 2.0,
        isRequired: true
      }
    }),
    prisma.workflowStep.create({
      data: {
        organizationId: orgId,
        workflowId: workflowId,
        name: 'Post-Closing',
        description: 'Record documents, issue final title policy, close file',
        stepType: 'task',
        sortOrder: 8,
        assigneeRole: UserRole.PARALEGAL,
        estimatedHours: 2.0,
        deadlineRule: {
          baseDate: 'closingDate',
          offsetDays: 30
        },
        isRequired: true
      }
    })
  ]);
  console.log(`Created workflow with ${workflowSteps.length} steps`);

  // ==========================================================================
  // AUDIT LOG (Sample entries)
  // ==========================================================================
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: adminId,
        matterId: matterId,
        action: 'CREATE',
        entityType: 'Matter',
        entityId: matterId,
        description: 'Created new matter: Parker Purchase - 123 Main Street',
        newValues: { fileNumber: '2024-RE-001', status: 'INTAKE' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
      }
    }),
    prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: attorneyId,
        matterId: matterId,
        action: 'STATUS_CHANGE',
        entityType: 'Matter',
        entityId: matterId,
        description: 'Changed matter status from INTAKE to ACTIVE',
        previousValues: { status: 'INTAKE' },
        newValues: { status: 'ACTIVE' },
        ipAddress: '192.168.1.101'
      }
    })
  ]);
  console.log(`Created ${auditLogs.length} audit log entries`);

  console.log('\nSeed completed successfully!');
  console.log('==========================================');
  console.log('Summary:');
  console.log(`- 1 Organization: ${organization.name}`);
  console.log(`- ${users.length} Users`);
  console.log(`- ${parties.length} Parties`);
  console.log(`- 1 Matter: ${matter.fileNumber}`);
  console.log(`- 1 Property`);
  console.log(`- 1 Transaction`);
  console.log(`- ${matterParties.length} Matter-Party relationships`);
  console.log(`- ${documents.length} Documents`);
  console.log(`- ${deadlines.length} Deadlines`);
  console.log(`- ${tasks.length} Tasks`);
  console.log(`- ${timeEntries.length} Time Entries`);
  console.log(`- ${communications.length} Communications`);
  console.log(`- ${trustTransactions.length} Trust Transactions`);
  console.log(`- ${titleRecords.length} Title Records`);
  console.log(`- ${encumbrances.length} Encumbrances`);
  console.log(`- ${complianceChecks.length} Compliance Checks`);
  console.log(`- ${documentTemplates.length} Document Templates`);
  console.log(`- 1 Workflow with ${workflowSteps.length} steps`);
  console.log('==========================================');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
