# Photo Analysis Results - Documentação

## Visão Geral

O módulo de resultados de análise de fotos permite salvar e gerenciar os resultados das análises realizadas no sistema.

## Entidade PhotoAnalysisResult

A tabela `photo_analysis_results` armazena os seguintes dados:

- **id**: Identificador único do resultado
- **userId**: ID do usuário que solicitou a análise
- **description**: Descrição da cena (descricao_cena)
- **location**: Local/ambiente da foto (local_ambiente)
- **style**: Estilo da foto (estilo_foto)
- **feeling**: Sentimento transmitido (sentimento_transmitido)
- **createdAt**: Data de criação do registro

## Endpoints Disponíveis

### 1. Analisar Imagem (com salvamento automático)

```http
POST /photo-analysis/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Query Parameters:**
- `saveResult` (boolean, opcional, default: true): Define se o resultado deve ser salvo automaticamente

**Body:**
- `imagem`: Arquivo de imagem (multipart/form-data)

**Exemplo:**
```bash
curl -X POST http://localhost:3000/photo-analysis/analyze \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "imagem=@foto.jpg" \
  -F "saveResult=true"
```

**Resposta:**
```json
{
  "descricao_cena": "Uma praia ao pôr do sol",
  "objetos_identificados": ["areia", "mar", "céu"],
  "pessoas": {
    "quantidade": "0",
    "descricao": "Nenhuma pessoa visível"
  },
  "local_ambiente": "Praia",
  "estilo_foto": "Paisagem natural",
  "sentimento_transmitido": "Tranquilidade e paz",
  "observacoes_adicionais": "Belas cores do pôr do sol"
}
```

### 2. Salvar Resultado Manualmente

```http
POST /photo-analysis/results
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Uma praia ao pôr do sol",
  "location": "Praia",
  "style": "Paisagem natural",
  "feeling": "Tranquilidade e paz"
}
```

**Resposta:**
```json
{
  "id": 1,
  "userId": 1,
  "description": "Uma praia ao pôr do sol",
  "location": "Praia",
  "style": "Paisagem natural",
  "feeling": "Tranquilidade e paz",
  "createdAt": "2025-12-26T10:30:00.000Z"
}
```

### 3. Listar Resultados do Usuário Logado (com Paginação)

```http
GET /photo-analysis/results?page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (number, opcional, default: 1): Número da página
- `limit` (number, opcional, default: 10): Quantidade de resultados por página (máximo: 100)

**Exemplo sem parâmetros (usa defaults):**
```bash
curl -X GET http://localhost:3000/photo-analysis/results \
  -H "Authorization: Bearer seu_token_jwt"
```

**Exemplo com paginação:**
```bash
curl -X GET "http://localhost:3000/photo-analysis/results?page=2&limit=5" \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta:**
```json
{
  "data": [
    {
      "description": "Outra descrição",
      "location": "Montanha",
      "style": "Aventura",
      "feeling": "Emoção"
    },
    {
      "description": "Uma praia ao pôr do sol",
      "location": "Praia",
      "style": "Paisagem natural",
      "feeling": "Tranquilidade e paz"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**Erros Possíveis:**
- 400: Page must be greater than 0
- 400: Limit must be between 1 and 100

### 4. Buscar Resultado Específico

```http
GET /photo-analysis/results/:id
Authorization: Bearer {token}
```

**Exemplo:**
```bash
curl -X GET http://localhost:3000/photo-analysis/results/1 \
  -H "Authorization: Bearer seu_token_jwt"
```

**Resposta:**
```json
{
  "id": 1,
  "userId": 1,
  "description": "Uma praia ao pôr do sol",
  "location": "Praia",
  "style": "Paisagem natural",
  "feeling": "Tranquilidade e paz",
  "createdAt": "2025-12-26T10:30:00.000Z"
}
```

**Erros Possíveis:**
- 404: Resultado não encontrado
- 403: Acesso negado (resultado não pertence ao usuário)

## Funcionalidades

### Salvamento Automático

Por padrão, quando uma imagem é analisada através do endpoint `/photo-analysis/analyze`, o resultado é automaticamente salvo no banco de dados associado ao usuário logado.

Para desativar o salvamento automático, envie o parâmetro `saveResult=false`:

```bash
curl -X POST http://localhost:3000/photo-analysis/analyze?saveResult=false \
  -H "Authorization: Bearer seu_token_jwt" \
  -F "imagem=@foto.jpg"
```

### Segurança

- Todos os endpoints exigem autenticação JWT
- Usuários só podem visualizar seus próprios resultados
- Tentativas de acessar resultados de outros usuários retornam erro 403

## Estrutura do Código

### Arquivos Criados/Modificados

1. **photo-analysis-result.entity.ts**: Entidade TypeORM para a tabela de resultados
2. **photo-analysis-result.service.ts**: Serviço para gerenciar operações de banco de dados
3. **photo-analysis.controller.ts**: Atualizado com novos endpoints
4. **photo-analysis.module.ts**: Atualizado para incluir a nova entidade e serviço
5. **index.ts**: Atualizado para exportar novos módulos

### Exemplo de Uso no Código

```typescript
import { PhotoAnalysisResultService } from './photo-analysis-result.service';

// Injetar o serviço
constructor(
  private readonly resultService: PhotoAnalysisResultService,
) {}

// Salvar resultado manualmente
const result = await this.resultService.saveAnalysisResult({
  userId: 1,
  description: 'Uma bela paisagem',
  location: 'Montanha',
  style: 'Natural',
  feeling: 'Paz',
});

// Salvar a partir de uma resposta de análise
const analysisResponse = await analyzeImage(...);
const savedResult = await this.resultService.saveFromAnalysisResponse(
  userId,
  analysisResponse,
);

// Buscar resultados do usuário
const userResults = await this.resultService.findByUserId(userId);
```
