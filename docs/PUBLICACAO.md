# Publicar esta versão

Esta entrega é um pacote de arquivos. Ela não publicou mudanças no domínio nem alterou as contas Google/Vercel.

## 1. Substituir a estrutura anterior

Faça um backup ou commit do projeto atual antes da troca. Extraia o ZIP e use o conteúdo da pasta `TAJO-Site-V3` como a raiz do projeto. `app.py`, `requirements.txt`, `public`, `backend` e `templates` precisam ficar no mesmo nível.

No repositório existente, substitua os arquivos do site pela estrutura nova. Não deixe uma cópia do site antigo junto com ela. Preserve o histórico Git, variáveis de ambiente, configurações próprias da hospedagem e dados reais.

Arquivos antigos que não devem continuar como cópias públicas:

- `index.html`, `solucoes.html`, `style.css`, `script.js`, `catalogo.css`, `catalogo.js`, `theme-init.js` na raiz.
- Imagens avulsas e a pasta `projects` da raiz; elas agora estão em `public/assets/`.
- As cópias antigas desses mesmos arquivos diretamente dentro de `public`.
- `atu`, `assests`, `README-ANTERIOR.md`, arquivos `.pyc` e pastas `__pycache__`.

Não apague bancos da comunidade em uso. A aplicação mantém o caminho `data/community.db` quando executada localmente, ou o caminho definido em `DATABASE_PATH`.

## 2. Manter a hospedagem Flask existente

A entrada continua sendo `app.py`, expondo `app`. A organização interna mudou, mas a tecnologia não. Na Vercel, mantenha a detecção de Flask e a raiz do projeto na pasta que contém `app.py`. Não configure `public` como Output Directory de um site apenas estático: as páginas são atendidas pelo Flask.

Os arquivos públicos estão em `public/assets/`, permitindo atendimento pelo CDN da Vercel. O backend também os atende quando o projeto roda localmente ou em hospedagem Python tradicional.

Variáveis existentes:

| Variável | Uso |
| --- | --- |
| `SITE_URL` | `https://tajodigital.com.br/` |
| `ADMIN_KEY` | Chave de moderação da comunidade, se utilizada; não publicar no repositório |
| `DATABASE_PATH` | Caminho do banco SQLite em ambiente com disco persistente |
| `PORT` | Porta fornecida pela hospedagem tradicional; localmente o padrão é 5000 |

O site institucional não depende de banco nem de Supabase. A comunidade foi mantida em `/comunidade/`, separada do conteúdo comercial e com `noindex`. Na Vercel, SQLite em `/tmp` é temporário e não oferece histórico durável entre instâncias. Essa limitação já existia e não interfere na apresentação institucional.

## 3. Conferir o domínio

O endereço principal é `https://tajodigital.com.br/`. Configure o domínio com `www`, se existente, para redirecionar permanentemente ao endereço principal no painel da hospedagem. Os canonicals já usam o domínio correto, mas não substituem a configuração do domínio.

## 4. Após o deploy

Confira estas URLs:

- `/`
- `/criacao-de-sites/`
- `/marketing-digital/`
- `/sistemas/`
- `/atendimento/`
- `/solucoes/`
- `/robots.txt`
- `/sitemap.xml`

Confira também:

1. Menu no celular, teclado e botões de contato.
2. Formulário: preencher e conferir a mensagem no WhatsApp antes de enviar.
3. Vídeo do Restaurante Central: abrir, reproduzir, fechar e verificar se parou.
4. Imagens do portfólio: abrir e fechar a ampliação.
5. Uma URL inexistente: precisa responder 404.
6. `/solucoes.html`: redireciona para `/solucoes/`.
7. `/index.html`: redireciona para `/`.

Os arquivos antigos de imagem têm redirecionamentos de compatibilidade. A mudança de pastas não deve quebrar links antigos desses arquivos.

## 5. Atualizar a pesquisa

Depois de publicar, siga `SEO-GOOGLE.md`. O título que já aparece no Google não muda apenas por baixar este ZIP.

Referência técnica: https://vercel.com/docs/frameworks/backend/flask
