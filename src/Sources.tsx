import { useEffect, useState } from "react";
import { listSources, uploadSource } from "./mockApi";

export default function Sources() {
  const [data, setData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const load = async () => setData(await listSources());

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!file) return;
    await uploadSource(file);
    setFile(null);
    await load();
  };

  return (
    <>
      <h2>Fontes</h2>
      <input type="file" accept=".csv,.xlsx,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={submit} disabled={!file}>Enviar</button>

      <table>
        <thead>
          <tr>
            <th>Nome</th><th>Tipo</th><th>Estado</th><th>Upload por</th><th>Data</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.type}</td>
              <td>{s.status}</td>
              <td>{s.uploaded_by?.name}</td>
              <td>{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
