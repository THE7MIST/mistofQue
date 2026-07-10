export async function loadQuizFile(file) {
  const response = await fetch(file, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Could not load quiz data from ${file}`);
  }
  return response.json();
}

export async function loadTopicIndex(file) {
  const response = await fetch(file, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Could not load topic index from ${file}`);
  }
  return response.json();
}
