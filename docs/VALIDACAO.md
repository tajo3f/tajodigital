# Verificação da entrega

## Concluído

- Sete testes de regressão via cliente HTTP do Flask.
- Páginas públicas respondendo 200, uma hierarquia H1 principal e IDs sem duplicação.
- Links e âncoras internos válidos, incluindo imagens responsivas, scripts, estilos e vídeos.
- Títulos exclusivos, canonical correspondente à URL e dados estruturados JSON válidos.
- Sitemap com seis páginas indexáveis; comunidade com noindex.
- Redirecionamentos das URLs anteriores e padronização da barra final.
- URLs inexistentes e tentativas de acessar arquivos privados respondendo 404.
- Vídeo com resposta parcial 206 para requisições Range.
- API da comunidade: presença, publicação, limitação por sessão, leitura e moderação autorizada.
- Ausência da promoção do produto removido nas páginas e recursos públicos.
- Sintaxe dos arquivos JavaScript verificada com Node.

## Limites da verificação

Não foi possível executar revisão visual em navegador nesta sessão. O CSS contempla 320px, celular, tablet e desktop; isso não substitui testar o layout real nesses tamanhos. Modais, menu, teclado e formulário precisam de conferência no navegador após o deploy. Não houve teste de Lighthouse, medição de Core Web Vitals ou execução do Rich Results Test.

Não foram enviados contatos reais pelo WhatsApp, publicados arquivos na Vercel ou feitas mudanças no Search Console e no Perfil da Empresa.

## Efeitos implementados

- Entrada sutil de elementos ao rolar, com IntersectionObserver e fallback que revela o conteúdo.
- Preferência de movimento reduzido respeitada.
- Feedback de foco e hover em links, botões e peças.
- Ampliação de imagens com dialog nativo e retorno do foco ao elemento de origem.
- Vídeo sem reprodução automática e com interrupção ao fechar o modal.
- Botão para voltar ao topo e sombra discreta do cabeçalho durante a rolagem.

O conteúdo de serviço está presente no HTML, sem depender das animações. Imagens podem ser abertas pelos links originais e o vídeo por seu endereço quando o navegador não suporta o modal.
