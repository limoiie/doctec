"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DetectedFileVO } from "@/data/schema";
import { FileIcon, FileMinus2Icon, FilePlus2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableExpandableColumnHeader } from "@/components/data-table-expandable-column-header";
import { DetectionTaskCfgData } from "@/types/DetectionTaskCfgData.schema";
import { listColumnsOfEmbDetectFile } from "@/components/list-columns-of-emb-detect-file";

export function treeColumnsOfEmbDetectFile(
  cfg: DetectionTaskCfgData,
): ColumnDef<DetectedFileVO>[] {
  const basicColumns = listColumnsOfEmbDetectFile(cfg).filter(
    (c) => c.id !== "filepath",
  );
  return [
    {
      id: "filepath",
      accessorFn: (row) => row.data.metadata.path,
      header: ({ column, table }) => (
        <DataTableExpandableColumnHeader
          column={column}
          table={table}
          title="文件路径"
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
    ...basicColumns,
  ];
}
