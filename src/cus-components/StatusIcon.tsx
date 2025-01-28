import { CircleCheckBigIcon, CircleDashedIcon, CircleSlashIcon, CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { TaskStatus } from "@/types";

import { statusToDisplayText } from "@/utils";

export function StatusIcon({
                             status,
                             className = "",
                             showText = false,
                             size = undefined
                           }: {
  status: string;
  className?: string;
  showText?: boolean;
  size?: number | string | undefined;
}) {
  return (
    <div className="flex items-center">
      <span className={className}>
        {(() => {
          switch (status as TaskStatus) {
            case "pending":
              return (
                <CircleDashedIcon className={"text-gray-400 " + className} size={size} />
              );
            case "in-progress":
              return (
                <LoaderCircleIcon
                  className={"text-blue-500 animate-spin " + className} size={size}
                />
              );
            case "completed":
              return (
                <CircleCheckBigIcon className={"text-green-500 " + className} size={size} />
              );
            case "failed":
              return <CircleXIcon className={"text-red-500 " + className} size={size} />;
            case "cancelled":
              return (
                <CircleSlashIcon className={"text-gray-400 " + className} size={size} />
              );
            default:
              return null;
          }
        })()}
      </span>
      {showText && (
        <span className="ml-2">
          {statusToDisplayText(status as TaskStatus)}
        </span>
      )}
    </div>
  );
}
