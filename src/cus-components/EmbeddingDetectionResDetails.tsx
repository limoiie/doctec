import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EmbDetectionResultDataWithoutRun } from "@/types/EmbDetectionResultDataWithoutRun.schema.d";
import { EmbeddedFileList } from "./EmbeddedFileList";
import { EmbeddedFileTree } from "./EmbeddedFileTree";
import { ListIcon, ListTreeIcon } from "lucide-react";

export function EmbeddingDetectionResDetails({
  res,
}: {
  res: EmbDetectionResultDataWithoutRun;
}) {
  return (
    <div className="h-[calc(100%-42px)] flex flex-col gap-2 items-baseline">
      <Tabs defaultValue="List" className="w-full">
        <TabsList className="grid w-24 grid-cols-2">
          <TabsTrigger value="List">
            <ListIcon size={16} />
          </TabsTrigger>
          <TabsTrigger value="Tree">
            <ListTreeIcon size={16} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="List">
          <EmbeddedFileList files={res.detectedFiles} />
        </TabsContent>
        <TabsContent value="Tree">
          <EmbeddedFileTree files={res.detectedFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
