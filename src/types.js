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

  /**
   * Convert a JSON-like object to an EmbeddedFile
   *
   * @param object {Object} - The JSON-like object, normally gotten from the python world.
   * @returns {EmbeddedFile}
   */
  static fromObject(object: Object): EmbeddedFile {
    return new EmbeddedFile(
        object.filepath,
        object.filesize,
        EmbeddedFile.fromObjects(object.embeddedFiles)
    );
  }

  /**
   * Convert an array of JSON-like objects to an array of EmbeddedFiles
   *
   * @param objects {Object[]} - The JSON-like objects, normally gotten from the python world.
   * @returns {EmbeddedFile[]}
   */
  static fromObjects(objects: Object[]): EmbeddedFile[] {
    return objects.map(EmbeddedFile.fromObject)
  }
}

export class EmbeddingDetectionProgress {
  status: 'completed' | 'in-progress' | 'failed'
  error: string | null
  totalFiles: number
  processedFiles: number

  constructor(
      status: 'completed' | 'in-progress' | 'failed',
      error: string | null,
      totalFiles: number,
      processedFiles: number
  ) {
    this.status = status
    this.error = error
    this.totalFiles = totalFiles
    this.processedFiles = processedFiles
  }

  static fromObject(object: Object): EmbeddingDetectionProgress {
    return new EmbeddingDetectionProgress(
        object.status,
        object.error,
        object.totalFiles,
        object.processedFiles
    );
  }
}

export class EmbeddingDetectionResult {
  id: string
  targetDirs: string[]
  date: Date
  detectedFiles: EmbeddedFile[]
  progress: EmbeddingDetectionProgress

  constructor(
      id: string,
      targetDirs: string[],
      date: Date,
      detectedFiles: EmbeddedFile[] = [],
      progress: EmbeddingDetectionProgress
  ) {
    this.id = id
    this.targetDirs = targetDirs
    this.date = date
    this.detectedFiles = detectedFiles
    this.progress = progress
  }

  /**
   * Convert a JSON-like object to an EmbeddingDetection
   *
   * @param object
   * @returns {EmbeddingDetectionResult}
   */
  static fromObject(object: Object): EmbeddingDetectionResult {
    return new EmbeddingDetectionResult(
        object.id,
        object.targetDirs,
        new Date(object.date),
        EmbeddedFile.fromObjects(object.detectedFiles),
        EmbeddingDetectionProgress.fromObject(object.progress)
    );
  }

  /**
   * Convert an array of JSON-like objects to an array of EmbeddingDetectionResults
   *
   * @param objects
   * @returns {EmbeddingDetectionResult[]}
   */
  static fromObjects(objects: Object[]): EmbeddingDetectionResult[] {
    return objects.map(EmbeddingDetectionResult.fromObject)
  }

  /**
   * Locate an embedded file by its nested path parts.
   *
   * @param nestedPathParts {string[]} - The nested path parts.
   * @returns {EmbeddedFile|null}
   */
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
