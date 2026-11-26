import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ documents, userId }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Enviado em</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((item) => (
          <tr key={item.id}>
            <td>{item.originalName}</td>
            <td>{formatSize(item.size)}</td>
            <td>{formatDate(item.uploadedAt)}</td>
            <td>
              <DownloadButton documentId={item.id} userId={userId} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
