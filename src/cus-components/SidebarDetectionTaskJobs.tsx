import * as React from "react";
import { useEffect } from "react";
import { Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CalendarPlusIcon, IdCardIcon, PercentIcon, TrashIcon } from "lucide-react";
import { DetectionTaskJobData } from "@/types/DetectionTaskJobData.schema";
import { StatusIcon } from "@/cus-components/StatusIcon";
import { formatDateTime } from "@/utils";
import { useEel } from "@/hooks/use-eel";


export function SidebarDetectionTaskJobs() {
  const [detectRuns, setDetectRuns] = React.useState<DetectionTaskJobData[]>(
    [],
  );
  const { eel } = useEel();
  const navigate = useNavigate();


  useEffect(() => {
    eel
      .fetchDetectionTaskJobs(0, 1_000_000)()
      .then((jobs: DetectionTaskJobData[]) => {
        console.log("fetchDetectionTaskJobs", jobs);
        setDetectRuns(jobs);
      });
  }, []);

  const handleDelete = async (uuid: string) => {
    try {
      eel.deleteDetectedFileByUuid(uuid)();
      setDetectRuns(prev => prev.filter(job => job.uuid !== uuid));
      alert("删除成功：" + uuid);
      navigate("/dashboard/detection/task-job");
    } catch (error) {
      console.error("删除任务失败:", error);
      alert("删除任务失败，请稍后重试");
    } 
  };

  return (
    <>
      {detectRuns.map((job) => (
        <Link
          to={"/dashboard/detection/task-job/" + job.uuid}
          key={job.uuid}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >

          <div className="flex items-center">
            <IdCardIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="ml-auto text-xs">
              {job.uuid}
            </span>
          </div>
          <div className="flex items-center">
            <CalendarPlusIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="ml-auto text-xs">
              {formatDateTime(job.launchedDate)}
            </span>
          </div>

          <div className="flex items-center">
            <PercentIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              {job.nProcessed} / {job.nTotal}
            </span>
          </div>
          <div className="flex items-center justify-between w-full gap-1">
            <StatusIcon status={job.status} size={16} />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(job.uuid);
              }}
              className="ml-auto p-1 rounded hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-colors"
              title="删除任务"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </Link>
      ))}
      
    </>
  );
}
