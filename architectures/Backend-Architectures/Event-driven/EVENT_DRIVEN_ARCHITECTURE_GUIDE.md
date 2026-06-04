# Event-Driven Architecture: Complete Guide to Event Emission and Listening

## Table of Contents
1. [Overview](#overview)
2. [Process Flowchart](#process-flowchart)
3. [Conceptual Explanation](#conceptual-explanation)
4. [Detailed Step-by-Step Guide](#detailed-step-by-step-guide)
5. [Code Walkthrough](#code-walkthrough)
6. [Implementation Checklist](#implementation-checklist)

---

## Overview

This guide explains how the application implements an **asynchronous event-driven architecture** using domain events. When a critical business action occurs (like creating a bid), the system:

1. **Emits a domain event** from the service layer
2. **Event listeners react** to this event and perform necessary side operations
3. **Multiple listeners** can respond to the same event independently

### Key Benefits
- **Decoupling**: Controllers don't need to know about side effects
- **Reusability**: Multiple listeners can handle the same event
- **Maintainability**: Easy to add new listeners without modifying existing code
- **Scalability**: Can queue events for async processing later

---

## Process Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. HTTP REQUEST                                                 │
│    POST /jobs/:jobId/bids                                       │
│    With: CreateBidDto (price, message)                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CONTROLLER: createBid()                                      │
│    Location: job.controller.ts                                  │
│    - Receives HTTP request                                      │
│    - Extracts jobId, userId from context                        │
│    - Calls: bidService.create(jobId, userId, dto)              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. SERVICE: create()                                            │
│    Location: bid.service.ts                                     │
│    - Validates job exists                                       │
│    - Checks provider profile is complete                        │
│    - Saves bid to database                                      │
│    - Returns saved bid record                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. EVENT EMISSION                                               │
│    Location: bid.service.ts (inside create method)              │
│    - Creates new BidCreatedEvent instance                       │
│    - Calls: eventEmitter.emit(new BidCreatedEvent(...))        │
│    - Event contains: bidId, jobId, providerId, price, etc      │
└────────────────────┬────────────────────────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ LISTENER 1: Audit Log    │    │ LISTENER 2: Logging      │
│ audit-event.listener.ts  │    │ bid-created.handler.ts   │
│ onBidCreated()           │    │ handle()                 │
└──────────────────────────┘    └──────────────────────────┘
    │                                  │
    ▼                                  ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ 5a. LOG TO AUDIT TABLE   │    │ 5b. LOG TO APPLICATION   │
│ - Insert audit record    │    │ - Log bid details        │
│ - Store action: BID_PLACED│   │ - Include timestamp      │
│ - Track metadata         │    │ - For monitoring         │
└──────────────────────────┘    └──────────────────────────┘
    │                                  │
    └────────────────┬─────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE SENT TO CLIENT                                      │
│    HTTP 201: Created - Returns: Bid object                      │
│    { id, jobId, providerId, price, currency, createdAt, ... }  │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
TIME FLOW:
┌─────┬─────┬─────┬─────┬──────┬──────┬──────┐
│  1  │  2  │  3  │  4  │ 5a,  │      │  6   │
│ HTTP│ CTR │SVC  │EMT  │ 5b   │      │ RSP  │
│     │     │     │     │(ASYNC)      │      │
└─────┴─────┴─────┴─────┴──────┴──────┴──────┘
Steps 5a and 5b happen asynchronously or synchronously depending
on EventEmitter2 configuration. Steps 1-4 are synchronous.
```

---

## Conceptual Explanation

### What is a Domain Event?

A **domain event** is a representation of something important that happened in your business domain. Think of it like a notification system:

- **Event**: "A bid was created"
- **When**: After the bid is saved to the database
- **Who cares**: Audit system, logging system, notification system, etc.
- **What they do**: Take appropriate action based on the event

### The Publish-Subscribe Pattern

This architecture uses the **Publish-Subscribe (Pub-Sub)** pattern:

```
Service (Publisher)  -->  Emits Event  -->  Multiple Listeners (Subscribers)
```

- **Publisher**: The service that performs the action and emits the event
- **Event**: Data object containing information about what happened
- **Subscribers**: Multiple listeners that react to the event independently
- **Decoupling**: Publishers don't know or care who listens to their events

### Real-World Analogy

Imagine a restaurant order system:

1. **Waiter** (Controller) takes your order
2. **Kitchen** (Service) prepares your food and rings a bell (emits event)
3. **Multiple stations listen** to the bell:
   - Cashier updates the bill
   - Manager updates statistics
   - Quality checker inspects food
   - All happen independently because of the bell

Nobody has to hardcode "after cooking, do X, Y, Z" - they all listen to the bell.

---

## Detailed Step-by-Step Guide

### Step 1: HTTP Request Arrives at Controller

**What happens**: A provider submits a bid on a job.

```
HTTP Request:
POST /jobs/job-123-uuid/bids
Headers: Authorization: Bearer {token}
Body: { price: 500, message: "I can do this quickly" }
```

**Controller Receives**:
```typescript
// job.controller.ts
@Post(':id/bids')
createBid(
  @Param('id', ParseUUIDPipe) jobId: string,
  @Body() dto: CreateBidDto,
  @CurrentUser() user: AuthenticatedUser,
) {
  return this.bidService.create(jobId, user.id, dto);
}
```

### Step 2: Controller Calls Service Method

**What happens**: Controller delegates business logic to the service.

**Why**: Separation of concerns - controllers handle HTTP, services handle business logic.

**Flow**:
```typescript
this.bidService.create(
  jobId: "job-123",
  user.id: "provider-456",
  dto: { price: 500, message: "..." }
)
```

### Step 3: Service Executes Business Logic

**What happens**: Service performs all necessary validations and data operations.

```typescript
// bid.service.ts - create method (simplified)
async create(jobId: string, providerId: string, dto: CreateBidDto) {
  // Step 3a: Validate job exists
  const job = await this.jobRepository.findOne({
    where: { id: jobId },
    relations: { seeker: true }
  });
  if (!job) throw new NotFoundException(...);
  
  // Step 3b: Check provider profile is complete
  await this.assertProviderProfileComplete(providerId);
  
  // Step 3c: Create and save bid record
  const record = this.bidRepository.create({
    job: { id: jobId },
    provider: { id: providerId },
    price: dto.price,
  });
  const saved = await this.bidRepository.save(record);
  
  // Step 3d: [COMING NEXT] Emit event
  
  return saved;
}
```

**Important**: At this point, the bid is committed to the database. If something fails before this, the transaction rolls back.

### Step 4: Service Emits Event

**What happens**: After successful save, service creates and emits a domain event.

```typescript
// Still in bid.service.ts - create method
this.eventEmitter.emit(
  new BidCreatedEvent(
    saved.id,           // "bid-789"
    jobId,              // "job-123"
    providerId,         // "provider-456"
    Number(saved.price), // 500
    saved.currency,     // "AUD"
    dto.message         // "I can do this quickly"
  )
);
```

**The Event Object**:
```typescript
// bid-created.event.ts
export class BidCreatedEvent extends BaseEvent {
  static readonly EVENT_NAME = 'bid.created'; // Unique identifier
  
  constructor(
    public readonly bidId: string,
    public readonly jobId: string,
    public readonly providerId: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly message?: string,
  ) {
    super(BidCreatedEvent.EVENT_NAME); // Sets event name
  }
}
```

**Key Point**: The event contains only the data needed by listeners - not the entire Bid entity. This is intentional for loose coupling.

### Step 5a: Audit Listener Responds to Event

**What happens**: The audit listener catches the "bid.created" event and logs it.

```typescript
// audit-event.listener.ts
@Injectable()
export class AuditEventListener {
  constructor(private readonly auditService: AuditService) {}

  @OnEvent(BidCreatedEvent.EVENT_NAME) // Listens for 'bid.created'
  async onBidCreated(event: BidCreatedEvent): Promise<void> {
    // Extract data from event
    await this.safeLog({
      action: 'BID_PLACED',
      entityType: 'bid',
      entityId: event.bidId,
      actorId: event.providerId,
      metadata: {
        jobId: event.jobId,
        price: event.price,
        currency: event.currency
      },
    });
  }

  private async safeLog(params: any): Promise<void> {
    try {
      await this.auditService.log(params);
      // Inserts into audit_logs table
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${err}`);
      // Doesn't throw - audit failure shouldn't crash the system
    }
  }
}
```

**Audit Log Creation** (pseudocode):
```sql
INSERT INTO audit_logs (
  action,
  entity_type,
  entity_id,
  actor_id,
  metadata,
  created_at
) VALUES (
  'BID_PLACED',
  'bid',
  'bid-789',
  'provider-456',
  '{"jobId":"job-123","price":500,"currency":"AUD"}',
  NOW()
);
```

**Purpose**: 
- Compliance tracking
- User action history
- Debugging "who did what and when"
- Analytics

### Step 5b: Bid Created Handler Responds to Event

**What happens**: Another listener catches the same event and logs it to the application logger.

```typescript
// bid-created.handler.ts
@Injectable()
export class BidCreatedHandler {
  private readonly logger = new Logger(BidCreatedHandler.name);

  @OnEvent(BidCreatedEvent.EVENT_NAME) // Also listens for 'bid.created'
  handle(event: BidCreatedEvent): void {
    this.logger.log(
      `Bid created: id="${event.bidId}", jobId="${event.jobId}", ` +
      `providerId="${event.providerId}", at=${event.occurredAt.toISOString()}`
    );
  }
}
```

**What gets logged** (to application logs/console):
```
[Nest] 12345 - 03/31/2026, 2:30:45 PM     LOG [BidCreatedHandler]
Bid created: id="bid-789", jobId="job-123", providerId="provider-456", 
at=2026-03-31T02:30:45.123Z
```

**Purpose**:
- Real-time monitoring
- Debugging in development
- Alerting if something unusual happens
- Overall system health tracking

### Step 6: Response Returned to Client

**What happens**: Controller returns the created bid to the HTTP client.

```typescript
// The HTTP response
{
  "status": 201,
  "body": {
    "id": "bid-789",
    "jobId": "job-123",
    "providerId": "provider-456",
    "price": 500,
    "currency": "AUD",
    "message": "I can do this quickly",
    "createdAt": "2026-03-31T02:30:45.123Z",
    "status": "submitted",
    ...
  }
}
```

**Important**: The client gets the response **before** or **very soon after** listeners finish (depending on async configuration).

---

## Code Walkthrough

### 1. Creating the Event Class

**File**: `apps/api/src/modules/bids/events/bid-created.event.ts`

```typescript
// Imports
import { BaseEvent } from '../../../events/base.event';

// The Event Class
export class BidCreatedEvent extends BaseEvent {
  // Static constant for the event name (used for listener registration)
  static readonly EVENT_NAME = 'bid.created';

  constructor(
    // All data the listener might need
    public readonly bidId: string,
    public readonly jobId: string,
    public readonly providerId: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly message?: string, // Optional
  ) {
    // Call parent constructor with event name
    super(BidCreatedEvent.EVENT_NAME);
  }
}

// Parent Class (for reference)
// export abstract class BaseEvent {
//   public readonly occurredAt: Date;
//   constructor(public readonly eventName: string) {
//     this.occurredAt = new Date(); // Timestamp when event occurred
//   }
// }
```

**What to implement**:
1. ✅ Extend `BaseEvent`
2. ✅ Define `EVENT_NAME` as static constant
3. ✅ Add constructor parameters for all data listeners need
4. ✅ Call `super()` with the event name
5. ✅ Keep it simple - just data, no methods

---

### 2. Emitting the Event from Service

**File**: `apps/api/src/modules/bids/bid.service.ts`

```typescript
import { DomainEventEmitter } from '../../events/domain-event-emitter.service';
import { BidCreatedEvent } from './events/bid-created.event';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    // Inject the event emitter
    private readonly eventEmitter: DomainEventEmitter,
  ) {}

  async create(
    jobId: string,
    providerId: string,
    dto: CreateBidDto
  ): Promise<Bid> {
    // 1. Validate job exists
    const job = await this.jobRepository.findOne({
      where: { id: jobId } as any,
      relations: { seeker: true },
    });
    if (!job) throw new NotFoundException(`Job "${jobId}" not found`);

    // 2. Validate provider profile is complete
    await this.assertProviderProfileComplete(providerId);

    // 3. Create a new bid record
    const record = this.bidRepository.create({
      job: { id: jobId },
      provider: { id: providerId },
      price: dto.price,
    } as any) as unknown as Bid;

    // 4. Save to database
    const saved = await this.bidRepository.save(record);

    // ⭐ 5. EMIT EVENT (after successful save)
    this.eventEmitter.emit(
      new BidCreatedEvent(
        saved.id,               // bidId
        jobId,                  // jobId
        providerId,             // providerId
        Number(saved.price),    // price
        saved.currency,         // currency
        dto.message             // message (optional)
      ),
    );

    // 6. Return the saved bid
    return saved;
  }

  private async assertProviderProfileComplete(providerId: string): Promise<void> {
    // ... validation logic
  }
}
```

**Key Points**:
- ✅ Emit AFTER save succeeds (not before)
- ✅ If database save fails, event is never emitted
- ✅ Listeners don't block the response
- ✅ Import `DomainEventEmitter` and inject it
- ✅ Use `this.eventEmitter.emit()` to emit

---

### 3. Creating an Event Listener (Audit)

**File**: `apps/api/src/modules/audit/audit-event.listener.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter'; // NestJS decorator
import { AuditService } from './audit.service';
import { BidCreatedEvent } from '../bids/events/bid-created.event';

@Injectable() // Make it injectable
export class AuditEventListener {
  private readonly logger = new Logger(AuditEventListener.name);

  constructor(private readonly auditService: AuditService) {}

  // ⭐ LISTENER METHOD
  @OnEvent(BidCreatedEvent.EVENT_NAME) // Listen for 'bid.created'
  async onBidCreated(event: BidCreatedEvent): Promise<void> {
    // The event object is passed as parameter
    // Now perform necessary operations with the event data
    
    await this.safeLog({
      action: 'BID_PLACED',           // What happened
      entityType: 'bid',              // What entity
      entityId: event.bidId,          // Which entity
      actorId: event.providerId,      // Who did it
      metadata: {                     // Additional context
        jobId: event.jobId,
        price: event.price,
        currency: event.currency,
      },
    });
  }

  // Helper method to handle errors gracefully
  private async safeLog(params: Parameters<AuditService['log']>[0]): Promise<void> {
    try {
      // Call the audit service to save
      await this.auditService.log(params);
    } catch (err) {
      // Log error but don't throw - audit failure shouldn't crash the app
      this.logger.error(
        `Failed to write audit log [${params.action}]: ${(err as Error).message}`,
      );
    }
  }
}
```

**What to implement**:
1. ✅ Create an `@Injectable()` class
2. ✅ Inject any services you need (AuditService)
3. ✅ Create a method (conventionally `on{EventName}`)
4. ✅ Decorate with `@OnEvent(EventClass.EVENT_NAME)`
5. ✅ Accept the event as parameter
6. ✅ Extract data from event and perform operations
7. ✅ Handle errors gracefully

---

### 4. Creating a Simple Logging Listener

**File**: `apps/api/src/modules/bids/events/bid-created.handler.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BidCreatedEvent } from './bid-created.event';

@Injectable()
export class BidCreatedHandler {
  private readonly logger = new Logger(BidCreatedHandler.name);

  @OnEvent(BidCreatedEvent.EVENT_NAME)
  handle(event: BidCreatedEvent): void {
    // Simple logging - no database calls, no async
    this.logger.log(
      `Bid created: id="${event.bidId}", jobId="${event.jobId}", ` +
      `providerId="${event.providerId}", at=${event.occurredAt.toISOString()}`,
    );
  }
}
```

**Simpler than audit listener**:
- No async/await (pure logging)
- No try-catch (logging failures aren't critical)
- Just logs to console/file
- Useful for immediate monitoring

---

### 5. Registering Listeners in Module

Both listeners must be provided in the module:

**File**: `apps/api/src/modules/bids/bid.module.ts` (or wherever)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { BidCreatedHandler } from './events/bid-created.handler';
import { Bid } from '../../database/entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Job])],
  controllers: [BidController],
  providers: [
    BidService,
    BidCreatedHandler, // ⭐ Register the listener
  ],
})
export class BidModule {}
```

```typescript
// apps/api/src/modules/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditEventListener } from './audit-event.listener';
import { AuditService } from './audit.service';

@Module({
  providers: [
    AuditService,
    AuditEventListener, // ⭐ Register the listener
  ],
})
export class AuditModule {}
```

**Important**: If listeners aren't provided in any module, they won't work!

---

## Implementation Checklist

Use this checklist when implementing your own event-driven feature:

### 1. Planning Phase
- [ ] Identify the event: "What business action occurred?"
- [ ] Name it clearly: e.g., "UserRegistered", "PaymentProcessed", "JobCompleted"
- [ ] List all data listeners might need
- [ ] List all listeners that should react

### 2. Event Class Creation
- [ ] Create file: `src/modules/{feature}/events/{event-name}.event.ts`
- [ ] Class extends `BaseEvent`
- [ ] Define `static readonly EVENT_NAME = 'feature.action'`
- [ ] Constructor accepts all necessary data
- [ ] Call `super(EventName.EVENT_NAME)`

```typescript
// Template
export class MyFeatureCreatedEvent extends BaseEvent {
  static readonly EVENT_NAME = 'myfeature.created';

  constructor(
    public readonly id: string,
    public readonly name: string,
    // ... other properties
  ) {
    super(MyFeatureCreatedEvent.EVENT_NAME);
  }
}
```

### 3. Service Implementation
- [ ] Inject `DomainEventEmitter` in constructor
- [ ] After successful database save, emit the event
- [ ] Pass all necessary data to event constructor

```typescript
// Template
async create(dto: CreateDto): Promise<MyFeature> {
  // Validate & save...
  const record = await this.repository.save(entity);
  
  // Emit event
  this.eventEmitter.emit(
    new MyFeatureCreatedEvent(
      record.id,
      record.name,
      // ... other required properties
    )
  );
  
  return record;
}
```

### 4. Listener Creation
- [ ] For each listener, create a class decorated with `@Injectable()`
- [ ] Create method decorated with `@OnEvent(EventName.EVENT_NAME)`
- [ ] Method accepts event as parameter: `(event: EventName) => void`
- [ ] Inject services needed for the operation
- [ ] Implement the logic
- [ ] Handle errors gracefully

```typescript
// Template
@Injectable()
export class MyEventListener {
  constructor(private readonly someService: SomeService) {}

  @OnEvent(MyFeatureCreatedEvent.EVENT_NAME)
  async handle(event: MyFeatureCreatedEvent): Promise<void> {
    // Do something with event data
    await this.someService.doSomething(event.id, event.name);
  }
}
```

### 5. Module Registration
- [ ] Provide event class in module's `providers` array
- [ ] Ensure module is imported in app.module.ts

```typescript
@Module({
  providers: [
    MyFeatureService,
    MyEventListener, // ⭐ Register listener
  ],
})
export class MyFeatureModule {}
```

### 6. Testing
- [ ] Test that event is emitted after service method
- [ ] Mock event emitter: `jest.spyOn(emitter, 'emit')`
- [ ] Verify listener receives the event
- [ ] Test listener handles event correctly
- [ ] Test error handling in listeners

### 7. Documentation
- [ ] Document the event and its purpose
- [ ] List all listeners that respond to it
- [ ] Explain the business logic for each listener

---

## Advanced Concepts

### Multiple Listeners for One Event

Multiple listeners can respond to the same event independently:

```
BidCreatedEvent
    ├─ AuditEventListener (logs to database)
    ├─ BidCreatedHandler (logs to console)
    ├─ NotificationListener (sends email) [future]
    └─ AnalyticsListener (updates statistics) [future]
```

Each listener is independent. If one fails, others still run.

### Async vs Sync Listeners

```typescript
// Synchronous (blocks request if slow)
@OnEvent(MyEvent.EVENT_NAME)
handle(event: MyEvent): void { }

// Asynchronous (doesn't block request)
@OnEvent(MyEvent.EVENT_NAME)
async handle(event: MyEvent): Promise<void> { }
```

**For audit logging**: Use async because DB calls are slow.
**For simple logging**: Sync is fine.

### Error Handling in Listeners

```typescript
@OnEvent(MyEvent.EVENT_NAME)
async handle(event: MyEvent): Promise<void> {
  try {
    // Risky operation
    await this.service.doSomething(event.id);
  } catch (err) {
    // Log but don't throw
    this.logger.error(`Failed: ${err.message}`);
    // The main request won't fail
  }
}
```

**Important**: Listener failures should not crash the main request.

---

## Summary

Here's the complete flow in one diagram:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: CLIENT MAKES REQUEST                                    │
│ POST /jobs/job-123/bids with CreateBidDto                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: CONTROLLER RECEIVES & DELEGATES                         │
│ createBid(jobId, user, dto) → bidService.create(...)           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: SERVICE EXECUTES BUSINESS LOGIC                         │
│ - Validate job │ - Check profile │ - Save to DB                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: SERVICE EMITS EVENT                                     │
│ this.eventEmitter.emit(new BidCreatedEvent(...))               │
└──────────────────┬──────────────────────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐
│ LISTENER 1: Audit    │  │ LISTENER 2: Logging  │
│ onBidCreated() runs  │  │ handle() runs        │
└──────────────────────┘  └──────────────────────┘
      │                         │
      ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐
│ Audit log saved to DB│  │ Message logged       │
└──────────────────────┘  └──────────────────────┘
      │                         │
      └────────────┬────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: RESPONSE SENT TO CLIENT                                 │
│ HTTP 201: Created, with Bid object                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Decoupling**: Controller doesn't know about audit logging or listeners
2. **Reusability**: Other services can emit the same event
3. **Maintainability**: Add new listeners without modifying service code
4. **Error Isolation**: Listener failures don't break the main request
5. **Scalability**: Easy to add queue-based async processing later
6. **Traceability**: Events create a clear audit trail

---

## Testing Example

```typescript
// bid.service.spec.ts
describe('BidService.create', () => {
  it('should emit BidCreatedEvent after saving', async () => {
    // Arrange
    const emitSpy = jest.spyOn(eventEmitter, 'emit');
    
    // Act
    const result = await service.create('job-1', 'provider-1', {
      price: 500,
    } as CreateBidDto);
    
    // Assert
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: BidCreatedEvent.EVENT_NAME,
        bidId: result.id,
        jobId: 'job-1',
        providerId: 'provider-1',
        price: 500,
      })
    );
  });
});

// audit-event.listener.spec.ts
describe('AuditEventListener.onBidCreated', () => {
  it('should log bid creation to audit table', async () => {
    // Arrange
    const auditServiceSpy = jest.spyOn(auditService, 'log');
    const event = new BidCreatedEvent('bid-1', 'job-1', 'provider-1', 500, 'AUD');
    
    // Act
    await listener.onBidCreated(event);
    
    // Assert
    expect(auditServiceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'BID_PLACED',
        entityId: 'bid-1',
      })
    );
  });
});
```

---

## Next Steps

1. **Understand**: Review the bid creation flow in detail
2. **Identify**: Choose your own feature that needs event-driven logic
3. **Design**: Plan what event to create and who should listen
4. **Implement**: Follow the implementation checklist
5. **Test**: Test both emission and listening
6. **Deploy**: Add to your module and test end-to-end

Good luck implementing!
