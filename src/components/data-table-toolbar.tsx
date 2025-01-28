"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import * as React from "react";

export interface FacedFilterDef {
  columnKey: string;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  facedFilters: FacedFilterDef[];
  searchColumnKey: string;
}

export function DataTableToolbar<TData>({
  table,
  facedFilters,
  searchColumnKey,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter ${searchColumnKey}...`}
          value={
            (table.getColumn(searchColumnKey)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(searchColumnKey)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {facedFilters.map((facedFilter) => (
          <DataTableFacetedFilter
            key={facedFilter.columnKey}
            column={table.getColumn(facedFilter.columnKey)}
            title={facedFilter.title}
            options={facedFilter.options}
          />
        ))}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
