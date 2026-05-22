# Ad Analysis API

## Descrição

O módulo de Ad Analysis analisa um anúncio a partir de uma URL de imagem, integra com um serviço externo e salva o resultado em três blocos:

- comparador
- estrategia
- melhoria

Cada execução recebe um `analysisId` único e fica associada ao usuário autenticado.

## Configuração

Variáveis relevantes:

- `PHOTO_ANALYSIS_URL`: URL base do serviço externo
- `AD_ANALYSIS_TIMEOUT_MS`: timeout da chamada externa (ms, default: `120000`)

Endpoint externo utilizado internamente:

- `GET /analise-anuncio?image_url=...`

## Endpoints

Todos os endpoints abaixo exigem autenticação JWT.

### 1. Analisar anúncio por URL

**GET** `/ad-analysis/analyze?image_url=<url_da_imagem>`

Executa a análise e salva automaticamente o resultado completo no banco.

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/ad-analysis/analyze?image_url=https://example.com/banner.jpg" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**

```json
{
  "analysisId": "bdba9a43-f668-4f14-bf6d-8f3554f95d17",
  "dataAnalise": "2026-05-22T12:10:01.123Z",
  "comparador": {
    "marcaAnalisada": "Marca X",
    "resumoPosicionamentoMarca": "Posicionamento atual da marca",
    "quantidadeConcorrentes": 3,
    "forcasDaMarca": "Reconhecimento e alcance",
    "fraquezasDaMarca": "Baixa diferenciação",
    "oportunidadesDeMercado": "Segmento premium em crescimento",
    "ameacas": "Alta disputa por atenção",
    "insightFinal": "Reforçar proposta de valor",
    "createdAt": "2026-05-22T12:10:01.123Z"
  },
  "estrategia": {
    "posicionamentoSugerido": "Foco em confiança e resultado",
    "propostaDeValorReforcada": "Entregamos mais valor por investimento",
    "mensagemPrincipal": "A escolha inteligente para sua marca",
    "tomDeVozSugerido": "Direto e consultivo",
    "createdAt": "2026-05-22T12:10:01.123Z"
  },
  "melhoria": {
    "principalConcorrente": "Concorrente Y",
    "criterioDeEscolhaDoConcorrente": "Maior similaridade visual",
    "pontosFortesDoCliente": "Clareza da oferta",
    "pontosFortesDoConcorrente": "Apelo visual mais forte",
    "oportunidadesDeMelhoriaParaOCliente": "CTA mais claro e destaque de benefício",
    "mensagem": "Destaque o benefício principal no primeiro bloco",
    "elementosVisuais": "Maior contraste no título",
    "tomDeVoz": "Mais objetivo",
    "callToAction": "Teste agora",
    "propostaDeValorReforcada": "Resultado com previsibilidade",
    "exemploResumidoDeReformulacao": "Anúncio com headline orientada a benefício",
    "url": "https://example.com/banner.jpg",
    "createdAt": "2026-05-22T12:10:01.123Z"
  }
}
```

**Erros comuns:**

- `400 Bad Request`: `Parametro image_url e obrigatorio`
- `502 Bad Gateway`: payload incompleto vindo do serviço externo

---

### 2. Listar resultados do usuário (paginado)

**GET** `/ad-analysis/results?page=1&limit=10`

**Parâmetros:**

- `page` (opcional, default `1`)
- `limit` (opcional, default `10`, mínimo `1`, máximo `100`)

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/ad-analysis/results?page=1&limit=5" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**

```json
{
  "data": [
    {
      "analysisId": "bdba9a43-f668-4f14-bf6d-8f3554f95d17",
      "dataAnalise": "2026-05-22T12:10:01.123Z",
      "comparador": {
        "marcaAnalisada": "Marca X",
        "resumoPosicionamentoMarca": "Posicionamento atual da marca",
        "quantidadeConcorrentes": 3,
        "forcasDaMarca": "Reconhecimento e alcance",
        "fraquezasDaMarca": "Baixa diferenciação",
        "oportunidadesDeMercado": "Segmento premium em crescimento",
        "ameacas": "Alta disputa por atenção",
        "insightFinal": "Reforçar proposta de valor",
        "createdAt": "2026-05-22T12:10:01.123Z"
      },
      "estrategia": {
        "posicionamentoSugerido": "Foco em confiança e resultado",
        "propostaDeValorReforcada": "Entregamos mais valor por investimento",
        "mensagemPrincipal": "A escolha inteligente para sua marca",
        "tomDeVozSugerido": "Direto e consultivo",
        "createdAt": "2026-05-22T12:10:01.123Z"
      },
      "melhoria": {
        "principalConcorrente": "Concorrente Y",
        "criterioDeEscolhaDoConcorrente": "Maior similaridade visual",
        "pontosFortesDoCliente": "Clareza da oferta",
        "pontosFortesDoConcorrente": "Apelo visual mais forte",
        "oportunidadesDeMelhoriaParaOCliente": "CTA mais claro e destaque de benefício",
        "mensagem": "Destaque o benefício principal no primeiro bloco",
        "elementosVisuais": "Maior contraste no título",
        "tomDeVoz": "Mais objetivo",
        "callToAction": "Teste agora",
        "propostaDeValorReforcada": "Resultado com previsibilidade",
        "exemploResumidoDeReformulacao": "Anúncio com headline orientada a benefício",
        "url": "https://example.com/banner.jpg",
        "createdAt": "2026-05-22T12:10:01.123Z"
      }
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 5,
  "totalPages": 3
}
```

**Erros comuns:**

- `400 Bad Request`: `Page must be greater than 0`
- `400 Bad Request`: `Limit must be between 1 and 100`

---

### 3. Buscar resultado por analysisId

**GET** `/ad-analysis/results/:analysisId`

Retorna apenas resultados pertencentes ao usuário autenticado.

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/ad-analysis/results/bdba9a43-f668-4f14-bf6d-8f3554f95d17" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**

Mesmo formato do endpoint de análise (`analysisId`, `dataAnalise`, `comparador`, `estrategia`, `melhoria`).

**Erros comuns:**

- `404 Not Found`: `Resultado não encontrado`

## Persistência

A cada análise válida são gravadas três tabelas relacionadas pelo mesmo `analysisId`:

- `ad_analysis_comparador`
- `ad_analysis_estrategia`
- `ad_analysis_melhoria`

As consultas combinam essas três entidades para montar o payload final.

## Regras importantes

- A API valida se há conteúdo mínimo em `comparador`, `estrategia` e `melhoria`.
- Se o payload do serviço externo vier incompleto, a API não salva e retorna erro `502`.
- O usuário só enxerga os próprios resultados.
