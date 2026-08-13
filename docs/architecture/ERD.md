# ERD v1.0 — Ibtikar Tech Dashboard

هذا المستند هو المرجع الأساسي لعلاقات البيانات في الإصدار الأول.

```mermaid
erDiagram
    USER ||--o| STAFF_PROFILE : has
    USER ||--o| CONTACT : linked_to

    CONTACT ||--o{ ORGANIZATION_CONTACT : belongs_to
    ORGANIZATION ||--o{ ORGANIZATION_CONTACT : has

    CONTACT ||--o{ STORE : owns
    ORGANIZATION o|--o{ STORE : operates

    CONTACT ||--o{ CONSENT_RECORD : gives
    CONTACT ||--o{ ACTIVITY_EVENT : has

    SERVICE_CATEGORY ||--o{ SERVICE : contains

    CONTACT ||--o{ INQUIRY : submits
    SERVICE o|--o{ INQUIRY : concerns

    INQUIRY o|--o| OPPORTUNITY : creates
    CONTACT ||--o{ OPPORTUNITY : has
    ORGANIZATION o|--o{ OPPORTUNITY : has
    STORE o|--o{ OPPORTUNITY : relates_to
    SERVICE o|--o{ OPPORTUNITY : interested_in

    OPPORTUNITY ||--o{ FOLLOW_UP_TASK : has
    OPPORTUNITY ||--o{ QUOTE : receives

    QUOTE ||--|{ QUOTE_ITEM : contains
    SERVICE o|--o{ QUOTE_ITEM : source

    QUOTE o|--o{ PROJECT : creates
    CONTACT ||--o{ PROJECT : owns
    ORGANIZATION o|--o{ PROJECT : belongs_to
    STORE o|--o{ PROJECT : targets

    PROJECT ||--o{ PROJECT_STAGE : contains
    PROJECT ||--o{ PROJECT_UPDATE : has
    PROJECT ||--o{ PROJECT_FILE : has
    PROJECT ||--o{ APPROVAL : has

    CONTACT ||--o{ SUPPORT_TICKET : opens
    PROJECT o|--o{ SUPPORT_TICKET : related_to
    SUPPORT_TICKET ||--o{ TICKET_MESSAGE : contains

    CONTACT ||--o{ SAVED_SERVICE : saves
    SERVICE ||--o{ SAVED_SERVICE : saved

    CONTACT ||--o| CUSTOMER_PREFERENCE : has

    CAMPAIGN ||--o{ ATTRIBUTION_TOUCH : produces
    CONTACT o|--o{ ATTRIBUTION_TOUCH : attributed_to

    CONTACT o|--o{ ANALYTICS_EVENT : generates
    USER o|--o{ ANALYTICS_EVENT : generates
    SERVICE o|--o{ ANALYTICS_EVENT : concerns
```

## Core entities

### Accounts
- `User`
- `StaffProfile`

### CRM
- `Contact`
- `Organization`
- `OrganizationContact`
- `Store`
- `ConsentRecord`
- `ActivityEvent`

### Services
- `ServiceCategory`
- `Service`

> لا توجد ServiceFamily / ServicePackage / ServiceAddon في V1.

### Sales
- `Inquiry`
- `Opportunity`
- `FollowUpTask`
- `Quote`
- `QuoteItem`

### Customer portal
- `SavedService`
- `CustomerPreference`

### Projects
- `Project`
- `ProjectStage`
- `ProjectUpdate`
- `ProjectFile`
- `Approval`

### Support
- `SupportTicket`
- `TicketMessage`

### Marketing / Analytics
- `Campaign`
- `AttributionTouch`
- `AnalyticsEvent`

### Core audit
- `AuditLog`

## Identity rule

```text
User = authentication identity
Contact = CRM person
```

`Contact.user` nullable OneToOne. الضيف يمكن أن يصبح مستخدمًا لاحقًا دون فقدان تاريخه التجاري.

## CRM flow

```text
Contact
  -> Inquiry
  -> Opportunity
  -> Quote
  -> Project
```

`whatsapp_click` لا ينشئ Inquiry أو Opportunity؛ يسجل كـAnalyticsEvent فقط.

## Service catalog

```text
ServiceCategory
      -> Service
```

`Service` يحمل السعر ونوعه والتفاصيل والمخرجات والمتطلبات والمدة وطريقة الإجراء.

## Tharaa

ثراء ليست كيانًا داخل ERD التجاري في V1. هي صفحة Wagtail تسويقية، ويمكنها عرض Services مرتبطة من الكتالوج وروابط Demo/Marketplace خارجية.

## Future commerce boundary

غير منفذة في V1:

```mermaid
erDiagram
    QUOTE o|--o| ORDER : converts_to
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--o{ PAYMENT : receives
    ORDER ||--o{ INVOICE : generates
    PAYMENT ||--o{ REFUND : refunds
```

عند تشغيل الدفع المباشر فقط نضيف `Order`, `OrderItem`, `Payment`, `Invoice`, `Refund` دون تغيير CRM الأساسي.
