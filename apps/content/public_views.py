from django.http import Http404

from .models import ArticleIndexPage, ArticlePage


def _article_index():
    page = ArticleIndexPage.objects.live().public().first()
    if page is None:
        raise Http404("Article index is not configured.")
    return page


def serve_article_index(request):
    return _article_index().serve(request)


def serve_article_detail(request, slug):
    index_page = _article_index()
    article = (
        ArticlePage.objects.live()
        .public()
        .child_of(index_page)
        .filter(slug=slug)
        .first()
    )
    if article is None:
        raise Http404("Article not found.")
    return article.serve(request)
