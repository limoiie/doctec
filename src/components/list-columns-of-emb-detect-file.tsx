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
import { eel } from "@/eel";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

// 文件类型判断函数
function isNonExecutableType(fileType: string): boolean {
  const nonExecutableTypes = ['Zip archive data, at least v2.0 to extract'];
  return nonExecutableTypes.includes(fileType);
}

function isExecutableType(fileType: string): boolean {
  const executableTypes = ['PE32 executable (GUI) Intel 80386, for MS Windows'];
  return executableTypes.includes(fileType);
}

// 获取文件类型的函数
function getFileType(fileId: number): Promise<string> {
  return eel.getfiletype(fileId)()
    .then((type: string) => {
      return type;
    })
    .catch((error: Error) => {
      console.error('Error getting file type:', error);
      return '';
    });
}

// 异步文件类型检查组件
function FileTypeCheck({ 
  childIds, 
  checkType 
}: { 
  childIds: number[], 
  checkType: "executable" | "nonExecutable" 
}) {
  const [result, setResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFiles = async () => {
      try {
        const fileTypes = await Promise.all(childIds.map(id => getFileType(id)));
        console.log(fileTypes)
        const hasMatchingFiles = fileTypes.some(type => 
          checkType === "executable" ? isExecutableType(type) : isNonExecutableType(type)
        );
        setResult(hasMatchingFiles);
      } catch (error) {
        console.error('Error checking file types:', error);
        setResult(false);
      } finally {
        setLoading(false);
      }
    };

    if (childIds.length > 0) {
      checkFiles();
    } else {
      setResult(false);
      setLoading(false);
    }
  }, [childIds, checkType]);

  if (loading) {
    return <div className="flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />检查中...</div>;
  }

  return <div>{result ? "是" : "否"}</div>;
}

const embeddedFileColumns: ColumnDef<DetectedFileVO>[] = [
  {
    id: "embedded_files_count",
    accessorFn: (row) => {
      const res = resultOf("embedded-file", row.data.results) as EmbeddedFileDetectionTaskResData;
      return res.childIds?.length || 0;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="嵌入文件数量" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("embedded_files_count") as number;
      return <div className="text-center">{count}</div>;
    },
  },
  // 可以在这里添加更多与嵌入文件相关的列
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
              <span className="text-xs text-red-500">({res.severity})</span>
            ) : res.severity === "medium" ? (
              <span className="text-xs text-yellow-500">({res.severity})</span>
            ) : (
              <span className="text-xs text-green-500">({res.severity})</span>
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
      if (res.description === '') res.description = "无";
      return (
        <div>
          {res.description}
        </div>
      );
    },
  },
  
];

export function listColumnsOfEmbDetectFile(
  cfg: DetectionTaskCfgData,
): ColumnDef<DetectedFileVO>[] {
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
      id: "isLocallyCreated",
      accessorFn: (row) => row.data.metadata.data.isLocallyCreated,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="是否本机创建" />
      ),
      cell: ({ row }) => {
        const isLocallyCreated = row.getValue("isLocallyCreated");
        return (
          <div className={isLocallyCreated ? "text-red-500" : ""}>
            {isLocallyCreated ? "否" : "是"}
          </div>
        );
      },
    },
    {
      id: "description",
      accessorFn: (row) => row.data.metadata.data.description,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="描述" />
      ),
      cell: ({ row }) => {
        const isLocallyCreated = row.getValue("isLocallyCreated");
        return (
          <div className={isLocallyCreated ? "text-red-500" : ""}>
            {row.getValue("description")}
          </div>
        );
      },
    },
    {
      id: "is_embedded",
      accessorFn: (row) => {
        const res = resultOf("embedded-file", row.data.results) as EmbeddedFileDetectionTaskResData;
        return res.childIds;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="是否夹带" />
      ),
      cell: ({ row }) => {
        const childIds = row.getValue("is_embedded") as number[];
        if (!Array.isArray(childIds)) return <div>否</div>;
        return <FileTypeCheck childIds={childIds} checkType="executable" />;
      },
    },
    {
      id: "is_nested",
      accessorFn: (row) => {
        const res = resultOf("embedded-file", row.data.results) as EmbeddedFileDetectionTaskResData;
        return res.childIds;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="是否嵌套" />
      ),
      cell: ({ row }) => {
        const childIds = row.getValue("is_nested") as number[];
        if (!Array.isArray(childIds)) return <div>否</div>;
        return <FileTypeCheck childIds={childIds} checkType="nonExecutable" />;
      },
    },
  ];

  let columns: ColumnDef<DetectedFileVO>[] = [...basicColumns];
  
  if (cfg.configs.some((c) => c.type === "embedded-file")) {
    columns = [...columns, ...embeddedFileColumns];
  }
  if (cfg.configs.some((c) => c.type === "malicious-doc")) {
    columns = [...columns, ...maliciousDocColumns];
  }
  
  return columns;
}

function resultOf(
  type: "malicious-doc" | "embedded-file",
  results: (MaliciousDocDetectionTaskResData | EmbeddedFileDetectionTaskResData)[],
) {
  for (const result of results) {
    if (result.type === type) {
      return result;
    }
  }
  throw new Error(`No result found for type: ${type}`);
}