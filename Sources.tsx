import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { listSources, sampleEntities, uploadSourceExcel } from "../api/sources";
import { friendlyError } from "../lib/httpError";

import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { DataTable } from "../components/DataTable";

import type { InfoSourceRead } from "../types";

export default function Sources() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["sources"], queryFn: listSources });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [previewErr, setPreviewErr] = useState<string | null>(null);

  const uploadM = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select an Excel file.");
      if (!name.trim()) throw new Error("Provide a source name.");
      return uploadSourceExcel(file, name.trim(), description.trim() || undefined);
    },
    onSuccess: async () => {
      toast.success("Source uploaded");
      setName(""); setDescription(""); setFile(null);
      await qc.invalidateQueries({ queryKey: ["sources"] });
    },
    onError: (e: any) => toast.error(e?.message ?? friendlyError(e)),
  });

  const openPreview = async (id: number) => {
    setPreviewOpen(true);
    setPreview(null);
    setPreviewErr(null);
    try {
      setPreview(await sampleEntities(id, 10));
    } catch (e: any) {
      setPreviewErr(friendlyError(e));
    }
  };

  const data = useMemo(() => (q.data ?? []).sort((a,b)=> (b.id ?? 0)-(a.id ?? 0)), [q.data]);

  const columns = useMemo<ColumnDef<InfoSourceRead>[]>(() => [
    { header: "ID", accessorKey: "id", cell: (c) => <span className="text-neutral-300">{c.getValue<number>()}</span> },
    { header: "Name", accessorKey: "name", cell: (c) => <div className="font-medium text-neutral-100">{c.getValue<string>()}</div> },
    { header: "Rows", accessorKey: "row_count", cell: (c) => <span className="text-neutral-300">{c.getValue<any>() ?? "-"}</span> },
    { header: "Created", accessorKey: "created_at", cell: (c) => <span className="text-neutral-500">{String(c.getValue<any>() ?? "-")}</span> },
    { header: "", id: "actions", cell: (ctx) => (
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => openPreview(ctx.row.original.id)}>Preview</Button>
      </div>
    )},
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Data Sources</h1>
          <div className="mt-1 text-xs text-neutral-500">Controlled ingestion of client-approved datasets (Excel).</div>
        </div>
        <Badge tone={q.isError ? "bad" : "neutral"}>{q.isLoading ? "Loading" : "Ready"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Upload source (Excel)</div>
          <div className="mt-1 text-xs text-neutral-500">Provide a name, optional description, and the dataset file.</div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Source name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Internal Watchlist v1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Provenance, scope, notes..." />
            </div>
            <div className="md:col-span-2">
              <Label>Excel file</Label>
              <input type="file" accept=".xlsx,.xls"
                className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-neutral-100 hover:file:bg-white/15"
                onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
              {file && <div className="mt-2 text-xs text-neutral-500">Selected: <span className="text-neutral-300">{file.name}</span></div>}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <Button variant="primary" onClick={()=>uploadM.mutate()} disabled={uploadM.isPending}>
              {uploadM.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {data.length === 0 && !q.isLoading ? (
        <EmptyState title="No sources yet" description="Upload your first Excel dataset to begin risk matching." actionLabel="Refresh" onAction={()=>q.refetch()} />
      ) : (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Registered sources</div>
              <div className="mt-1 text-xs text-neutral-500">Preview a sample returned by the backend.</div>
            </div>
            <Button variant="ghost" onClick={()=>q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Refreshing..." : "Refresh"}</Button>
          </CardHeader>
          <CardBody>
            <DataTable data={data} columns={columns} getSearchText={(r)=>`${r.id} ${r.name} ${r.description ?? ""}`} searchPlaceholder="Search sources..." />
          </CardBody>
        </Card>
      )}

      <Modal open={previewOpen} title="Preview entities" description="Sample of entities returned by the backend." onClose={()=>setPreviewOpen(false)}>
        {previewErr && <div className="text-sm text-red-200">{previewErr}</div>}
        {!previewErr && !preview && <div className="text-sm text-neutral-400">Loading...</div>}
        {preview && (
          <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-200 whitespace-pre-wrap break-words">
{JSON.stringify(preview, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  );
}
