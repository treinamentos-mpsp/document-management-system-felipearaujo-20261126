import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('');

    try {
      await uploadDocument(file, userId);
      form.reset();
      setFile(null);
      setMessage('Arquivo enviado com sucesso.');
      await onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        aria-label="Arquivo para upload"
        onChange={(event) => setFile(event.target.files[0] || null)}
      />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
