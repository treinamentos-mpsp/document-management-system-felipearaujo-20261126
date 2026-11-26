const API_PREFIX = '/api';

async function readErrorMessage(response) {
  try {
    const body = await response.json();
    return body.error || `Erro HTTP ${response.status}`;
  } catch {
    return `Erro HTTP ${response.status}`;
  }
}

async function request(path, { userId, ...options } = {}) {
  let response;

  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      headers: { 'X-User-Id': userId, ...options.headers },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

function parseFileName(contentDisposition) {
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition || '');
  if (encoded) {
    return decodeURIComponent(encoded[1]);
  }

  const plain = /filename="([^"]+)"/i.exec(contentDisposition || '');
  return plain ? plain[1] : 'documento';
}

export async function listDocuments(userId) {
  const response = await request('/documents', { userId });
  return response.json();
}

export async function uploadDocument(file, userId) {
  const body = new FormData();
  body.append('file', file);

  const response = await request('/upload', { method: 'POST', body, userId });
  return response.json();
}

export async function downloadDocument(documentId, userId) {
  const response = await request(`/documents/${encodeURIComponent(documentId)}/download`, {
    userId,
  });

  return {
    blob: await response.blob(),
    fileName: parseFileName(response.headers.get('Content-Disposition')),
  };
}
