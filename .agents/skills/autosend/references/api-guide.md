# AutoSend SDK API Reference

Quick reference for SDK methods, parameters, and types.

---

## SDK Initialization

```typescript
import { Autosend } from 'autosendjs';

const autosend = new Autosend(apiKey: string, options?: AutosendOptions);
```

### AutosendOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | `https://api.autosend.com/v1` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `maxRetries` | `number` | `3` | Max retry attempts for failed requests |
| `debug` | `boolean` | `false` | Enable debug logging |

---

## Email Methods

### emails.send()

Send a single email.

```typescript
autosend.emails.send(request: SendEmailRequest): Promise<SendEmailResponse>
```

#### SendEmailRequest

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | `EmailAddress` | Yes | Sender email and optional name |
| `to` | `EmailAddress` | Yes | Recipient email and optional name |
| `subject` | `string` | Yes | Email subject line |
| `text` | `string` | No | Plain text body |
| `html` | `string` | No | HTML body |
| `templateId` | `string` | No | Template ID for templated emails |
| `dynamicData` | `Record<string, any>` | No | Template variable substitutions |
| `cc` | `EmailAddress[]` | No | CC recipients |
| `bcc` | `EmailAddress[]` | No | BCC recipients |
| `replyTo` | `EmailAddress` | No | Reply-to address |
| `attachments` | `Array<{ filename: string; content: string }>` | No | File attachments |
| `unsubscribeGroupId` | `string` | No | Unsubscribe group ID |

#### EmailAddress

```typescript
interface EmailAddress {
  email: string;
  name?: string;
}
```

---

### emails.bulk()

Send emails to multiple recipients with shared sender configuration.

```typescript
autosend.emails.bulk(request: BulkSendEmailOptions): Promise<BulkSendEmailResponse>
```

#### BulkSendEmailOptions

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | `EmailAddress` | Yes | Shared sender email and optional name |
| `subject` | `string` | No | Shared subject line (required unless template provides it) |
| `html` | `string` | No | Shared HTML body |
| `text` | `string` | No | Shared plain text body |
| `templateId` | `string` | No | Template ID for templated emails |
| `dynamicData` | `Record<string, string \| number>` | No | Shared default template variables |
| `recipients` | `BulkRecipient[]` | Yes | Array of recipients (max 100) |

#### BulkRecipient

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Recipient email address |
| `name` | `string` | No | Recipient display name |
| `dynamicData` | `Record<string, string \| number>` | No | Per-recipient variables (overrides shared) |
| `cc` | `EmailAddress[]` | No | Per-recipient CC |
| `bcc` | `EmailAddress[]` | No | Per-recipient BCC |

**Limit:** Maximum 100 recipients per bulk request.

---

## Contact Methods

### contacts.create()

Create a new contact.

```typescript
autosend.contacts.create(request: ContactCreateRequest): Promise<Contact>
```

#### ContactCreateRequest

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Contact email address |
| `firstName` | `string` | No | Contact first name |
| `lastName` | `string` | No | Contact last name |
| `listIds` | `string[]` | No | Lists to add contact to |
| `userId` | `string` | No | External user ID |
| `customFields` | `Record<string, any>` | No | Custom field values |

---

### contacts.get()

Retrieve a contact by ID.

```typescript
autosend.contacts.get(contactId: string): Promise<Contact>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `contactId` | `string` | Yes | Contact ID |

---

### contacts.upsert()

Create or update a contact by email.

```typescript
autosend.contacts.upsert(request: ContactUpsertRequest): Promise<Contact>
```

#### ContactUpsertRequest

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | `string` | Yes | Contact email address |
| `firstName` | `string` | No | Contact first name |
| `lastName` | `string` | No | Contact last name |
| `userId` | `string` | No | External user ID |
| `customFields` | `Record<string, any>` | No | Custom field values |

---

### contacts.delete()

Delete a contact by ID.

```typescript
autosend.contacts.delete(contactId: string): Promise<void>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `contactId` | `string` | Yes | Contact ID |

---

## TypeScript Interfaces

```typescript
interface AutosendOptions {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
}

interface EmailAddress {
  email: string;
  name?: string;
}

interface SendEmailRequest {
  from: EmailAddress;
  to: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicData?: Record<string, any>;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  attachments?: Array<{ filename: string; content: string }>;
  unsubscribeGroupId?: string;
}

interface BulkRecipient {
  email: string;
  name?: string;
  dynamicData?: Record<string, string | number>;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
}

interface BulkSendEmailOptions {
  from: EmailAddress;
  subject?: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicData?: Record<string, string | number>;
  recipients: BulkRecipient[];
}

interface ContactCreateRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  listIds?: string[];
  customFields?: Record<string, any>;
}

interface ContactUpsertRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  customFields?: Record<string, any>;
}

interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  listIds: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface SendEmailResponse {
  success: boolean;
  data: { emailId: string };
}

interface BulkSendEmailResponse {
  success: boolean;
  data?: {
    batchId: string;
    totalRecipients: number;
    successCount: number;
    failedCount: number;
  };
  error?: string;
}
```

---

## Error Handling

### Common Errors

| Error Message | Cause | Resolution |
|---------------|-------|------------|
| `Invalid or expired API key` | API key is incorrect or revoked | Verify API key in dashboard, regenerate if needed |
| `Request timeout` | Request exceeded timeout limit | Increase `timeout` option or reduce batch size |
| `Domain not verified` | Sending domain lacks DNS verification | Configure SPF/DKIM/DMARC records in DNS |
| `Rate limit exceeded` | Too many requests in time window | Implement exponential backoff retry logic |
| `Plan upgrade required` | Feature not available on current plan | Upgrade plan in dashboard |
| `Insufficient permissions` | API key lacks required permissions | Check API key permissions in dashboard |

### Error Handling Pattern

```typescript
try {
  await autosend.emails.send(request);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Implement exponential backoff
  } else if (error.code === 'UNAUTHORIZED') {
    // Check credentials
  } else {
    // Handle other errors
  }
}
```

---

## Rate Limits

Rate limits vary by plan. Check official AutoSend documentation for current limits.

General guidance:
- Use `emails.bulk()` for batch operations
- Implement exponential backoff for retries
- Monitor for `Rate limit exceeded` errors
