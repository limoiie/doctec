export type LoadState = {
  state: 'loading' | 'loaded' | 'error',
  error: string | null,
}

export class EmbeddedFile {
  filepath: string
  filesize: number
  filename: string
  embeddedFiles: EmbeddedFile[]

  constructor(filepath: string, filesize: number, embeddedFiles: EmbeddedFile[] = []) {
    this.filepath = filepath
    this.filesize = filesize
    this.filename = filepath.split('/').pop()
    this.embeddedFiles = embeddedFiles
  }

  static fromObject(object: Object): EmbeddedFile {
    return new EmbeddedFile(
        object.filepath,
        object.filesize,
        EmbeddedFile.fromObjects(object.embeddedFiles)
    );
  }

  static fromObjects(objects: Object[]): EmbeddedFile[] {
    return objects.map(EmbeddedFile.fromObject)
  }
}

export class EmbeddingDetectionResult {
  id: string
  targetDirs: string[]
  date: Date
  detectedFiles: EmbeddedFile[]

  constructor(id: string, targetDirs: string[], date: Date, detectedFiles: EmbeddedFile[] = []) {
    this.id = id
    this.targetDirs = targetDirs
    this.date = date
    this.detectedFiles = detectedFiles
  }

  static fromObject(object: Object): EmbeddingDetectionResult {
    return new EmbeddingDetectionResult(
        object.id,
        object.targetDirs,
        new Date(object.date),
        EmbeddedFile.fromObjects(object.detectedFiles)
    );
  }

  static fromObjects(objects: Object[]): EmbeddingDetectionResult[] {
    return objects.map(EmbeddingDetectionResult.fromObject)
  }

  locate(nestedPathParts: string[]): EmbeddedFile | null {
    let curr = this.detectedFiles;
    let embeddedFile: EmbeddedFile | null = null;
    for (const nestedPathPart of nestedPathParts) {
      embeddedFile = curr.find((file) => {
        return file.filename === nestedPathPart
      });
      if (!embeddedFile) {
        return null;
      }
      curr = embeddedFile.embeddedFiles;
    }
    return embeddedFile;
  }
}
