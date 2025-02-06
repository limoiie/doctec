import { TaskStatus } from "@/types";

/**
 * Split a given filePath into a parent dir and a name.
 *
 * The filePath can be in either window-style (joint by '\\') or unix-style (joint by '/').
 */
export function splitPathName(filePath: string) {
  const pathSep = filePath.includes("/") ? "/" : "\\";
  const components = filePath.split(pathSep);

  const name = components.pop();
  const dir = components.join(pathSep);

  return { dir, name };
}

/**
 * Split a given filePath into components and subpaths.
 *
 * The filePath can be in either window-style (joint by '\\') or unix-style (joint by '/').
 * The components are the parts of the filePath split by the path separator.
 * The subpaths are the components concatenated by the path separator.
 */
export function splitPathComponents(filePath: string) {
  const pathSep = filePath.includes("/") ? "/" : "\\";
  const components = filePath.split(pathSep);
  const subpaths = [components[0]];
  for (let i = 1; i < components.length; i++) {
    subpaths.push(subpaths[i - 1] + pathSep + components[i]);
  }
  return { components: components, subpaths: subpaths };
}

/**
 * Convert a given bytes to a human-readable size string.
 */
export function bytesToSize(bytes: number) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Convert a given status to a human-readable display text.
 *
 * @param status
 */
export function statusToDisplayText(status: TaskStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return null;
  }
}

/**
 * Format a given date string to a human-readable date-time string.
 *
 * @param date
 */
export function formatDateTime(date: string | null) {
  if (!date) {
    return "Unknown Date";
  }
  return new Date(date).toLocaleString(
    "zh-CN",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }
  );
}
