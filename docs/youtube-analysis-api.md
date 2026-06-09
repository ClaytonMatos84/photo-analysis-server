# YouTube Analysis API

## Descrição

O módulo de YouTube Analysis analisa uma URL de vídeo do YouTube, extrai metadados do player da página e salva o resultado associado ao usuário autenticado.

Cada execução gera um registro em `youtube_analysis_results` com informações principais do vídeo e metadados complementares.

## Configuração

Variáveis relevantes:

- `YOUTUBE_FETCH_TIMEOUT_MS`: timeout da coleta da página (ms, default: `30000`)
- `YOUTUBE_CA_CERT_PATH`: caminho para certificado CA customizado (opcional)
- `YOUTUBE_INSECURE_TLS`: quando `true`, desabilita validação TLS (usar apenas troubleshooting)

## Endpoints

Todos os endpoints abaixo exigem autenticação JWT.

### 1. Analisar vídeo por URL

**GET** `/youtube-analysis/analyze?url=<url_do_video>`

Executa a coleta da página do vídeo, extrai dados do player e salva automaticamente no banco.

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/youtube-analysis/analyze?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**

```json
{
  "id": 42,
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "videoId": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
  "lengthSeconds": "213",
  "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "shortDescription": "The official video for...",
  "viewCount": "123456789",
  "author": "Rick Astley",
  "isLiveContent": false,
  "likeCount": "987654",
  "category": "Music",
  "ownerProfileUrl": "http://www.youtube.com/@RickAstley",
  "createdAt": "2026-06-01T12:10:01.123Z"
}
```

**Erros comuns:**

- `400 Bad Request`: `Parametro url e obrigatorio`
- `400 Bad Request`: `URL do YouTube invalida`
- `422 Unprocessable Entity`: `Nao foi possivel extrair os dados do player do YouTube.`
- `422 Unprocessable Entity`: quando algum campo extraído fica `null`/ausente. A resposta inclui `missingAttributes` com a lista de atributos faltantes e o resultado não é salvo.
- `502 Bad Gateway`: `Falha de comunicacao com YouTube para analise do video.`

---

### 2. Listar resultados do usuário (paginado)

**GET** `/youtube-analysis/results?page=1&limit=10`

**Parâmetros:**

- `page` (opcional, default `1`)
- `limit` (opcional, default `10`, mínimo `1`, máximo `100`)

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/youtube-analysis/results?page=1&limit=5" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**

```json
{
  "data": [
    {
      "id": 42,
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "videoId": "dQw4w9WgXcQ",
      "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      "lengthSeconds": "213",
      "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
      "shortDescription": "The official video for...",
      "viewCount": "123456789",
      "author": "Rick Astley",
      "isLiveContent": false,
      "likeCount": "987654",
      "category": "Music",
      "ownerProfileUrl": "http://www.youtube.com/@RickAstley",
      "createdAt": "2026-06-01T12:10:01.123Z"
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

### 3. Buscar resultado por ID

**GET** `/youtube-analysis/results/:id`

Retorna apenas resultados pertencentes ao usuário autenticado.

**Exemplo:**

```bash
curl -X GET "http://localhost:3000/youtube-analysis/results/42" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (200):**

Mesmo formato do endpoint de análise.

**Erros comuns:**

- `404 Not Found`: `Resultado nao encontrado`

---

### 4. Deletar resultado por ID

**DELETE** `/youtube-analysis/results/:id`

Remove um resultado pertencente ao usuário autenticado.

**Exemplo:**

```bash
curl -X DELETE "http://localhost:3000/youtube-analysis/results/42" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta (204):**

Sem corpo de resposta.

**Erros comuns:**

- `404 Not Found`: `Resultado nao encontrado`

## Persistência

A cada análise válida é criado um registro na tabela:

- `youtube_analysis_results`

Campos persistidos:

- `youtubeUrl`
- `videoId`
- `title`
- `lengthSeconds`
- `channelId`
- `shortDescription`
- `viewCount`
- `author`
- `isLiveContent`
- `likeCount`
- `category`
- `ownerProfileUrl`
- `createdAt`

## Regras importantes

- A URL enviada deve ser válida para `youtube.com/watch`, `youtube.com/shorts` ou `youtu.be`.
- Os resultados listados e consultados por ID são sempre filtrados por usuário autenticado.
- A exclusão por ID também é filtrada por usuário autenticado; um usuário não remove registro de outro.
- Se o parser não encontrar `ytInitialPlayerResponse` no HTML, a API retorna `422` e não persiste resultado.
- Se algum atributo mapeado para persistência estiver `null`/ausente, a API retorna `422` com `missingAttributes` e não persiste resultado.
