import { ReactNode, useMemo, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableSortDirection = "asc" | "desc";

export interface DataTableColumn<TData> {
  key: string;
  header: string;
  accessor: (row: TData) => unknown;
  cell?: (row: TData) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<TData> {
  title: string;
  description?: string;
  data: TData[];
  columns: DataTableColumn<TData>[];
  defaultSortKey?: string;
  defaultSortDirection?: DataTableSortDirection;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DataTable<TData>({
  title,
  description,
  data,
  columns,
  defaultSortKey,
  defaultSortDirection = "asc",
  initialPageSize = 8,
  pageSizeOptions = [5, 8, 12, 20],
  searchPlaceholder = "Search rows...",
  emptyMessage = "No records available.",
}: DataTableProps<TData>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>(defaultSortDirection);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.trim().toLowerCase();
    const searchableColumns = columns.filter((column) => column.searchable !== false);

    return data.filter((row) =>
      searchableColumns.some((column) => normalizeValue(column.accessor(row)).toLowerCase().includes(query)),
    );
  }, [columns, data, searchQuery]);

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return filteredRows;
    }

    const column = columns.find((entry) => entry.key === sortKey);
    if (!column) {
      return filteredRows;
    }

    const directionWeight = sortDirection === "asc" ? 1 : -1;
    return [...filteredRows].sort((leftRow, rightRow) => {
      const left = normalizeForSort(column.accessor(leftRow));
      const right = normalizeForSort(column.accessor(rightRow));
      if (left < right) {
        return -1 * directionWeight;
      }
      if (left > right) {
        return 1 * directionWeight;
      }
      return 0;
    });
  }, [columns, filteredRows, sortDirection, sortKey]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = sortedRows.slice(pageStart, pageStart + pageSize);

  const toggleSort = (column: DataTableColumn<TData>) => {
    if (!column.sortable) {
      return;
    }

    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDirection("asc");
      return;
    }

    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  };

  const handlePageSizeChange = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    setPageSize(parsed);
    setPage(1);
  };

  return (
    <Card className="glass-surface">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
          {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="max-w-sm"
          />
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[8rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Records: {totalRows}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const isActiveSort = sortKey === column.key;
                return (
                  <TableHead key={column.key} className={cn("font-semibold text-slate-700", column.headerClassName)}>
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        type="button"
                        className="h-auto px-0 py-0 text-left font-semibold text-slate-700 hover:bg-transparent hover:text-slate-900"
                        onClick={() => toggleSort(column)}
                      >
                        {column.header}
                        <ArrowDownUp
                          className={cn(
                            "size-4 text-slate-400",
                            isActiveSort ? "text-emerald-700" : "",
                            isActiveSort && sortDirection === "desc" ? "rotate-180" : "",
                          )}
                        />
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!pageRows.length ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, index) => (
                <TableRow key={getRowKey(row, index)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell ? column.cell(row) : normalizeValue(column.accessor(row))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500">
            Showing {totalRows === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageRows.length, totalRows)} of {totalRows}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
              Page {safePage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRowKey<TData>(row: TData, index: number): string {
  if (typeof row === "object" && row !== null && "id" in row) {
    const rawId = (row as { id?: unknown }).id;
    if (typeof rawId === "string" || typeof rawId === "number") {
      return String(rawId);
    }
  }
  return `row-${index}`;
}

function normalizeForSort(value: unknown): number | string {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return normalizeValue(value).toLowerCase();
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  return JSON.stringify(value);
}
