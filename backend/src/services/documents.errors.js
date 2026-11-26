class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado');
    this.name = 'DocumentNotFoundError';
  }
}

module.exports = { DocumentNotFoundError };
