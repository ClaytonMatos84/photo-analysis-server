## Why

Atualmente a API nao oferece uma forma dedicada de listar videos do YouTube ordenados por popularidade de visualizacoes ou engajamento por likes. Essa capacidade e necessaria para suportar dashboards e fluxos de analise comparativa com criterios objetivos de ranking.

## What Changes

- Adicionar servico para retornar lista de videos do YouTube com maior numero de visualizacoes.
- Adicionar servico para retornar lista de videos do YouTube com maior numero de likes.
- Expor endpoints HTTP para cada criterio de ranking, com suporte a limite de resultados e filtros basicos.
- Padronizar o formato de resposta para facilitar consumo por clientes internos.

## Capabilities

### New Capabilities

- `youtube-top-videos-ranking`: Consulta e retorna videos do YouTube ranqueados por metrica (views ou likes), com ordenacao decrescente e resposta paginavel/limitada.

### Modified Capabilities

- Nenhuma.

## Impact

- Modulos afetados: `src/youtube-analysis/` (controller, service, tipos e integracao de dados).
- Possivel ajuste de documentacao em `docs/youtube-analysis-api.md`.
- Sem quebra de compatibilidade para endpoints existentes; apenas adicao de novos endpoints.
