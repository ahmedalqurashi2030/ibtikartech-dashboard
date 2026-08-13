from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from ..models import AttributionTouch, Campaign


@pytest.mark.django_db
def test_campaign_end_cannot_precede_start():
    starts_at = timezone.now()
    campaign = Campaign(
        name="حملة الإطلاق",
        channel=Campaign.Channel.PAID_SOCIAL,
        starts_at=starts_at,
        ends_at=starts_at - timedelta(hours=1),
    )

    with pytest.raises(ValidationError) as exc_info:
        campaign.full_clean()

    assert "ends_at" in exc_info.value.message_dict


@pytest.mark.django_db
def test_anonymous_attribution_touch_is_supported():
    campaign = Campaign.objects.create(
        name="SEO",
        channel=Campaign.Channel.SEO,
        status=Campaign.Status.ACTIVE,
    )
    touch = AttributionTouch.objects.create(
        campaign=campaign,
        anonymous_session_id="session-1",
        touch_type=AttributionTouch.TouchType.FIRST_TOUCH,
        source="google",
        medium="organic",
        occurred_at=timezone.now(),
    )

    assert touch.contact_id is None
    assert touch.campaign_id == campaign.id
