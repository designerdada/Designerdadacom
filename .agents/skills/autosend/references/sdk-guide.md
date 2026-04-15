# AutoSend SDK Guide

Complete TypeScript SDK examples for the AutoSend email API.

---

## Installation

```bash
npm install autosendjs
```

---

## Quick Start

### 1. Set your API key

```bash
export AUTOSEND_API_KEY="your_api_key_here"
```

Or add to `.env`:

```
AUTOSEND_API_KEY=your_api_key_here
```

### 2. Initialize the client

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY);
```

### 3. Send a test email

```typescript
await autosend.emails.send({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  to: { email: "test@example.com", name: "Test User" },
  subject: "Hello from AutoSend!",
  html: "<h1>It works!</h1><p>Your AutoSend integration is ready.</p>",
});
```

### 4. Verify it worked

Check your inbox. That's it!

---

## Send Email

### Basic Email

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY);

await autosend.emails.send({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  to: { email: "user@example.com", name: "John Doe" },
  subject: "Welcome aboard!",
  html: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
});
```

### Email with Plain Text Fallback

```typescript
await autosend.emails.send({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  to: { email: "user@example.com", name: "John Doe" },
  subject: "Your order confirmation",
  html: "<h1>Order Confirmed</h1><p>Order #12345 is on its way!</p>",
  text: "Order Confirmed. Order #12345 is on its way!",
});
```

### Minimal Example

```typescript
await autosend.emails.send({
  from: { email: "hello@yourdomain.com" },
  to: { email: "user@example.com" },
  subject: "Quick update",
  html: "<p>Just a quick note.</p>",
});
```

---

## Bulk Send

Send emails to multiple recipients with a shared sender, subject, and optional template.

### Basic Bulk Send

```typescript
await autosend.emails.bulk({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  subject: "Hello from AutoSend!",
  html: "<p>Hi {{name}}, welcome aboard!</p>",
  recipients: [
    { email: "user1@example.com", name: "User One" },
    { email: "user2@example.com", name: "User Two" },
    { email: "user3@example.com", name: "User Three" },
  ],
});
```

### Bulk Send with Template and Per-Recipient Data

```typescript
await autosend.emails.bulk({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  templateId: "tmpl_welcome",
  dynamicData: {
    companyName: "Acme Inc",
    year: "2025",
  },
  recipients: [
    {
      email: "alice@example.com",
      name: "Alice",
      dynamicData: { firstName: "Alice", plan: "Pro" },
    },
    {
      email: "bob@example.com",
      name: "Bob",
      dynamicData: { firstName: "Bob", plan: "Starter" },
    },
  ],
});
```

### Bulk Send with Loop

```typescript
const users = [
  { email: "alice@example.com", name: "Alice" },
  { email: "bob@example.com", name: "Bob" },
  { email: "charlie@example.com", name: "Charlie" },
];

await autosend.emails.bulk({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  subject: "Monthly Newsletter",
  templateId: "tmpl_newsletter",
  dynamicData: { month: "January" },
  recipients: users.map((user) => ({
    email: user.email,
    name: user.name,
    dynamicData: { firstName: user.name },
  })),
});
```

---

## Templates

Use pre-built templates with dynamic data.

### Order Confirmation Template

```typescript
await autosend.emails.send({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  to: { email: "user@example.com", name: "John Doe" },
  subject: "Your order is confirmed!",
  templateId: "tmpl_order_confirmation",
  dynamicData: {
    orderNumber: "12345",
    customerName: "John",
    orderTotal: "$99.99",
    estimatedDelivery: "March 15, 2025",
  },
});
```

### Welcome Email Template

```typescript
await autosend.emails.send({
  from: { email: "hello@yourdomain.com", name: "Your Company" },
  to: { email: "newuser@example.com", name: "Jane Smith" },
  subject: "Welcome to Our Platform!",
  templateId: "tmpl_welcome",
  dynamicData: {
    firstName: "Jane",
    activationLink: "https://yourapp.com/activate?token=abc123",
    supportEmail: "support@yourcompany.com",
  },
});
```

