"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EmbDetectFileVO } from "@/data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bytesToSize, formatDateTime } from "@/utils";
import { FileIcon, FileMinus2Icon, FilePlus2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableExpandableColumnHeader } from "@/components/data-table-expandable-column-header";

export const treeColumnsOfEmbDetectFile: ColumnDef<EmbDetectFileVO>[] = [
  // {
  //   accessorKey: "ancestors",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Relationship" />
  //   ),
  //   cell: ({ row }) => <div>{JSON.stringify(row.getValue("ancestors"))}</div>,
  // },
  {
    accessorKey: "filepath",
    header: ({ column, table }) => (
      <DataTableExpandableColumnHeader
        column={column}
        table={table}
        title="FilePath"
      />
    ),
    cell: ({ row }) => (
      <div
        className="flex items-center"
        style={{
          paddingLeft: `${row.original.ancestors.length * 1.5}em`,
        }}
      >
        {row.getCanExpand() ? (
          <Button
            variant="ghost"
            className="w-4 h-4 p-0 m-2"
            onClick={row.getToggleExpandedHandler()}
          >
            {row.getIsExpanded() ? (
              <FileMinus2Icon size={14} />
            ) : (
              <FilePlus2Icon size={14} />
            )}
          </Button>
        ) : (
          <Button variant="ghost" className="w-4 h-4" disabled={true}>
            <FileIcon size={14} />
          </Button>
        )}
        {row.getValue("filepath")}
      </div>
    ),
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
