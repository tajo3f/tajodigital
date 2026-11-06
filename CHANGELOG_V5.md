# TAJO Digital V5 — versão final sem rádio

## Alterações
- Removida a TAJO Rádio 24H da navegação, rodapé e página inicial.
- Removida a rota pública `/radio/` e os arquivos do player/áudio.
- Removidas as referências da rádio do sitemap.
- Adicionado scroll suave para navegação por âncoras.
- Refinada a entrada de conteúdo durante a rolagem: elementos aparecem com transição mais lenta, leve e progressiva.
- Mantido suporte a `prefers-reduced-motion` para acessibilidade.

## Validação local disponível
- JavaScript validado com `node --check`.
- Python validado com `py_compile`.
- Links e assets internos verificados estaticamente: sem referências quebradas.
- Estrutura de chaves CSS verificada.

> A suíte Flask não pôde ser executada neste ambiente porque a dependência Flask não está instalada e o ambiente está sem acesso de rede para instalá-la.
