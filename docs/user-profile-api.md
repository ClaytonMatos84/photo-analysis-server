# User Profile API

## Descrição

O módulo de User Profile complementa os dados dos usuários no sistema. Fornece endpoints para criar, atualizar e buscar perfis de usuários.

## Características

- **Entidade Opcional**: Os dados de perfil não são obrigatórios para usuários criados no sistema
- **Relação 1:1**: Cada usuário pode ter no máximo um perfil complementar
- **Autenticação Obrigatória**: Todos os endpoints requerem autenticação via JWT token
- **Dados Complementares**: Nome, data de nascimento, endereço e profissão

## Entidade UserProfile

```typescript
{
  id: number; // ID único do perfil
  userId: number; // ID do usuário (chave estrangeira)
  name: string; // Nome completo (opcional)
  birthDate: Date; // Data de nascimento (opcional) formato DD/MM/YYYY
  address: string; // Endereço (opcional)
  profession: string; // Profissão (opcional)
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de atualização
}
```

## Endpoints

### 1. Criar Perfil de Usuário

**POST** `/user-profiles`

Cria um novo perfil para o usuário autenticado.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "João Silva",
  "birthDate": "15/05/1990",
  "address": "Rua Principal, 123, São Paulo",
  "profession": "Engenheiro de Software"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "username": "joao@example.com",
  "name": "João Silva",
  "birthDate": "15/05/1990",
  "address": "Rua Principal, 123, São Paulo",
  "profession": "Engenheiro de Software"
}
```

---

### 2. Atualizar Perfil de Usuário

**PUT** `/user-profiles`

Atualiza o perfil do usuário autenticado. Campos são opcionais.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "João Silva Atualizado",
  "profession": "Senior Software Engineer"
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "username": "joao@example.com",
  "name": "João Silva Atualizado",
  "birthDate": "15/05/1990",
  "address": "Rua Principal, 123, São Paulo",
  "profession": "Senior Software Engineer"
}
```

---

### 3. Buscar Perfil do Usuário Autenticado

**GET** `/user-profiles`

Retorna o perfil do usuário autenticado com base no token JWT fornecido.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "username": "joao@example.com",
  "name": "João Silva",
  "birthDate": "15/05/1990",
  "address": "Rua Principal, 123, São Paulo",
  "profession": "Engenheiro de Software"
}
```

**Erros:**

- `404 Not Found`: Perfil não encontrado

---

## Exemplo de Uso Completo

### 1. Registrar usuário

```bash
POST /auth/register
{
  "username": "joao@example.com",
  "password": "senha123"
}
```

### 2. Fazer login

```bash
POST /auth/login
{
  "username": "joao@example.com",
  "password": "senha123"
}
Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Criar perfil

```bash
POST /user-profiles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "name": "João Silva",
  "birthDate": "1990-05-15",
  "address": "Rua Principal, 123, São Paulo",
  "profession": "Engenheiro de Software"
}
```

### 4. Buscar perfil (do usuário autenticado)

```bash
GET /user-profiles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Atualizar perfil

```bash
PUT /user-profiles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "profession": "Senior Software Engineer"
}
```

## Validações

- **Autenticação**: Todos os endpoints requerem um JWT válido
- **Profil Único**: Um usuário não pode ter mais de um perfil
- **Usuário Existente**: O usuário deve existir no sistema para ter um perfil
- **Data de Nascimento**: Deve estar em formato ISO 8601 (YYYY-MM-DD)
- **Campos Opcionais**: Todos os campos (name, birthDate, address, profession) são opcionais

## Códigos de Resposta

| Código | Descrição                                  |
| ------ | ------------------------------------------ |
| 200    | Sucesso na busca ou atualização            |
| 201    | Perfil criado com sucesso                  |
| 400    | Requisição inválida (ex: perfil já existe) |
| 401    | Não autenticado                            |
| 404    | Usuário ou perfil não encontrado           |

## Estrutura de Diretórios

```
src/
├── auth/
│   ├── user-profile.entity.ts      # Entidade UserProfile
│   ├── user.entity.ts              # Entidade User existente
│   └── ...
├── user-profile/
│   ├── dto/
│   │   ├── create-user-profile.dto.ts
│   │   ├── update-user-profile.dto.ts
│   │   └── user-profile-response.dto.ts
│   ├── user-profile.controller.ts
│   ├── user-profile.service.ts
│   └── user-profile.module.ts
└── ...
```

## Deletar Perfil

Ao deletar um usuário, seu perfil será automaticamente deletado em cascata (ON DELETE CASCADE).
