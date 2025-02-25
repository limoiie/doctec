import { Button } from "@/components/ui/button";
import { useEel } from "@/hooks/use-eel";
import type { 
  DetectionTaskCfgData,
  EmbeddedFileDetectionTaskCfgData,
  MaliciousDocDetectionTaskCfgData 
} from "@/types/DetectionTaskCfgData.schema";
import { CirclePlusIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewDetectionButton() {
  const [targetDirs, setTargetDirs] = useState("E:\\Project\\maldoctect\\teset_data_simple");
  const [saveDir, setSaveDir] = useState("C:\\\\Projects\\samples_to_save");
  const [open, setOpen] = useState(false);
  
  // Configuration toggles
  const [enableEmbeddedFile, setEnableEmbeddedFile] = useState(false);
  const [enableMaliciousDoc, setEnableMaliciousDoc] = useState(false);
  
  // Configuration values
  const [embeddedFileConfig, setEmbeddedFileConfig] = useState<EmbeddedFileDetectionTaskCfgData>({
    maxDepth: 5,
    type: "embedded-file"
  });
  
  const [maliciousDocConfig, setMaliciousDocConfig] = useState<MaliciousDocDetectionTaskCfgData>({
    severityThreshold: 0.7,
    type: "malicious-doc"
  });

  const { eel } = useEel();
  const navigate = useNavigate();

  function detect() {
    setOpen(false);
    const configs = [];
    if (enableEmbeddedFile) {
      configs.push(embeddedFileConfig);
    }
    if (enableMaliciousDoc) {
      configs.push(maliciousDocConfig);
    }

    const cfg: DetectionTaskCfgData = {
      uuid: "",
      targetDirs: targetDirs.split(";"),
      saveDir: saveDir,
      configs: configs,
    };
    
    console.log(cfg)
    eel
      .launchDetectionTask(cfg)()
      .then((jobUuid: string) => {
        console.log(jobUuid)
        navigate("/dashboard/detection/task-job/"+ jobUuid);
        
        setTimeout(() => navigate("/dashboard/detection/task-job/" + jobUuid), 5000);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white">
          <CirclePlusIcon className="w-4 h-4 mr-2" />
          开始一个新检测
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>新检测</DialogTitle>
          <DialogDescription>
          创建一个新的检测任务来分析您的文件。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">检测文件目录</Label>
              <Input
                value={targetDirs}
                onChange={(e) => setTargetDirs(e.target.value)}
                className="col-span-3"
                placeholder="输入以分号分隔的目录"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">保存目录</Label>
              <Input
                value={saveDir}
                onChange={(e) => setSaveDir(e.target.value)}
                className="col-span-3"
                placeholder="输入保存目录路径"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>嵌入文件检测</CardTitle>
                  <Switch
                    checked={enableEmbeddedFile}
                    onCheckedChange={setEnableEmbeddedFile}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {enableEmbeddedFile && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">最大深度</Label>
                    <Input
                      type="number"
                      value={embeddedFileConfig.maxDepth}
                      onChange={(e) => setEmbeddedFileConfig({
                        ...embeddedFileConfig,
                        maxDepth: parseInt(e.target.value)
                      })}
                      className="col-span-3"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>恶意文档检测</CardTitle>
                  <Switch
                    checked={enableMaliciousDoc}
                    onCheckedChange={setEnableMaliciousDoc}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {enableMaliciousDoc && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">阈值</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={maliciousDocConfig.severityThreshold}
                      onChange={(e) => setMaliciousDocConfig({
                        ...maliciousDocConfig,
                        severityThreshold: parseFloat(e.target.value)
                      })}
                      className="col-span-3"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={detect} 
              disabled={!enableEmbeddedFile && !enableMaliciousDoc}
            >
              开始检测
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
