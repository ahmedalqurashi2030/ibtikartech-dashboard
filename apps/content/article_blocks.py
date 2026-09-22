from wagtail import blocks


class ArticleHeadingBlock(blocks.StructBlock):
    title = blocks.CharBlock(label="العنوان")
    anchor = blocks.CharBlock(
        required=False,
        label="معرّف الرابط",
        help_text="اختياري. استخدم أحرفًا إنجليزية وأرقامًا وشرطات مثل pricing-scope.",
    )

    class Meta:
        icon = "title"
        label = "عنوان قسم"
        group = "محتوى المقال"


class ArticleCalloutBlock(blocks.StructBlock):
    title = blocks.CharBlock(required=False, label="العنوان")
    body = blocks.RichTextBlock(
        features=["bold", "italic", "link", "ul", "ol"],
        label="النص",
    )

    class Meta:
        icon = "warning"
        label = "ملاحظة بارزة"
        group = "محتوى المقال"


class ArticleStepBlock(blocks.StructBlock):
    title = blocks.CharBlock(label="العنوان")
    body = blocks.RichTextBlock(
        features=["bold", "italic", "link", "ul", "ol"],
        label="الوصف",
    )

    class Meta:
        icon = "list-ol"
        label = "عنصر"


class ArticleStepsBlock(blocks.StructBlock):
    items = blocks.ListBlock(ArticleStepBlock(), min_num=1, label="العناصر")

    class Meta:
        icon = "list-ol"
        label = "خطوات / عناصر"
        group = "محتوى المقال"


class ArticleTableRowBlock(blocks.StructBlock):
    cells = blocks.ListBlock(blocks.CharBlock(label="خلية"), min_num=1, label="الخلايا")

    class Meta:
        icon = "table"
        label = "صف"


class ArticleTableBlock(blocks.StructBlock):
    headers = blocks.ListBlock(
        blocks.CharBlock(label="عنوان العمود"),
        min_num=1,
        label="رؤوس الأعمدة",
    )
    rows = blocks.ListBlock(ArticleTableRowBlock(), min_num=1, label="الصفوف")

    class Meta:
        icon = "table"
        label = "جدول"
        group = "محتوى المقال"


class ArticleCtaBlock(blocks.StructBlock):
    title = blocks.CharBlock(label="العنوان")
    body = blocks.RichTextBlock(
        required=False,
        features=["bold", "italic", "link"],
        label="الوصف",
    )
    label = blocks.CharBlock(required=False, label="نص الزر")
    url = blocks.CharBlock(
        required=False,
        label="رابط الزر",
        help_text="يقبل رابطًا داخليًا مثل /services/ أو رابط https كاملًا.",
    )

    class Meta:
        icon = "link"
        label = "دعوة لاتخاذ إجراء"
        group = "محتوى المقال"


class ArticleContentBlock(blocks.StreamBlock):
    rich_text = blocks.RichTextBlock(
        features=["h2", "h3", "bold", "italic", "ol", "ul", "link"],
        label="نص منسق",
        icon="doc-full",
        group="محتوى المقال",
    )
    heading = ArticleHeadingBlock()
    callout = ArticleCalloutBlock()
    steps = ArticleStepsBlock()
    table = ArticleTableBlock()
    cta = ArticleCtaBlock()
    legacy_html = blocks.RawHTMLBlock(
        label="محتوى منقول من النسخة السابقة",
        icon="code",
        group="ترحيل المحتوى",
        help_text=(
            "مخصص للمقالات الستة المنقولة للحفاظ على العرض الحالي. "
            "للمقالات الجديدة استخدم الكتل المنظمة أعلاه."
        ),
    )
