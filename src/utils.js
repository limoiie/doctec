/**
 * Split a given filePath into a parent dir and a name.
 *
 * The filePath can be in either window-style (joint by '\\') or unix-style (joint by '/').
 */
export function splitPathName(filePath: string) {
  const pathSep = filePath.includes('/') ? '/' : '\\';
  const components = filePath.split(pathSep);

  const name = components.pop();
  const dir = components.join(pathSep);

  return {dir, name};
}

/**
 * Split a given filePath into components and subpaths.
 *
 * The filePath can be in either window-style (joint by '\\') or unix-style (joint by '/').
 * The components are the parts of the filePath split by the path separator.
 * The subpaths are the components concatenated by the path separator.
 */
export function splitPathComponents(filePath: string) {
  const pathSep = filePath.includes('/') ? '/' : '\\';
  const components = filePath.split(pathSep);
  const subpaths = [components[0]];
  for (let i = 1; i < components.length; i++) {
    subpaths.push(subpaths[i - 1] + pathSep + components[i]);
  }
  return {components: components, subpaths: subpaths};
}

/**
 * Convert a given bytes to a human-readable size string.
 */
export function bytesToSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}