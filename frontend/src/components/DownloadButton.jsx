import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function DownloadButton({ documentId, userId }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setIsDownloading(true);
    setError('');

    try {
      const { blob, fileName } = await downloadDocument(documentId, userId);
      saveBlob(blob, fileName);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <span role="alert" style={{ marginLeft: '0.5rem' }}>{error}</span>}
    </>
  );
}
