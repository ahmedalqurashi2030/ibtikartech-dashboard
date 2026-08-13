import pytest
from wagtail.models import Page

from apps.services.models import Service, ServiceCategory

from ..models import PlatformPage, SolutionPage, TharaaPage


@pytest.mark.django_db
def test_solution_page_can_editorially_link_existing_services():
    root = Page.get_first_root_node()
    category = ServiceCategory.objects.create(name="المتاجر", slug="stores")
    service = Service.objects.create(
        category=category,
        name="تحسين صفحة المنتج",
        slug="product-page-optimization",
    )
    page = SolutionPage(title="ارفع مبيعاتك", slug="grow-sales")
    root.add_child(instance=page)
    page.related_services.add(service)

    assert list(page.related_services.all()) == [service]


@pytest.mark.django_db
def test_platform_page_is_editorial_not_service_hierarchy():
    root = Page.get_first_root_node()
    page = PlatformPage(
        title="خدمات سلة",
        slug="salla",
        platform_name="Salla",
    )
    root.add_child(instance=page)

    assert page.platform_name == "Salla"
    assert page.related_services.count() == 0


@pytest.mark.django_db
def test_tharaa_remains_a_marketing_page():
    root = Page.get_first_root_node()
    page = TharaaPage(
        title="ثيم ثراء",
        slug="tharaa",
        marketplace_url="https://salla.com/themes/1609470678",
    )
    root.add_child(instance=page)

    assert page.marketplace_url.endswith("1609470678")
    assert not hasattr(page, "inventory")
    assert not hasattr(page, "order_items")
