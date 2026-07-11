const DATA_VERSION = __DATA_VERSION__;

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

export async function loadQuizFile(file) {
  const url = versionedUrl(file);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load quiz data from ${url}`);
  }
  return response.json();
}

export async function loadTopicIndex(file) {
  const url = versionedUrl(file);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load topic index from ${url}`);
  }
  return response.json();
}
