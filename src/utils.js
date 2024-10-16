/**
 * Split a given filePath into a parent dir and a name.
 * 
 * The filePath can be in either window-style (joint by '\\') or unix-style (joint by '/').
 */
export function splitFilePath(filePath: string) {
    const pathSep = filePath.includes('/') ? '/' : '\\';
    const components = filePath.split(pathSep);

    const name = components.pop();
    const dir = components.join(pathSep);

    return { dir, name };
}
