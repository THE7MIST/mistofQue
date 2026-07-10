function resolvePublicPath(file) {
  if (/^https?:\/\//i.test(file)) return file;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedFile = file.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedFile}`;
}

export async function loadQuizFile(file) {
  const url = resolvePublicPath(file);
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Could not load quiz data from ${url}`);
  }
  return response.json();
}

export async function loadTopicIndex(file) {
  const url = resolvePublicPath(file);
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Could not load topic index from ${url}`);
  }
  return response.json();
}
