import { DetectedFileData } from "@/types/DetectedFileData.schema";

export type DetectedFileVO = {
  id: number;
  embPath: string;
  ancestors: number[];
  children: number[];
  data: DetectedFileData;
};
