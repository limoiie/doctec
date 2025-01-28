import { z } from "zod";

export const embDetectFileSchema = z.object({
  id: z.number(),
  filepath: z.string(),
  parent: z.string(),
  size: z.number(),
  md5: z.string(),
  kind: z.string(),
  created: z.string(),
  modified: z.string(),
  creator: z.string(),
  modifier: z.string(),
});

export type EmbDetectFile = z.infer<typeof embDetectFileSchema>;
