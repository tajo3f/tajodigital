# TAJO Digital V6 — RAIO-X Digital T3F

## Novidades
- Rota pública `/diagnostico/` integrada ao Flask, com identidade visual da TAJO Digital.
- Ferramenta gratuita de oito perguntas com progresso, retorno às perguntas anteriores e resultado imediato.
- Recomendações por regras transparentes em três frentes: site/presença digital, organização de processos e comunicação/marketing. Quando não há necessidade identificada, o diagnóstico recomenda manter e acompanhar o que já funciona.
- CTA opcional para WhatsApp com contexto resumido da empresa e principais respostas, sem envio automático de informações.
- Botão para copiar relatório detalhado, sem cadastro obrigatório.
- Destaque na home, link no menu, links nos rodapés e entrada no sitemap.
- Responsivo e com preferência por movimento reduzido respeitada.

## Publicação
Publicar **todos** os arquivos da pasta `tajodigital-main` como substituição da V5, mantendo as variáveis de ambiente e o método de deploy existentes. A nova página estará em `https://tajodigital.com.br/diagnostico/` **após a publicação**.

## Privacidade e limitações
- O questionário é executado somente no navegador e não usa banco de dados, analytics ou envio de dados para o servidor.
- Dados são compartilhados com a TAJO **somente se o visitante abrir o WhatsApp e confirmar o envio da mensagem**.
- Não há captação automática de leads: visitantes que apenas finalizam o teste não ficam registrados.
- Resultado orientativo, não é auditoria técnica nem diagnóstico financeiro.
- Nenhuma publicação na internet foi efetuada automaticamente por esta entrega.

## Verificações efetuadas
- Sintaxe JavaScript validada com `node --check`.
- Sintaxe Python validada com `py_compile`.
- Caminhos de recursos locais conferidos e slug/sitemap verificados.
- Não foi executado teste completo do servidor Flask no ambiente de criação, pois a dependência não está instalada.
