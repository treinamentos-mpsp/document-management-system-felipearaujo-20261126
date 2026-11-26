import { useCallback, useEffect, useRef, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentsApi';

const DEFAULT_USER_ID = 'usuario-1';

export default function App() {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState('');
  const latestRequestId = useRef(0);
  const trimmedUserId = userId.trim();

  const refreshDocuments = useCallback(async () => {
    const requestId = ++latestRequestId.current;

    try {
      const list = await listDocuments(trimmedUserId);
      if (requestId === latestRequestId.current) {
        setDocuments(list);
        setLoadError('');
      }
    } catch (err) {
      if (requestId === latestRequestId.current) {
        setLoadError(err.message);
      }
    }
  }, [trimmedUserId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label>
        Usuário:{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>

      <section>
        <h2>Enviar documento</h2>
        <UploadComponent userId={trimmedUserId} onUploaded={refreshDocuments} />
      </section>

      <section>
        <h2>Documentos</h2>
        {loadError && <p role="alert">{loadError}</p>}
        <DocumentList documents={documents} userId={trimmedUserId} />
      </section>
    </main>
  );
}
