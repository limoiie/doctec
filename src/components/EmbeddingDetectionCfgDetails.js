import type {EmbDetectionConfigData} from "../types/EmbDetectionConfigData.schema.d";
import {Descriptions} from "antd";

export function EmbeddingDetectionCfgDetails({cfg}: { cfg: EmbDetectionConfigData }) {
  const items = [
    {
      key: 'uuid',
      label: "UUID",
      children: cfg.uuid,
    },
    {
      key: 'maxDepth',
      label: "Max Depth",
      children: cfg.maxDepth,
    },
    {
      key: 'targetDirs',
      label: "Target Directories",
      children: cfg.targetDirs.join(", "),
    },
    {
      key: 'saveDirs',
      label: "Save Directories",
      children: cfg.saveDirs,
    },
  ];
  return (
      <Descriptions size="small" column={4} bordered items={items}/>
  )
}