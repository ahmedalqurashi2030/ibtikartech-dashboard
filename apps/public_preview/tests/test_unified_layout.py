from html.parser import HTMLParser

import pytest
from django.urls import reverse

from apps.public_preview.manifest import PAGE_URL_NAMES, REQUIRED_PAGES


class LayoutParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_main = False
        self.depth = 0
        self.sections = []
        self.styles = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.styles.append(attrs.get("href", ""))
        if tag == "main":
            self.in_main = True
        if self.in_main and tag == "section":
            if self.depth == 0:
                self.sections.append(set(attrs.get("class", "").split()))
            self.depth += 1

    def handle_endtag(self, tag):
        if tag == "section" and self.in_main:
            self.depth -= 1
        if tag == "main":
            self.in_main = False


@pytest.mark.django_db
@pytest.mark.parametrize("page", REQUIRED_PAGES)
def test_public_layout_is_available_without_javascript(client, page):
    response = client.get(reverse(PAGE_URL_NAMES[page]))
    assert response.status_code in (200, 404)
    parser = LayoutParser()
    parser.feed(response.content.decode())
    assert parser.sections
    for classes in parser.sections:
        assert "ibt-section" in classes
        assert len(classes & {
            "ibt-section--hero", "ibt-section--content",
            "ibt-section--story", "ibt-section--cta",
        }) == 1
    for asset in ("tokens.css", "ibtikar-shell.css", "continuous-flow.css"):
        assert sum(url.endswith("/" + asset) for url in parser.styles) == 1
