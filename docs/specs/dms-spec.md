# Especificação - Document Management System (DMS)

## 1. Objetivo

Entregar um sistema web que permita enviar, listar e baixar documentos, com gestão simples por usuário e armazenamento local na aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (multipart/form-data, via `multer` com `diskStorage`)
- Listagem de documentos do usuário
- Download de documentos pelo identificador
- Gestão simples por usuário (cada documento pertence a um dono)
- Backend em Node.js + Express (CommonJS) com testes via `node:test`
- Frontend em React + Vite (ESM), comunicando-se via `fetch` pelo prefixo `/api`

### Fora do escopo

- Armazenamento externo, em nuvem ou serviços de upload de terceiros
- Versionamento de documentos
- Persistência de metadados em banco de dados (nesta fase, apenas em memória)
- Autenticação completa (login, senha, tokens); o dono é informado de forma simples
- TypeScript

## 3. Requisitos funcionais

| ID    | Requisito                                                                                   |
| ----- | ------------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento; o sistema grava o arquivo e registra os metadados        |
| RF-02 | O usuário pode listar os documentos de sua propriedade                                       |
| RF-03 | O usuário pode baixar um documento pelo identificador, desde que seja o dono                 |
| RF-04 | O sistema rejeita uploads sem arquivo ou acima do tamanho máximo configurado                 |
| RF-05 | O sistema responde 404 quando o documento solicitado não existe                              |
| RF-06 | A interface permite selecionar e enviar um arquivo, exibir a lista e iniciar o download      |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                                   |
| ------ | ------------------------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local, em `backend/storage`, via `multer` com `diskStorage` |
| RNF-02 | Metadados mantidos em memória nesta fase                                                     |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor), incluindo porta e tamanho máximo         |
| RNF-04 | Backend segue `routes -> controllers -> services -> repositories`                            |
| RNF-05 | Erros tratados nos limites do sistema (entrada HTTP, leitura e escrita de arquivos)          |
| RNF-06 | Mensagens ao usuário e comentários em português; símbolos de código em inglês                |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                              |
| ------------ | ------ | ------------------------------------------------------ |
| id           | string | Identificador único do documento (UUID)                |
| originalName | string | Nome original do arquivo enviado                       |
| storedName   | string | Nome do arquivo gravado em `backend/storage`           |
| mimeType     | string | Tipo MIME informado no upload                          |
| size         | number | Tamanho em bytes                                       |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                         |
| owner        | string | Identificador do usuário dono                          |

Os metadados ficam em um repositório em memória (Map). Reiniciar o servidor apaga os registros, mas não os arquivos físicos. Essa limitação é aceita nesta fase.

## 6. Contratos de API

Todas as rotas são prefixadas por `/api` no frontend (proxy do Vite). O dono é informado pelo cabeçalho `X-User-Id`.

### POST /upload

- Entrada: multipart/form-data com campo `file`; cabeçalho `X-User-Id`
- Sucesso: `201 Created`, corpo com os metadados do documento
- Erros: `400` (sem arquivo ou cabeçalho ausente), `413` (arquivo acima do limite)

```json
{
  "id": "uuid",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 20480,
  "uploadedAt": "2026-11-26T12:00:00.000Z",
  "owner": "user-1"
}
```

### GET /documents

- Entrada: cabeçalho `X-User-Id`
- Sucesso: `200 OK`, array com os metadados dos documentos do dono (pode ser vazio)
- Erros: `400` (cabeçalho ausente)

### GET /documents/:id/download

- Entrada: parâmetro `id`; cabeçalho `X-User-Id`
- Sucesso: `200 OK`, corpo binário, com `Content-Disposition: attachment; filename="<originalName>"`
- Erros: `400` (cabeçalho ausente), `404` (documento inexistente ou de outro dono), `500` (falha de leitura do arquivo)

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples: `routes/` define endpoints, `controllers/` trata HTTP, `services/` concentra regras, `repositories/` faz persistência. Camadas internas não conhecem as externas.
- Armazenamento de arquivos somente local, com `multer` e `diskStorage` em `backend/storage`.
- Metadados em memória nesta fase, isolados em `repositories/`, para permitir troca futura por banco sem alterar services.
- Frontend organizado em `components/`, `pages/` e `services/`, com componentes funcionais e hooks.
- Sem overengineering: sem autenticação completa, sem versionamento e sem camadas extras.

## 8. Plano de execução

Etapas em ordem de implementação. Esta especificação não executa nenhuma delas.

1. **Configuração base**: definir variáveis de ambiente (porta, tamanho máximo, diretório de storage) e carregar em `backend/src/app.js`. *Bloqueia as demais.*
2. **Repositório de documentos**: implementar persistência em memória (criar, listar por dono, buscar por id). *Depende de 1.*
3. **Serviço de documentos**: regras de upload, listagem e download com verificação de dono. *Depende de 2.*
4. **Upload com multer**: configurar `diskStorage` em `backend/storage` e a rota `POST /upload`. *Depende de 3.*
5. **Listagem e download**: rotas `GET /documents` e `GET /documents/:id/download`, com controllers e tratamento de erros. *Depende de 3; paralelo com 4.*
6. **Testes do backend**: cobrir os contratos da seção 6 com `node:test`, incluindo casos de erro. *Depende de 4 e 5.*
7. **Frontend base**: estrutura de `components/`, `pages/`, `services/` e proxy `/api` no Vite. *Paralelo com 1 a 6.*
8. **Frontend funcional**: formulário de upload, lista de documentos e botão de download consumindo os contratos. *Depende de 6 e 7.*
9. **Validação final**: conferir os requisitos RF-01 a RF-06 e RNF-01 a RNF-06 contra a implementação. *Depende de 8.*

## Anexos e critérios de aceite

- Cada requisito funcional possui pelo menos um teste automatizado ou verificação manual registrada.
- Nenhuma dependência de armazenamento externo é introduzida.
- O seed permanece simples e evolutivo.

---

**Pontos em aberto**

1. **Identificação do usuário**: o cabeçalho `X-User-Id` é suficiente nesta fase? Alternativa: campo no corpo do upload ou um seletor de usuário fixo no frontend.
2. **Tamanho máximo do arquivo**: sugestão de 10 MB via variável de ambiente. Confirma o valor?
3. **Tipos de arquivo aceitos**: aceitar qualquer tipo ou restringir uma lista (PDF, imagens, DOCX)?
