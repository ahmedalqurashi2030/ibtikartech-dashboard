from django.urls import reverse
from wagtail import hooks
from wagtail.admin.menu import MenuItem

from .models import ArticleIndexPage


@hooks.register("construct_main_menu")
def add_articles_menu_item(request, menu_items):
    index_page = ArticleIndexPage.objects.first()
    if index_page is None:
        return

    if not index_page.permissions_for_user(request.user).can_edit():
        return

    menu_items.append(
        MenuItem(
            "المقالات",
            reverse("wagtailadmin_explore", args=[index_page.pk]),
            icon_name="doc-full",
            order=120,
        )
    )
