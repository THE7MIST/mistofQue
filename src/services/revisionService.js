const DATA_VERSION = __DATA_VERSION__;
const REVISION_PROGRESS_KEY = "mcq_arena_revision_progress";

function resolvePublicPath(file) {
  if (/^https?:\/\//i.test(file)) return file;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedFile = file.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedFile}`;
}

function versionedUrl(file) {
  const url = resolvePublicPath(file);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(DATA_VERSION)}`;
}

async function loadJson(file) {
  const response = await fetch(versionedUrl(file), { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load revision data from ${file}`);
  return response.json();
}

function readRevisionProgress() {
  try {
    return JSON.parse(localStorage.getItem(REVISION_PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function writeRevisionProgress(progress) {
  localStorage.setItem(REVISION_PROGRESS_KEY, JSON.stringify(progress));
}

export function resolveAudioPath(file) {
  return resolvePublicPath(file);
}

export function loadRevisionIndex(subjectSlug) {
  return loadJson(`/data/${subjectSlug}/revision/index.json`);
}

export function loadRevisionPhase(file) {
  return loadJson(file);
}

export function getRevisionProgress(email, subjectSlug) {
  const data = readRevisionProgress();
  return data[email]?.[subjectSlug] || {};
}

export function saveRevisionPhaseProgress(email, subjectSlug, phaseId, patch) {
  const data = readRevisionProgress();
  const subjectData = data[email]?.[subjectSlug] || {};
  const current = subjectData[phaseId] || {};
  const next = {
    listenedSeconds: Math.max(Number(current.listenedSeconds || 0), Number(patch.listenedSeconds || 0)),
    durationSeconds: Math.max(Number(current.durationSeconds || 0), Number(patch.durationSeconds || 0)),
    completed: Boolean(current.completed || patch.completed),
    lastPosition: Number.isFinite(Number(patch.lastPosition)) ? Number(patch.lastPosition) : Number(current.lastPosition || 0)
  };

  data[email] = {
    ...(data[email] || {}),
    [subjectSlug]: {
      ...subjectData,
      [phaseId]: next
    }
  };
  writeRevisionProgress(data);
  return next;
}
