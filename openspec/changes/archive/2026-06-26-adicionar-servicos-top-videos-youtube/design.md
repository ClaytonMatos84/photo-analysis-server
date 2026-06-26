## Context

O modulo `youtube-analysis` ja centraliza as operacoes relacionadas a consultas de analise de videos, mas nao possui servicos explicitos para ranking por metrica de popularidade. A mudanca adiciona dois fluxos de consulta (top por views e top por likes) mantendo compatibilidade com o modelo atual de controller/service.

Restrições principais:

- Reaproveitar padroes de resposta e injeção de dependencias ja existentes no modulo.
- Evitar alteracoes breaking em endpoints existentes.
- Limitar o volume retornado por requisicao para proteger latencia e consumo de recursos.

## Goals / Non-Goals

**Goals:**

- Disponibilizar endpoint para top videos por visualizacoes.
- Disponibilizar endpoint para top videos por likes.
- Garantir ordenacao decrescente consistente pela metrica solicitada.
- Permitir parametro de limite com validacao e valor padrao.

**Non-Goals:**

- Nao redefinir ou migrar endpoints legados.
- Nao incluir novos provedores externos alem dos ja utilizados pelo modulo.
- Nao implementar analytics historico ou agregacoes por periodo nesta mudanca.

## Decisions

1. Expor dois endpoints dedicados no controller (`/youtube-analysis/top-views` e `/youtube-analysis/top-likes`) em vez de um endpoint unico com parametro `sortBy`.
   Racional: reduz ambiguidade para clientes e simplifica contratos de consumo por caso de uso.
   Alternativa considerada: endpoint unico com `sortBy=views|likes`; descartado por exigir validacao extra de combinacoes e tornar documentacao menos direta.

2. Implementar dois metodos explicitos no service, reutilizando um helper interno de busca e normalizacao.
   Racional: preserva legibilidade sem duplicar regras de limite, fallback de campos e mapeamento de resposta.
   Alternativa considerada: copiar logica em dois metodos independentes; descartado por risco de divergencia de comportamento.

3. Aplicar validacao de `limit` com faixa segura (ex.: minimo 1, maximo 50) e padrao quando ausente.
   Racional: previne consultas excessivas e estabiliza desempenho.
   Alternativa considerada: sem limite maximo; descartado por risco operacional.

4. Padronizar resposta com metadados minimos (`metric`, `totalReturned`) e lista de videos.
   Racional: facilita uso por dashboards e clientes que mudam entre criterios de ranking.
   Alternativa considerada: retornar apenas array cru; descartado por perder contexto da metrica aplicada.

## Risks / Trade-offs

- [Risco] Diferencas na disponibilidade de campos de metrica entre fontes de dados podem causar ordenacao inconsistente.
  -> Mitigacao: normalizar campos ausentes para zero e registrar comportamento em testes de unidade.

- [Risco] Crescimento do numero de endpoints no controller.
  -> Mitigacao: manter convencao de nomenclatura e encapsular regras no service.

- [Trade-off] Endpoints separados aumentam clareza, mas reduzem flexibilidade para novas metricas.
  -> Mitigacao: helper interno preparado para incluir futuras metricas sem quebrar contratos existentes.

## Migration Plan

1. Implementar metodos e endpoints novos sem remover rotas atuais.
2. Atualizar documentacao da API com exemplos de chamadas e parametros.
3. Validar com testes unitarios e e2e do modulo.
4. Deploy sem migracao de dados.

Rollback:

- Reverter apenas os endpoints e metodos novos, mantendo o restante do modulo intacto.

## Open Questions

- A fonte de dados atual ja entrega `viewCount` e `likeCount` em todos os cenarios ou sera necessario fallback por chamada complementar?
- O limite maximo padrao para ambiente de producao deve ser 50 ou outro valor definido pelo time de plataforma?