### Password Reset Template

```typescript
await autosend.emails.send({
  from: { email: "security@yourdomain.com", name: "Your Company Security" },
  to: { email: "user@example.com", name: "John Doe" },
  subject: "Reset your password",
  templateId: "tmpl_password_reset",
  dynamicData: {
    resetLink: "https://yourapp.com/reset?token=xyz789",
    expiresIn: "24 hours",
  },
});
```

---

## Contacts

Manage your contact lists.

### Create Contact

```typescript
await autosend.contacts.create({
  email: "newcontact@example.com",
  firstName: "Jane",
  lastName: "Smith",
  listIds: ["list_newsletter", "list_customers"],
  customFields: {
    company: "Acme Inc",
    plan: "premium",
    signupDate: "2025-01-15",
  },
});
```

### Get Contact

```typescript
const contact = await autosend.contacts.get("contact_abc123");

console.log(contact.email);
console.log(contact.firstName);
console.log(contact.customFields);
```

### Upsert Contact

Create or update a contact by email. Perfect for sync workflows.

```typescript
await autosend.contacts.upsert({
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  listIds: ["list_active_users"],
  customFields: {
    lastLogin: "2025-02-01",
    totalOrders: 5,
  },
});
```

### Delete Contact

```typescript
await autosend.contacts.delete("contact_abc123");
```

### Full Contact Workflow

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY);

// Create a new contact when user signs up
async function onUserSignup(user: { email: string; name: string }) {
  const [firstName, lastName] = user.name.split(" ");

  await autosend.contacts.create({
    email: user.email,
    firstName,
    lastName,
    listIds: ["list_new_signups"],
    customFields: {
      signupSource: "web",
      signupDate: new Date().toISOString(),
    },
  });

  // Send welcome email
  await autosend.emails.send({
    from: { email: "hello@yourdomain.com", name: "Your Company" },
    to: { email: user.email, name: user.name },
    subject: "Welcome!",
    templateId: "tmpl_welcome",
    dynamicData: { firstName },
  });
}
```

---

## Advanced

### TypeScript Types

```typescript
import { Autosend } from "autosendjs";

// Email types
interface EmailAddress {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  from: EmailAddress;
  to: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicData?: Record<string, unknown>;
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

interface SendEmailResponse {
  success: boolean;
  data: { emailId: string };
}

// Contact types
interface CreateContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  listIds?: string[];
  customFields?: Record<string, unknown>;
}

interface UpsertContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  listIds?: string[];
  customFields?: Record<string, unknown>;
}
```

### Error Handling

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY);

try {
  await autosend.emails.send({
    from: { email: "hello@yourdomain.com" },
    to: { email: "user@example.com" },
    subject: "Test",
    html: "<p>Test email</p>",
  });
  console.log("Email sent successfully!");
} catch (error) {
  if (error.code === "UNAUTHORIZED") {
    console.error("Invalid API key");
  } else if (error.code === "RATE_LIMIT_EXCEEDED") {
    console.error("Rate limited - try again later");
  } else if (error.code === "VALIDATION_FAILED") {
    console.error("Bad request:", error.message);
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

### SDK Configuration Options

```typescript
import { Autosend } from "autosendjs";

const autosend = new Autosend(process.env.AUTOSEND_API_KEY, {
  baseUrl: "https://api.autosend.com", // Custom API endpoint
  timeout: 30000, // Request timeout in ms (default: 30000)
  maxRetries: 3, // Retry failed requests (default: 3)
  debug: false, // Enable debug logging (default: false)
});
```

---

## Reference

- [SKILL.md](../SKILL.md) — REST API endpoints and parameter reference
- [API Guide](api-guide.md) — AutoSend API overview and concepts
- [API Reference](https://docs.autosend.com/api-reference/introduction) — Official AutoSend API reference
