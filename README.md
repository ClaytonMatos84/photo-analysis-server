# Photo Analysis Server

API em NestJS para autenticação de usuários e execução de análises de mídia com integração a serviço externo.

## O que este projeto faz

- Cadastro e login de usuários com JWT.
- Gestão de perfil de usuário autenticado.
- Análise de imagens por upload (`photo-analysis`) com persistência de resultados.
- Análise estratégica de anúncios por URL de imagem (`ad-analysis`) com persistência em 3 entidades (`comparador`, `estrategia`, `melhoria`).
- Análise de vídeos do YouTube por URL (`youtube-analysis`) com extração e persistência de metadados do player.
- Listagem paginada e consulta de resultados por usuário.

## Stack

- Node.js + TypeScript
- NestJS 11
- TypeORM + SQLite (`better-sqlite3`)
- `nestjs-pino` para logs estruturados
- Axios para integração com serviço externo

## Variáveis de ambiente

- `PORT`: porta HTTP da API (default `3000`)
- `PHOTO_ANALYSIS_URL`: URL base do serviço externo de análise (obrigatória para `photo-analysis` e `ad-analysis`)
- `AD_ANALYSIS_TIMEOUT_MS`: timeout da integração de anúncios em ms (default `120000`)
- `CORS_ORIGINS`: lista de origens separadas por vírgula ou `*`
- `LOG_LEVEL`: nível de log (`debug`, `info`, etc.)
- `DATABASE_PATH`: caminho do arquivo SQLite em produção
- `YOUTUBE_FETCH_TIMEOUT_MS`: timeout em ms para coleta da página do YouTube (default `30000`)
- `YOUTUBE_CA_CERT_PATH`: caminho de certificado CA custom para conexões HTTPS ao YouTube (ex.: certificado corporativo)
- `YOUTUBE_INSECURE_TLS`: quando `true`, desabilita validação TLS para requisições YouTube (usar apenas troubleshooting)

## Execução local

```bash
npm install
npm run start:dev
```

API disponível em `http://localhost:3000`.

## Scripts úteis

```bash
# build
npm run build

# execução
npm run start
npm run start:dev
npm run start:prod

# qualidade
npm run lint
npm run format

# testes
npm run test
npm run test:e2e
npm run test:cov
```

## Módulos e rotas

- `auth`
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/profile`
  - `GET /auth/users`
- `user-profiles`
  - `POST /user-profiles`
  - `PUT /user-profiles`
  - `GET /user-profiles`
- `photo-analysis`
  - `POST /photo-analysis/analyze`
  - `POST /photo-analysis/results`
  - `GET /photo-analysis/results`
  - `GET /photo-analysis/results/:id`
- `ad-analysis`
  - `GET /ad-analysis/analyze?image_url=...`
  - `GET /ad-analysis/results`
  - `GET /ad-analysis/results/:analysisId`
- `youtube-analysis`
  - `GET /youtube-analysis/analyze?url=...`
  - `GET /youtube-analysis/results`
  - `GET /youtube-analysis/results/:id`
  - `DELETE /youtube-analysis/results/:id`

## Logs

- Logs HTTP e de aplicação com `nestjs-pino`.
- Campos de correlação: `requestId` e `service`.
- É possível enviar `x-request-id` para rastreabilidade ponta a ponta.

## Documentação adicional

- [docs/photo-analysis-results.md](docs/photo-analysis-results.md)
- [docs/pagination-examples.md](docs/pagination-examples.md)
- [docs/user-profile-api.md](docs/user-profile-api.md)
- [docs/ad-analysis-api.md](docs/ad-analysis-api.md)
- [docs/youtube-analysis-api.md](docs/youtube-analysis-api.md)

## Observações

- O banco SQLite é configurado automaticamente via TypeORM com `synchronize: true`.
- Todos os endpoints de análise e perfil exigem JWT (exceto endpoints públicos de autenticação).
