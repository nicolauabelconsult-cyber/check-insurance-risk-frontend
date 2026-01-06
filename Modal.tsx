import React, { useEffect } from "react";
import { Card, CardBody, CardHeader } from "./Card";
import { Button } from "./Button";

export function Modal({
  open, title, description, children, onClose, primaryLabel, onPrimary, danger, loading,
}:{
  open:boolean; title:string; description?:string; children?:React.ReactNode; onClose:()=>void;
  primaryLabel?:string; onPrimary?:()=>void; danger?:boolean; loading?:boolean;
}){
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); };
    if(open) window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  },[open,onClose]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg" onMouseDown={(e)=>e.stopPropagation()}>
        <Card>
          <CardHeader className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{title}</div>
              {description && <div className="mt-1 text-xs text-neutral-400">{description}</div>}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </CardHeader>
          <CardBody>
            {children}
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              {primaryLabel && onPrimary && (
                <Button variant={danger ? "danger" : "primary"} onClick={onPrimary} disabled={loading}>
                  {loading ? "Working..." : primaryLabel}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
