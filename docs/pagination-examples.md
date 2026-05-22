# Exemplos de Uso da Paginação

## Endpoint: GET /photo-analysis/results

### 1. Primeira página (10 resultados - default)
```bash
curl -X GET "http://localhost:3000/photo-analysis/results" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta:**
```json
{
  "data": [
    {
      "description": "Paisagem de montanha",
      "location": "Montanha",
      "style": "Natureza",
      "feeling": "Paz"
    },
    // ... mais 9 resultados
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 2. Segunda página com 10 resultados
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?page=2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Primeira página com 5 resultados
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta:**
```json
{
  "data": [
    // 5 resultados
  ],
  "total": 45,
  "page": 1,
  "limit": 5,
  "totalPages": 9
}
```

### 4. Terceira página com 20 resultados
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?page=3&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5. Máximo de resultados por página (100)
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?limit=100" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Validações

### Erro: Página inválida
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?page=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Page must be greater than 0"
}
```

### Erro: Limit muito grande
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?limit=200" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Limit must be between 1 and 100"
}
```

### Erro: Limit muito pequeno
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?limit=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta (400):**
```json
{
  "statusCode": 400,
  "message": "Limit must be between 1 and 100"
}
```

## Usando em Frontend (JavaScript/TypeScript)

### Exemplo com Fetch API
```typescript
async function getResults(page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:3000/photo-analysis/results?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }

  return await response.json();
}

// Usar a função
const result = await getResults(1, 10);
console.log(`Total de resultados: ${result.total}`);
console.log(`Página atual: ${result.page} de ${result.totalPages}`);
console.log(`Resultados:`, result.data);
```

### Exemplo com Axios
```typescript
import axios from 'axios';

async function getResults(page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  const { data } = await axios.get(
    'http://localhost:3000/photo-analysis/results',
    {
      params: { page, limit },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return data;
}

// Exemplo de navegação entre páginas
let currentPage = 1;
const pageSize = 10;

async function loadNextPage() {
  const result = await getResults(currentPage, pageSize);

  if (currentPage < result.totalPages) {
    currentPage++;
  }

  return result;
}

async function loadPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
  }

  return await getResults(currentPage, pageSize);
}
```

## Campos Retornados

Cada item no array `data` contém:

- **description**: Descrição da cena analisada
- **location**: Local/ambiente identificado (opcional)
- **style**: Estilo da foto (opcional)
- **feeling**: Sentimento transmitido (opcional)

## Metadados de Paginação

- **total**: Total de resultados disponíveis no banco
- **page**: Página atual
- **limit**: Quantidade de resultados por página
- **totalPages**: Total de páginas disponíveis
