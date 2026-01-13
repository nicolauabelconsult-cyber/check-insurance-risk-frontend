import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { friendlyError } from "../lib/httpError";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";

export default function Analyses() {
  const [payload, setPayload] = useState({ full_name: "", document_id: "", nationality: "", dob: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runAnalysis(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/api/analyses", payload);
      setResult(res.data);
      toast.success("Analysis created");
    } catch (err) {
      toast.error(friendlyError(err) + " (If this fails, enable /api/analyses in backend.)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Create analysis</div>
            <div className="text-xs text-neutral-500">Submit client data to generate a risk score.</div>
          </div>
          <Badge tone="neutral">Beta</Badge>
        </CardHeader>
        <CardBody>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={runAnalysis}>
            <div>
              <Label>Full name</Label>
              <Input value={payload.full_name} onChange={(e) => setPayload((s) => ({ ...s, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>Document ID (NIF/Passport)</Label>
              <Input value={payload.document_id} onChange={(e) => setPayload((s) => ({ ...s, document_id: e.target.value }))} />
            </div>
            <div>
              <Label>Nationality</Label>
              <Input value={payload.nationality} onChange={(e) => setPayload((s) => ({ ...s, nationality: e.target.value }))} />
            </div>
            <div>
              <Label>Date of birth</Label>
              <Input placeholder="YYYY-MM-DD" value={payload.dob} onChange={(e) => setPayload((s) => ({ ...s, dob: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Button variant="primary" disabled={loading || !payload.full_name.trim()}>
                {loading ? "Running..." : "Run analysis"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Result</div>
          <div className="text-xs text-neutral-500">Shows output when backend endpoint exists.</div>
        </CardHeader>
        <CardBody>
          {result ? (
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className="text-sm text-neutral-500">No result yet.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
