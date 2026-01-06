import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function DataTable<TData>({
  data, columns, searchPlaceholder="Search...", getSearchText,
}:{
  data:TData[]; columns:ColumnDef<TData, any>[]; searchPlaceholder?:string; getSearchText?:(row:TData)=>string;
}){
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const filtered = React.useMemo(()=>{
    if(!globalFilter.trim() || !getSearchText) return data;
    const t = globalFilter.trim().toLowerCase();
    return data.filter(r => getSearchText(r).toLowerCase().includes(t));
  },[data, globalFilter, getSearchText]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-3">
      {getSearchText && (
        <div className="flex items-center justify-between gap-3">
          <div className="w-80 max-w-full">
            <Input value={globalFilter} onChange={(e)=>setGlobalFilter(e.target.value)} placeholder={searchPlaceholder} />
          </div>
          <div className="text-xs text-neutral-500">{filtered.length} records</div>
        </div>
      )}

      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {h.isPlaceholder ? null : (
                      <button className="inline-flex items-center gap-2 hover:text-neutral-200" onClick={h.column.getToggleSortingHandler()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" ? "▲" : h.column.getIsSorted() === "desc" ? "▼" : ""}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t border-white/10 hover:bg-white/5">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-neutral-200 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {!table.getRowModel().rows.length && (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-neutral-500">No data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">Page {table.getState().pagination.pageIndex+1} of {table.getPageCount()}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button size="sm" variant="ghost" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
