import { FolderOutlined, TableOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import type { EmbDetectionResultDataWithoutRun } from "@/types/EmbDetectionResultDataWithoutRun.schema.d";
import { EmbeddedFileList } from "./EmbeddedFileList";
import { useState } from "react";
import { EmbeddedFileTree } from "./EmbeddedFileTree";

export function EmbeddingDetectionResDetails({
  res,
}: {
  res: EmbDetectionResultDataWithoutRun;
}) {
  const [mode, setMode] = useState("List");
  return (
    <div className="h-[calc(100%-42px)] flex flex-col gap-2 items-baseline">
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: "List", icon: <TableOutlined /> },
          { value: "Tree", icon: <FolderOutlined /> },
        ]}
      />
      {mode === "List" ? (
        <EmbeddedFileList files={res.detectedFiles} />
      ) : (
        <EmbeddedFileTree files={res.detectedFiles} />
      )}
    </div>
  );
}
