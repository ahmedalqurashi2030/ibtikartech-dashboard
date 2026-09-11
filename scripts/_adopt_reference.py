from pathlib import Path
from bs4 import BeautifulSoup
import json,re,base64,hashlib,shutil
R=Path('.'); export=json.loads(Path('artifacts/services-reference/export.json').read_text(encoding='utf-8'))
backup=Path('artifacts/services-reference/before-full-adoption');backup.mkdir(parents=True,exist_ok=True)
for folder in ['templates/public_preview/pages','templates/public_preview/families']:
 for p in Path(folder).glob('*.html'):shutil.copy2(p,backup/p.name)
assets=Path('static/public_preview/assets/images/services/reference');assets.mkdir(parents=True,exist_ok=True)
def asset(uri):
 if not uri.startswith('data:'):return uri
 mime,data=uri.split(';base64,',1);raw=base64.b64decode(data);ext={'data:image/webp':'webp','data:image/png':'png','data:image/jpeg':'jpg','data:font/woff2':'woff2','data:font/woff':'woff','data:application/font-woff':'woff'}.get(mime,'woff2' if 'font' in mime else 'bin')
 name=hashlib.sha256(raw).hexdigest()[:16]+'.'+ext;(assets/name).write_bytes(raw)
 return '/static/public_preview/assets/images/services/reference/'+name
# CSSOM serialization gives normalized complete rules, including media queries.
prefix='html body #main-content.service-reference'
def scope(css):
 result=[];i=0
 while i<len(css):
  a=css.find('{',i)
  if a<0:break
  head=css[i:a].strip();depth=1;j=a+1;quote=None
  while j<len(css) and depth:
   c=css[j]
   if quote:
    if c==quote and css[j-1]!='\\':quote=None
   elif c in '\"\'':quote=c
   elif c=='{':depth+=1
   elif c=='}':depth-=1
   j+=1
  body=css[a+1:j-1];i=j
  if head.startswith('@font-face'):
   body=re.sub(r'url\(["\']?(data:[^\)"\']+)["\']?\)',lambda m:'url("'+asset(m[1])+'")',body)
   body=body.replace('Brand','ServicesReferenceBrand').replace('MDI','ServicesReferenceIcons')
   result.append(head+'{'+body+';font-display:swap;}');continue
  if head.startswith('@media') or head.startswith('@supports'):
   result.append(head+'{'+scope(body)+'}');continue
  if head.startswith('@keyframes'):
   result.append(head+'{'+body+'}');continue
  if head.startswith('@'):continue
  # Cinema geometry remains owned by service-category.css; the external heading is retained.
  selectors=[]
  for sel in re.split(r',\s*(?![^()]*\))',head):
   if any(x in sel for x in ['service-path','service-cinema','cinema-shell','cinema-stage','cinema-panel','scroll-cinema','cinema-runway','cinema-tabs']):continue
   if sel.strip()==':root':sel=prefix
   elif sel.strip() in ('html','body'):sel=prefix
   else:sel=prefix+' '+sel
   selectors.append(sel)
  if selectors:result.append(','.join(selectors)+'{'+body.replace('MDI','ServicesReferenceIcons').replace('Brand','ServicesReferenceBrand')+'}')
 return '\n'.join(result)
