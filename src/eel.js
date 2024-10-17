// noinspection JSUnresolvedReference

export const eel = window["eel"];

eel.expose(fetchEmbeddingDetectionRunByUuid)
eel.expose(fetchEmbeddingDetectionResultByRunUuid)
eel.expose(fetchEmbeddingDetectionRuns)
eel.expose(detectEmbeddedFiles)

function fetchEmbeddingDetectionRunByUuid(run_uuid) {}
function fetchEmbeddingDetectionResultByRunUuid(run_uuid) {}
function fetchEmbeddingDetectionRuns(page_no, page_size) {}
function detectEmbeddedFiles(targetDir) {}