"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EmbDetectFile } from "@/data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { bytesToSize, formatDateTime } from "@/utils";

export const columnsOfEmbDetectFile: ColumnDef<EmbDetectFile>[] = [
  {
    accessorKey: "parent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Relationship" />
    ),
    cell: ({ row }) => <div>{row.getValue("parent")}</div>,
  },
  {
    accessorKey: "filepath",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="FilePath" />
    ),
    cell: ({ row }) => <div>{row.getValue("filepath")}</div>,
  },
  {
    accessorKey: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => (
      <div className="text-nowrap text-right">
        <span className="inline-block">
          {bytesToSize(row.getValue("size"))}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "md5",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MD5" />
    ),
    cell: ({ row }) => {
      const md5Value = row.getValue("md5") as string;
      return (
        <Tooltip>
          <TooltipTrigger className="font-mono">
            <span className="inline-block">{md5Value.substring(0, 8)}</span>
          </TooltipTrigger>
          <TooltipContent>{md5Value}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "kind",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kind" />
    ),
    cell: ({ row }) => <div>{row.getValue("kind")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => <div>{formatDateTime(row.getValue("created"))}</div>,
  },
  {
    accessorKey: "modified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modified" />
    ),
    cell: ({ row }) => <div>{formatDateTime(row.getValue("modified"))}</div>,
  },
  {
    accessorKey: "creator",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creator" />
    ),
    cell: ({ row }) => <div>{row.getValue("creator")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "modifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modifier" />
    ),
    cell: ({ row }) => <div>{row.getValue("modifier")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