css='\n'.join(scope(rule) for rule in export['css'])
css+='''
/* Project colors, reference composition. */
html body #main-content.service-reference {--bg:var(--ibt-bg);--surface:var(--ibt-surface);--surface-2:var(--ibt-bg-soft);--text:var(--ibt-text);--muted:var(--ibt-muted);--line:var(--ibt-border);--cyan:var(--ibt-cyan);--purple:var(--ibt-purple);--pink:var(--ibt-pink);--glow:var(--ibt-gradient);--font:ServicesReferenceBrand,var(--ibt-font);width:min(1180px,calc(100% - 64px));margin-inline:auto;padding:110px 0 76px;overflow:visible;}
html body #main-content.service-reference .section {padding:0!important;margin-top:76px!important;}
html body #main-content.service-reference .hero {padding:30px 0 18px!important;min-height:435px!important;display:grid!important;grid-template-columns:.95fr 1.15fr!important;background:none!important;border:0!important;box-shadow:none!important;}
html body #main-content.service-reference .hero h1 {font-size:clamp(34px,3.45vw,49px)!important;line-height:1.43!important;font-weight:700!important;letter-spacing:normal!important;}
html body #main-content.service-reference .hero p {font-size:18px!important;line-height:1.9!important;}
html body #main-content.service-reference .surface {background:linear-gradient(125deg,color-mix(in srgb,var(--ibt-blue) 5%,var(--ibt-surface)),var(--ibt-surface));border-color:var(--ibt-border);}
html body #main-content.service-reference h2 {font-size:clamp(25px,2.55vw,34px)!important;line-height:1.4!important;letter-spacing:normal!important;}
html body #main-content.service-reference h3 {letter-spacing:normal!important;}
html body #main-content.service-reference .service-paths-section {width:100%;margin-inline:0;overflow:visible;}
html body #main-content.service-reference .service-paths-section > .container {width:100%;max-width:none;}
html body #main-content.service-reference .service-paths-section.is-cinematic-ready {padding:0!important;margin-top:76px!important;}
html body #main-content.service-reference .service-paths-section.is-cinematic-ready > .container {top:100px;}
html body #main-content.service-reference .service-paths-section {--service-cinema-top:100px;--service-cinema-height:calc(100svh - 120px);}
html body #main-content.service-reference .service-paths-header {text-align:start;}
html body #main-content.service-reference .service-path-card > p {font-size:16px;}
html body #main-content.service-reference .reference-nav {display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}
html body #main-content.service-reference .reference-nav a {min-height:44px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;font-size:14px;}
html body #main-content.service-reference .section-head {display:block!important;text-align:center!important;margin:0 0 24px!important;}
html body #main-content.service-reference .section-head.start {display:flex!important;align-items:end!important;justify-content:space-between!important;text-align:start!important;}
html body #main-content.service-reference .service-cinema__top {display:none;}
html body #main-content.service-reference .commerce-health-lab {width:100%;margin-inline:0;padding:32px!important;border-radius:24px;}
html body #main-content.service-reference .commerce-health-lab > .container {width:100%;}
html body #main-content.service-reference .hero-art img {border:0!important;box-shadow:none!important;background:none!important;border-radius:0!important;}
html body #main-content.service-reference .btn.primary {color:white;}
html body #main-content.service-reference .reference-dialog {max-width:min(1000px,94vw);border:1px solid var(--line);border-radius:20px;background:var(--surface);color:var(--text);}
html body #main-content.service-reference .reference-dialog::backdrop {background:#000b;}
html body #main-content.service-reference .reference-dialog img {max-height:75svh;object-fit:contain;}
html body #main-content.service-reference .metric-result[hidden] {display:none!important;}
html body #main-content.service-reference .service-paths-section:not(.is-cinematic-ready) .service-paths-header {display:none;}
html body #main-content.service-reference .service-paths-section:not(.is-cinematic-ready) .service-paths-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
html body #main-content.service-reference .service-paths-section:not(.is-cinematic-ready) .service-path-card {grid-column:auto;padding:24px;min-height:0;}
html body #main-content.service-reference .service-path-card::after {display:none;}
html body #main-content.service-reference .service-paths-section:not(.is-cinematic-ready) .service-path-card h3 {font-size:28px!important;}
html body #main-content.service-reference .service-paths-section.is-cinematic-ready .service-path-card h3 {font-size:clamp(32px,3.6vw,52px)!important;}
@media(max-width:760px){html body #main-content.service-reference {width:calc(100% - 32px);padding-top:92px;}html body #main-content.service-reference .hero {grid-template-columns:1fr!important;min-height:0!important;}html body #main-content.service-reference .hero-copy {order:0;}html body #main-content.service-reference .hero-art {order:1;}html body #main-content.service-reference .section {margin-top:54px!important;}html body #main-content.service-reference .service-paths-section:not(.is-cinematic-ready) .service-paths-grid {grid-template-columns:1fr;}html body #main-content.service-reference .commerce-health-lab {padding:20px 14px!important;}html body #main-content.service-reference .hero h1 {font-size:34px!important;}}
'''
Path('static/public_preview/assets/css/pages/services-reference.css').write_text(css,encoding='utf-8')
routes={'commerce':('ecommerce','public_preview:ecommerce','ecommerce'),'websites':('websites','public_preview:websites','website'),'brand':('brand-content','public_preview:brand-content','brand'),'growth':('growth','public_preview:growth','growth'),'automation':('custom-systems','public_preview:custom-systems','automation')}
def url(name):return "{% url '"+name+"' %}"
def link(node,href):
 node.name='a';node['href']=href
 for k in ['type','data-contact','data-cinema-contact','data-solution','data-start']:node.attrs.pop(k,None)
