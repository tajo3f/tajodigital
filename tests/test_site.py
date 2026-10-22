"""Regression checks for routes, SEO, local assets and the retained community API.
Run: python -m unittest discover -s tests -v
"""
import os
from pathlib import Path
import tempfile
import unittest
import json
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

TEMP = tempfile.TemporaryDirectory()
os.environ['DATABASE_PATH'] = str(Path(TEMP.name) / 'test.db')
os.environ['ADMIN_KEY'] = 'test-only-key'
from backend.application import app

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids=[]; self.links=[]; self.scripts=[]; self.h1=0; self.title=''; self.in_title=False; self.in_json=False; self.meta={}; self.canonical=''
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='title':self.in_title=True
        if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
        if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True;self.scripts.append('')
        for key in ('src','href','poster'):
            if a.get(key):self.links.append(a[key])
        if a.get('srcset'):
            self.links.extend(part.strip().split()[0] for part in a['srcset'].split(','))
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
        if tag=='script':self.in_json=False
    def handle_data(self,data):
        if self.in_title:self.title+=data
        if self.in_json:self.scripts[-1]+=data

class SiteTests(unittest.TestCase):
    def setUp(self):
        self.client=app.test_client()
        original_open=self.client.open
        def buffered_open(*args, **kwargs):
            kwargs['buffered']=True
            return original_open(*args, **kwargs)
        self.client.open=buffered_open
    def test_all_pages_and_seo(self):
        routes=['/','/criacao-de-sites/','/marketing-digital/','/sistemas/','/atendimento/','/solucoes/','/comunidade/','/tajo-control/','/radio/']
        titles=set()
        for route in routes:
            with self.subTest(route=route):
                res=self.client.get(route);self.assertEqual(res.status_code,200)
                page=Page(res.get_data(as_text=True))
                self.assertEqual(page.h1,1);self.assertEqual(len(page.ids),len(set(page.ids)))
                self.assertNotIn(page.title,titles);titles.add(page.title)
                self.assertEqual(page.canonical,'https://tajodigital.com.br'+route)
                self.assertTrue(page.meta.get('description'))
                self.assertEqual('noindex' in page.meta['robots'],route=='/comunidade/')
                for script in page.scripts:
                    graph=json.loads(script)['@graph'];self.assertTrue(graph)
                for link in page.links:
                    parsed=urlsplit(link)
                    if parsed.scheme or parsed.netloc:continue
                    target=parsed.path or route
                    self.assertTrue(target.startswith('/'),link)
                    resource=self.client.get(target,follow_redirects=True)
                    self.assertEqual(resource.status_code,200,(route,link))
                    if parsed.fragment:
                        self.assertIn(unquote(parsed.fragment),Page(resource.get_data(as_text=True)).ids,(route,link))
    def test_sitemap(self):
        root=ET.fromstring(self.client.get('/sitemap.xml').data)
        urls=[e.text for e in root.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(len(urls),8)
        for url in urls:
            route=urlsplit(url).path
            self.assertEqual(self.client.get(route).status_code,200)
            self.assertNotIn('noindex',Page(self.client.get(route).get_data(as_text=True)).meta['robots'])
    def test_legacy_redirects(self):
        for source,target in [('/index.html','/'),('/solucoes.html','/solucoes/'),('/criacao-de-sites','/criacao-de-sites/'),('/logo.webp','/assets/images/logo.webp'),('/projects/caseirinhos.webp','/assets/projects/caseirinhos.webp')]:
            res=self.client.get(source);self.assertEqual(res.status_code,301);self.assertEqual(res.headers['Location'],target)
    def test_private_files_and_missing_paths(self):
        for path in ['/backend/application.py','/.env','/requirements.txt','/templates/index.html','/assets/../../backend/application.py','/nao-existe','/projects/../../app.py']:
            self.assertEqual(self.client.get(path).status_code,404,path)
        self.assertIn('/assets/css/error.css',self.client.get('/nao-existe').get_data(as_text=True))
    def test_media_range_and_headers(self):
        res=self.client.get('/assets/video/restaurante-central.mp4',headers={'Range':'bytes=0-100'})
        self.assertEqual(res.status_code,206);self.assertEqual(len(res.data),101)
        home=self.client.get('/');self.assertIn("media-src 'self'",home.headers['Content-Security-Policy'])
    def test_community_contract(self):
        self.assertEqual(self.client.get('/api/presence').status_code,200)
        for route in ['/api/presence','/api/community/messages']:
            for body in [[],None,'bad']:
                self.assertEqual(self.client.post(route,json=body).status_code,400)
        payload={'session_id':'qa-session-123','name':'Teste','message':'Mensagem de verificação'}
        self.assertEqual(self.client.post('/api/presence',json=payload).status_code,200)
        self.assertEqual(self.client.post('/api/community/messages',json=payload).status_code,201)
        self.assertEqual(self.client.post('/api/community/messages',json=payload).status_code,429)
        messages=self.client.get('/api/community/messages').get_json()['messages'];self.assertEqual(messages[-1]['message'],payload['message'])
        mid=messages[-1]['id'];self.assertEqual(self.client.delete(f'/api/community/messages/{mid}').status_code,401)
        self.assertEqual(self.client.delete(f'/api/community/messages/{mid}',headers={'X-Admin-Key':'test-only-key'}).status_code,200)
    def test_product_removed(self):
        base=Path(__file__).resolve().parents[1]
        for folder in ['templates','public/assets/js','public/assets/css']:
            for file in (base/folder).rglob('*'):
                if file.is_file():
                    text=file.read_text().lower()
                    for value in ['prompt studio','prompt-studio','tajopromptstudio','hotmart']:
                        self.assertNotIn(value,text,str(file))


    def test_tajo_control_page(self):
        response = self.client.get("/tajo-control/")
        self.assertEqual(response.status_code, 200)
        body = response.get_data(as_text=True)
        self.assertIn("TAJO Control", body)
        self.assertIn("https://kiwify.app/dnM0pTI", body)
        self.assertIn("https://pay.kiwify.com.br/ACQu2Xg", body)

    def test_radio_page_and_assets(self):
        response = self.client.get("/radio/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("TAJO Rádio", response.get_data(as_text=True))
        self.assertEqual(self.client.get("/assets/radio/tajo-radio.js").status_code, 200)
        self.assertEqual(self.client.get("/assets/radio/audio/01_atlasaudio_innovation_522427.mp3").status_code, 200)

if __name__=='__main__': unittest.main()
