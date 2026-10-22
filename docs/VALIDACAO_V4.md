# Validação V4 — TAJO Control + TAJO Rádio 24H

## Verificações concluídas

- 9 páginas HTML analisadas.
- IDs duplicados: nenhum.
- Referências locais inexistentes: nenhuma.
- Fragmentos/âncoras internas inválidas: nenhum.
- Estilos inline e manipuladores inline incompatíveis com a CSP: nenhum nas novas áreas.
- CSS analisado estruturalmente: sem erro de parse.
- `main.js`, `community.js` e `tajo-radio.js`: sintaxe validada com Node.js.
- `app.py`, `backend/application.py` e testes: compilação Python concluída.
- 18 arquivos MP3: todos reconhecidos pelo FFprobe e com duração legível.
- URLs do TAJO Control conferidas no código: página de vendas e checkout presentes.
- Proteção de `contextmenu` presente no JavaScript global.
- Headers adicionais presentes no backend: COOP, CORP e X-Permitted-Cross-Domain-Policies.
- Sitemap atualizado para TAJO Control e Rádio.

## Testes que dependem do ambiente

O ambiente usado para montar este pacote não possuía Flask instalado e não tinha acesso de rede para baixar as dependências. Por isso a suíte HTTP `unittest` não pôde ser executada aqui, apesar de os arquivos Python compilarem sem erro. O pacote mantém `requirements.txt` e inclui `iniciar.bat` / `iniciar.sh` para instalar as dependências e iniciar o projeto no computador ou no ambiente de deploy.

Também não havia binário Chromium instalado no ambiente para o teste visual automatizado. A responsividade foi revisada no CSS e a navegação ganhou breakpoint antecipado em 920px para acomodar os novos itens Produtos e Rádio.

## Observação sobre áudio

Navegadores modernos podem bloquear reprodução automática de áudio sem interação do usuário. O player trata esse comportamento e apresenta o botão ▶ para ativação. Depois da ativação, volume e preferência são armazenados localmente; a estação é ressíncronizada pelo relógio quando necessário.
