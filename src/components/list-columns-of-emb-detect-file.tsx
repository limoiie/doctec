"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DetectedFileVO } from "@/data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bytesToSize, formatDateTime } from "@/utils";
import { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";
import { EmbeddedFileDetectionTaskResData } from "@/types/EmbeddedFileDetectionTaskResData.schema";
import { MaliciousDocDetectionTaskResData } from "@/types/MaliciousDocDetectionTaskResData.schema";
import { Badge } from "./ui/badge";

export function listColumnsOfEmbDetectFile(
  cfg: DetectionTaskCfgData,
): ColumnDef<DetectedFileVO>[] {
  let columns: ColumnDef<DetectedFileVO>[] = [...basicColumns];
  if (cfg.configs.some((c) => c.type === "embedded-file")) {
    columns = [...columns, ...embeddedFileColumns];
  }
  if (cfg.configs.some((c) => c.type === "malicious-doc")) {
    columns = [...columns, ...maliciousDocColumns];
  }
  return columns;
}

const basicColumns: ColumnDef<DetectedFileVO>[] = [
  {
    id: "filepath",
    accessorFn: (row) => row.data.metadata.path,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="文件路径" />
    ),
    cell: ({ row }) => <div>{row.getValue("filepath")}</div>,
  },
  {
    id: "size",
    accessorFn: (row) => row.data.metadata.data.size,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="文件大小" />
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
    id: "md5",
    accessorFn: (row) => row.data.metadata.data.md5,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MD5值" />
    ),
    cell: ({ row }) => {
      const md5Value = row.getValue("md5") as string;
      return (
        <Tooltip>
          <TooltipTrigger className="font-mono">
            <span className="inline-block">{md5Value}</span>
          </TooltipTrigger>
        </Tooltip>
      );
    },
  },
  {
    id: "kind",
    accessorFn: (row) => row.data.metadata.data.kind,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="文件类型" />
    ),
    cell: ({ row }) => <div>{row.getValue("kind")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "created",
    accessorFn: (row) => row.data.metadata.created,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => <div>{formatDateTime(row.getValue("created"))}</div>,
  },
  {
    id: "modified",
    accessorFn: (row) => row.data.metadata.modified,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="修改时间" />
    ),
    cell: ({ row }) => <div>{formatDateTime(row.getValue("modified"))}</div>,
  },
  {
    id: "creator",
    accessorFn: (row) => row.data.metadata.creator,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建者" />
    ),
    cell: ({ row }) => <div>{row.getValue("creator")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "modifier",
    accessorFn: (row) => row.data.metadata.modifier,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="修改者" />
    ),
    cell: ({ row }) => <div>{row.getValue("modifier")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "is_embedded",
    accessorFn: (row) => row.data.metadata.is_embedded,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="是否夹带" />
    ),
    cell: ({ row }) => <div>{row.getValue("is_embedded")}</div>,
  },
  {
    id: "is_nested",
    accessorFn: (row) => row.data.metadata.is_nested,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="是否嵌套" />
    ),
    cell: ({ row }) => <div>{row.getValue("is_nested")}</div>,
  },
  {
    id: "isLocallyCreated",
    accessorFn: (row) => row.data.metadata.data.isLocallyCreated,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="是否本机创建" />
    ),
    cell: ({ row }) => <div>{row.getValue("isLocallyCreated") ? "否" : "是"}</div>,
  },
  {
    id: "description",
    accessorFn: (row) => row.data.metadata.data.description,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="描述" />
    ),
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
  },

];

const embeddedFileColumns: ColumnDef<DetectedFileVO>[] = [
  
];

const maliciousDocColumns: ColumnDef<DetectedFileVO>[] = [
  {
    id: "mal-confidence",
    accessorFn: (row) => resultOf("malicious-doc", row.data.results).confidence,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="恶意置信度" />
    ),
    cell: ({ row }) => {
      const res: MaliciousDocDetectionTaskResData = resultOf(
        "malicious-doc",
        row.original.data.results,
      ) as MaliciousDocDetectionTaskResData;
      return (
        <div>
          {res.confidence}{" "}
          {
            res.severity === "high" ? (
              <span className="text-xs text-red-500">({"高风险"})</span>
            ) : res.severity === "medium" ? (
              <span className="text-xs text-yellow-500">({"中风险"})</span>
            ) : (
              <span className="text-xs text-green-500">({"低风险"})</span>
            )
          }
        </div>
      );
    },
  },
  {
    id: "mal-category",
    accessorFn: (row) => resultOf("malicious-doc", row.data.results).confidence,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="恶意描述" />
    ),
    cell: ({ row }) => {
      const res: MaliciousDocDetectionTaskResData = resultOf(
        "malicious-doc",
        row.original.data.results,
      ) as MaliciousDocDetectionTaskResData;
      return (
        <div>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">{res.category}</Badge>
            </TooltipTrigger>
            <TooltipContent>{res.description}</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];

function resultOf(
  type: "malicious-doc" | "embedded-file",
  results: (
    | MaliciousDocDetectionTaskResData
    | EmbeddedFileDetectionTaskResData
  )[],
) {
  for (const result of results) {
    if (result.type == type) {
      return result;
    }
  }
  throw new Error(`No result found for type: ${type}`);
}
