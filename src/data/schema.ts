import { z } from "zod";

export const embDetectFileSchema = z.object({
  id: z.number(),
  filepath: z.string(),
  embPath: z.string(),
  parentId: z.number().nullable(),
  ancestors: z.array(z.number()),
  children: z.array(z.number()),
  size: z.number(),
  md5: z.string(),
  kind: z.string(),
  created: z.string(),
  modified: z.string(),
  creator: z.string(),
  modifier: z.string(),
});

export type EmbDetectFileVO = z.infer<typeof embDetectFileSchema>;
