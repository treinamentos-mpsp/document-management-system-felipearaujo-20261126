import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentsApi';

const DEFAULT_USER_ID = 'usuario-1';

export default function App() {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState('');

  const refreshDocuments = useCallback(async () => {
    try {
      setDocuments(await listDocuments(userId));
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    }
  }, [userId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label>
        Usuário:{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value.trim())} />
      </label>

      <section>
        <h2>Enviar documento</h2>
        <UploadComponent userId={userId} onUploaded={refreshDocuments} />
      </section>

      <section>
        <h2>Documentos</h2>
        {loadError && <p role="alert">{loadError}</p>}
        <DocumentList documents={documents} userId={userId} />
      </section>
    </main>
  );
}
