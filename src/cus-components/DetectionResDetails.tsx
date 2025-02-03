import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DetectionTaskResData } from "@/types/DetectionTaskResData.schema";
import { EmbeddedFileList } from "./EmbeddedFileList";
import { EmbeddedFileTree } from "./EmbeddedFileTree";
import { ListIcon, ListTreeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";
import { useEel } from "@/hooks/use-eel";
import { toast } from "sonner";

export function DetectionResDetails({ res }: { res: DetectionTaskResData }) {
  const [job, setJob] = useState<DetectionTaskJobData>();
  const { eel } = useEel();

  useEffect(() => {
    eel
      .fetchDetectionTaskJobByUuid(res.jobUuid)()
      .then((job: DetectionTaskJobData) => {
        setJob(job);
      })
      .catch((reason: any) => {
        toast.error("Failed to fetch job by uuid:", reason);
      });
  }, [res.jobUuid]);

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
          {job && <EmbeddedFileList job={job} files={res.detectedFiles} />}
        </TabsContent>
        <TabsContent value="Tree">
          {job && <EmbeddedFileTree job={job} files={res.detectedFiles} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
