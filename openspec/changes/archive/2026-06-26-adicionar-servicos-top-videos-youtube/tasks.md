## 1. Modelagem de contrato e tipos

- [x] 1.1 Definir DTO/contrato de resposta para ranking com `metric`, `totalReturned` e lista de videos normalizados.
- [x] 1.2 Atualizar tipos do modulo `youtube-analysis` para suportar ordenacao por `viewCount` e `likeCount`.

## 2. Implementacao de servicos de ranking

- [x] 2.1 Implementar metodo de servico para retornar top videos por visualizacoes com ordenacao decrescente e limite padrao.
- [x] 2.2 Implementar metodo de servico para retornar top videos por likes com ordenacao decrescente e limite padrao.
- [x] 2.3 Extrair helper interno para validacao de limite e normalizacao de campos ausentes (fallback para zero).

## 3. Exposicao de endpoints HTTP

- [x] 3.1 Adicionar endpoint `GET /youtube-analysis/top-views` com parametro opcional `limit` validado.
- [x] 3.2 Adicionar endpoint `GET /youtube-analysis/top-likes` com parametro opcional `limit` validado.
- [x] 3.3 Garantir que ambos os endpoints retornem contrato padronizado de ranking.

## 4. Documentacao

- [x] 4.1 Atualizar `docs/youtube-analysis-api.md` com exemplos de requisicao/resposta para top por views e top por likes.
