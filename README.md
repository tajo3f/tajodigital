# TAJO Digital — Institucional V4 • TAJO Control + TAJO Rádio 24H

Site oficial: https://tajodigital.com.br/

Redesign institucional com páginas próprias de serviços, SEO local, projetos reais e arquivos organizados. Mantém HTML, CSS, JavaScript e o backend Flask do projeto enviado.

## Comece por aqui

1. Leia `docs/PUBLICACAO.md` para substituir a versão anterior sem manter arquivos duplicados.
2. Leia `docs/SEO-GOOGLE.md` para os passos de indexação e presença local após publicar.
3. Consulte `docs/VALIDACAO.md` para saber o que foi e o que não foi testado.

## Organização

| Caminho | Responsabilidade |
| --- | --- |
| `app.py` | Entrada da aplicação, mantida na raiz para a hospedagem existente |
| `backend/application.py` | Rotas HTTP, redirecionamentos, segurança e API da comunidade |
| `templates/index.html` | Página inicial institucional |
| `templates/pages/` | Criação de sites, marketing, sistemas, atendimento, serviços e comunidade |
| `public/assets/css/` | Base visual, layout, páginas internas, responsividade, movimento e página de erro |
| `public/assets/js/` | Navegação, formulário, modais, efeitos e comunidade |
| `public/assets/images/` | Logo, foto do fundador, ícones e imagem de compartilhamento |
| `public/assets/projects/` | Peças e imagens dos projetos, com versões menores para telas menores |
| `public/assets/video/` | Vídeo do Restaurante Central |
| `public/robots.txt` | Instruções de rastreamento |
| `public/sitemap.xml` | URLs públicas para indexação |
| `public/manifest.webmanifest` | Identidade e ícones da aplicação |
| `docs/` | Publicação, SEO, manutenção e validação |
| `tests/` | Testes de regressão das rotas e da estrutura SEO |

Não há dependência de Node para executar o site. Não é necessário instalar pacotes JavaScript ou configurar um build de frontend.

## Executar no computador

Use Python 3.11 ou superior. Na pasta que contém este README:

```bash
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Se o PowerShell impedir a ativação, execute diretamente:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe app.py
```

macOS/Linux:

```bash
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Abra http://127.0.0.1:5000/. A página inicial agora fica em `templates/`; abrir esse arquivo por duplo clique não carrega as rotas absolutas corretamente. Use o servidor acima.

## Testar

```bash
python -m unittest discover -s tests -v
```

Os testes usam banco temporário e não enviam mensagens a clientes. O formulário comercial apenas prepara a mensagem no WhatsApp; o visitante confirma o envio.

## Manutenção

- Textos e links: `templates/`.
- Cores, tipografia e controles: `public/assets/css/base.css`.
- Composição visual: `layout.css` e `pages.css`.
- Telas menores: `responsive.css`.
- Animações: `motion.css` e `public/assets/js/main.js`.
- Ao alterar uma URL, atualize links, canonical, dados estruturados e sitemap.
- Cabeçalho e rodapé estão presentes em cada HTML; mantenha os links consistentes ao editar.
- Preserve o domínio `tajodigital.com.br`, o telefone e o e-mail comercial em todas as páginas.


## Recursos adicionados na V4

- TAJO Control integrado à home e em `/tajo-control/`.
- Página de vendas externa: https://kiwify.app/dnM0pTI
- Checkout Kiwify: https://pay.kiwify.com.br/ACQu2Xg
- TAJO Rádio 24H integrada a todas as páginas em `/assets/radio/`.
- Página da rádio em `/radio/`.
- Proteção de contexto (botão direito) e atalhos comuns de inspeção como camada de dissuasão.
- Headers de segurança adicionais.

> Importante: bloqueios no navegador não transformam HTML/CSS/JS público em código secreto. Eles reduzem cópia casual, mas usuários técnicos ainda podem acessar recursos entregues ao navegador.
