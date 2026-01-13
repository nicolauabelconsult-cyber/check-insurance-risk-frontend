import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { listSources, uploadExcel, sampleSource } from "../api/sources";
import { friendlyError } from "../lib/httpError";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

export default function Sources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleRows, setSampleRows] = useState([]);
  const [sampleTitle, setSampleTitle] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await listSources();
      setItems(Array.isArray(d) ? d : []);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onUpload(e) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setUploading(true);
    try {
      await uploadExcel({ file, name: name.trim(), description: description || null });
      toast.success("Source uploaded");
      setName("");
      setDescription("");
      setFile(null);
      await load();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setUploading(false);
    }
  }

  async function openSample(src) {
    try {
      const rows = await sampleSource(src.id, 10);
      setSampleRows(Array.isArray(rows) ? rows : []);
      setSampleTitle(`${src.name} (sample)`);
      setSampleOpen(true);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Upload Excel source</div>
          <div className="text-xs text-neutral-500">This phase supports Excel (.xlsx/.xls). Files are stored on ephemeral disk, so re-upload may be required after redeploys.</div>
        </CardHeader>
        <CardBody>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onUpload}>
            <div>
              <Label>Source name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Excel file</Label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-100 hover:file:bg-neutral-800"
              />
            </div>
            <div className="md:col-span-2">
              <Button variant="primary" disabled={!file || !name.trim() || uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Sources</div>
            <div className="text-xs text-neutral-500">Uploaded sources for matching / risk analysis.</div>
          </div>
          <Badge tone="neutral">{loading ? "Loading" : `${items.length}`}</Badge>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="rounded-xl border border-neutral-900 bg-neutral-950 p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="mt-1 text-xs text-neutral-500">{s.description || "—"}</div>
                  <div className="mt-2 text-xs text-neutral-600">Rows: <span className="text-neutral-300">{s.row_count ?? "—"}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openSample(s)}>View sample</Button>
                </div>
              </div>
            ))}
            {!loading && items.length === 0 ? <div className="text-sm text-neutral-500">No sources yet.</div> : null}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={sampleOpen}
        title={sampleTitle}
        onClose={() => setSampleOpen(false)}
        footer={<div className="text-xs text-neutral-500">Tip: if sample fails with “ephemeral disk”, re-upload the Excel file.</div>}
      >
        <div className="overflow-auto max-h-[60vh]">
          <pre className="text-xs text-neutral-200 whitespace-pre-wrap">{JSON.stringify(sampleRows, null, 2)}</pre>
        </div>
      </Modal>
    </div>
  );
}