scene_types={ 'commerce':['store-launch','store-improve','product-focus','growth-trend'],'websites':['corporate-site','landing-page','redesign-split','content-library','saas-story','bilingual'],'brand':['positioning-orbit','identity-kit','ui-system','web-copy','commerce-copy','campaign-assets'],'growth':['measurement-foundation','technical-seo','content-seo','tracking-map','cro-funnel','reporting-dashboard'],'automation':['integrations-map','automation-flow','ops-dashboard','client-portal','event-pulses','mobile-app']}
detail=['store-launch','storefront-customization','store-redesign','product-page-optimization','ecommerce-growth','ecommerce-support']
for key,(name,route,goal) in routes.items():
 p=Path('templates/public_preview/pages/'+name+'.html');old=p.read_text(encoding='utf-8');soup=BeautifulSoup(export['pages'][key]['html'],'html.parser')
 for img in soup.select('img'):
  img['src']=asset(img['src']);img['decoding']='async'
  if not img.has_attr('fetchpriority'):img['loading']='lazy'
 for a in soup.select('a[href]'):
  h=a['href']
  if h.startswith('https://ibtikartech.co'):a['href']=url('public_preview:home')
  elif h[1:] in routes:a['href']=url(routes[h[1:]][1])
  elif h=='#landing':a['href']=url('public_preview:websites')+'#solutions'
 for b in soup.select('[data-contact],[data-solution]'):
  target=url('public_preview:contact')+'?goal='+goal+'&source='+name+'-reference#quote'
  if b.has_attr('data-solution') and key=='commerce':target=url('services:'+detail[int(b['data-solution'])])
  link(b,target)
 for b in soup.select('[data-start]'):link(b,'#start')
 for b in soup.select('[disabled]'):b.attrs.pop('disabled',None)
 # Reuse the established cinema lifecycle; only stage decoration is generated by JS.
 cinema=soup.select_one('.service-paths-section');stage=cinema.select_one('.service-cinema-stage');stage['class']=['container','service-cinema-stage']
 cinema.attrs.pop('style',None)
 for el in stage.select('.service-cinema__canvas-layer,.service-cinema__top,.service-cinema__rail,.service-cinema__cue'):el.decompose()
 intro=stage.select_one('.service-cinema__intro');intro['class']=['service-paths-header'];intro.attrs.pop('aria-hidden',None)
 inner=soup.new_tag('div');inner['class']=['service-paths-header__copy']
 for x in list(intro.contents):inner.append(x.extract())
 intro.append(inner)
 for i,c in enumerate(stage.select('.service-path-card')):c['class']=['service-path-card','reveal'];c['data-scene']=scene_types[key][i];c['data-sequence']=f'{i+1:02}'
 # Keep the reference's five-family navigation and real external routes.
 related=soup.select_one('#related-carousel');related.parent['id']='related'
 for a in related.select('a[href="#landing"]'):a.decompose()
 process=soup.select_one('.process')
 if process:process.parent['id']='approach'
 else:soup.select_one('.anatomy').parent['id']='approach'
 soup.select_one('.proof')['id']='fit'
 soup.select_one('#solutions')['id']='solutions'
 nav=soup.new_tag('nav',attrs={'class':'reference-nav service-page-nav','aria-label':'أقسام الخدمة'})
 for anchor,title in [('start','نقطة البداية'),('solutions','الحلول'),('approach','طريقة العمل'),('deliverables','المخرجات'),('faq','الأسئلة'),('related','خدمات ذات صلة')]:
  a=soup.new_tag('a',href='#'+anchor);a.string=title;nav.append(a)
 soup.select_one('.proof').insert_after(nav)
 for b in soup.select('.hero [data-contact]'):b['data-analytics']='quote_request'
 hero_action=soup.select_one('.hero .primary');hero_action['data-analytics']='quote_request';hero_action['data-analytics-label']=name+'-hero'
 final=soup.select_one('.final-cta .primary');final['data-analytics']='quote_request';final['data-analytics-label']=name+'-final'
 # Keep metric content server-rendered, not copied into the runtime.
 if key=='growth':
  node=soup.select_one('.metric-result');node['data-metric-panel']='0'
  metric_text=[('قياس الإجراء المهم لأعمالك','نحدد ما يعد تحويلًا: طلب تواصل، حجز، أو شراء. ثم نراجع الانتقال بين الخطوات بدل الاكتفاء بعدد الزيارات.','generate_lead / purchase'),('من التقرير إلى خطوة قابلة للتنفيذ','نربط الملاحظة بفرضية وأولوية ومالك للتنفيذ. نراجع النتائج دون نسبة أي تغير تلقائيًا إلى سبب واحد.','Insight → Action → Review')]
  for i,(title,description,code) in enumerate(metric_text,1):
   clone=BeautifulSoup(str(node),'html.parser').select_one('.metric-result');clone['id']='metric-result-'+str(i);clone['data-metric-panel']=str(i);clone['hidden']='';clone.h3.string=title;clone.p.string=description;clone.code.string=code;node.parent.append(clone)
 # Restore all diagnostic content when scripting is disabled; runtime manages panels.
 for panel in soup.select('[data-health-panel]'):panel.attrs.pop('hidden',None)
 title=re.search(r'{% block category_page_title %}(.*?){% endblock %}',old,re.S)[1]
 desc=re.search(r'{% block category_meta_description %}(.*?){% endblock %}',old,re.S)[1]
 attrs=re.search(r'{% block category_body_attrs %}(.*?){% endblock %}',old,re.S)[1]
 html=str(soup)
 p.write_text('{% extends "public_preview/families/service_category_base.html" %}\n{% block category_page_title %}'+title+'{% endblock %}\n{% block category_meta_description %}'+desc+'{% endblock %}\n{% block category_body_attrs %}'+attrs+'{% endblock %}\n{% block category_content %}\n'+html+'\n{% endblock %}\n',encoding='utf-8')
p=Path('templates/public_preview/families/service_category_base.html');s=p.read_text(encoding='utf-8').replace('<main id="main-content">','<main id="main-content" class="service-reference">');s+='\n{% block page_refinements %}<link rel="stylesheet" href="/static/public_preview/assets/css/pages/services-reference.css">{% endblock %}\n';s=s.replace('{% endblock %}\n{% endblock %}\n', '<script src="/static/public_preview/assets/js/services-reference.js" defer></script>\n{% endblock %}\n{% endblock %}\n',1) if False else s
s=s.replace('<script src="/static/public_preview/assets/js/service-related-cards.js" defer></script>', '<script src="/static/public_preview/assets/js/service-related-cards.js" defer></script>\n<script src="/static/public_preview/assets/js/services-reference.js" defer></script>');p.write_text(s,encoding='utf-8')
print('Adopted reference sections for five categories; assets:',len(list(assets.iterdir())))
