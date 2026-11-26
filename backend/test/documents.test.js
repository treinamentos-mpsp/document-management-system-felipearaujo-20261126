const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.STORAGE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.MAX_FILE_SIZE = '16';

const app = require('../src/app');
const documentsRepository = require('../src/repositories/documents.repository');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
  fs.rmSync(process.env.STORAGE_DIR, { recursive: true, force: true });
});

function uploadFile(owner, fileName, content) {
  const body = new FormData();
  body.append('file', new Blob([content]), fileName);
  const headers = owner ? { 'X-User-Id': owner } : {};
  return fetch(`${baseUrl}/upload`, { method: 'POST', body, headers });
}

async function uploadDocument(owner, fileName, content) {
  const response = await uploadFile(owner, fileName, content);
  assert.strictEqual(response.status, 201);
  return response.json();
}

function download(owner, id) {
  return fetch(`${baseUrl}/documents/${id}/download`, { headers: { 'X-User-Id': owner } });
}

test('POST /upload grava o arquivo e retorna os metadados sem o nome interno', async () => {
  const document = await uploadDocument('ana', 'nota.txt', 'abc');

  assert.strictEqual(document.originalName, 'nota.txt');
  assert.strictEqual(document.size, 3);
  assert.strictEqual(document.owner, 'ana');
  assert.strictEqual(document.storedName, undefined);
});

test('POST /upload exige o cabeçalho X-User-Id', async () => {
  const response = await uploadFile(undefined, 'nota.txt', 'abc');
  assert.strictEqual(response.status, 400);
});

test('POST /upload rejeita campo de arquivo inesperado', async () => {
  const body = new FormData();
  body.append('outro', new Blob(['abc']), 'nota.txt');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body,
    headers: { 'X-User-Id': 'ana' },
  });

  assert.strictEqual(response.status, 400);
});

test('POST /upload rejeita arquivo acima do limite', async () => {
  const response = await uploadFile('ana', 'grande.txt', 'x'.repeat(17));
  assert.strictEqual(response.status, 413);
});

test('GET /documents lista somente os documentos do dono', async () => {
  await uploadDocument('mara', 'mara.txt', 'a');
  await uploadDocument('outra', 'outra.txt', 'b');

  const response = await fetch(`${baseUrl}/documents`, { headers: { 'X-User-Id': 'mara' } });
  const list = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(list.length, 1);
  assert.strictEqual(list[0].owner, 'mara');
});

test('GET download devolve o conteúdo original com nome em UTF-8', async () => {
  const document = await uploadDocument('bia', 'contrato-ação.txt', 'conteudo');
  const response = await download('bia', document.id);

  assert.strictEqual(document.originalName, 'contrato-ação.txt');
  assert.strictEqual(response.status, 200);
  assert.strictEqual(await response.text(), 'conteudo');
  assert.match(
    response.headers.get('content-disposition'),
    /filename\*=UTF-8''contrato-a%C3%A7%C3%A3o\.txt/,
  );
  assert.strictEqual(response.headers.get('x-content-type-options'), 'nosniff');
});

test('GET download responde 404 para outro dono ou id inexistente', async () => {
  const document = await uploadDocument('caio', 'a.txt', 'x');

  assert.strictEqual((await download('outro', document.id)).status, 404);
  assert.strictEqual((await download('caio', 'inexistente')).status, 404);
});

test('GET download responde 404 quando o arquivo sumiu do disco', async () => {
  const document = await uploadDocument('dani', 'sumiu.txt', 'x');
  const stored = documentsRepository.findById(document.id);
  fs.rmSync(path.join(process.env.STORAGE_DIR, stored.storedName));

  const response = await download('dani', document.id);

  assert.strictEqual(response.status, 404);
  assert.strictEqual(response.headers.get('content-disposition'), null);
  assert.strictEqual((await response.json()).error, 'Documento não encontrado');
});
