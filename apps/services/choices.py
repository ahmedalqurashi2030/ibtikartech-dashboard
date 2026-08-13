from django.db import models


class PriceType(models.TextChoices):
    FIXED = "FIXED", "Fixed"
    STARTING_FROM = "STARTING_FROM", "Starting from"
    QUOTE = "QUOTE", "Request quote"
    FREE = "FREE", "Free"


class ActionType(models.TextChoices):
    WHATSAPP = "WHATSAPP", "WhatsApp"
    REQUEST_QUOTE = "REQUEST_QUOTE", "Request quote"
    INTERNAL_CHECKOUT = "INTERNAL_CHECKOUT", "Internal checkout"
    EXTERNAL_CHECKOUT = "EXTERNAL_CHECKOUT", "External checkout"
    DISABLED = "DISABLED", "Disabled"
