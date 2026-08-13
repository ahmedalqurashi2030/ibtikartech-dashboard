from django.db import models


class InquiryType(models.TextChoices):
    SERVICE = "SERVICE", "Service"
    CONSULTATION = "CONSULTATION", "Consultation"
    QUOTE = "QUOTE", "Quote"
    GENERAL = "GENERAL", "General"


class InquiryStatus(models.TextChoices):
    NEW = "NEW", "New"
    REVIEWING = "REVIEWING", "Reviewing"
    RESPONDED = "RESPONDED", "Responded"
    CONVERTED = "CONVERTED", "Converted"
    CLOSED = "CLOSED", "Closed"
    SPAM = "SPAM", "Spam"


class OpportunityStage(models.TextChoices):
    NEW = "NEW", "New"
    CONTACTED = "CONTACTED", "Contacted"
    QUALIFIED = "QUALIFIED", "Qualified"
    QUOTE_SENT = "QUOTE_SENT", "Quote sent"
    NEGOTIATION = "NEGOTIATION", "Negotiation"
    WON = "WON", "Won"
    LOST = "LOST", "Lost"


class FollowUpType(models.TextChoices):
    CALL = "CALL", "Call"
    WHATSAPP = "WHATSAPP", "WhatsApp"
    EMAIL = "EMAIL", "Email"
    MEETING = "MEETING", "Meeting"
    GENERAL = "GENERAL", "General"


class FollowUpStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class QuoteStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SENT = "SENT", "Sent"
    VIEWED = "VIEWED", "Viewed"
    ACCEPTED = "ACCEPTED", "Accepted"
    REJECTED = "REJECTED", "Rejected"
    EXPIRED = "EXPIRED", "Expired"
    CANCELLED = "CANCELLED", "Cancelled"
