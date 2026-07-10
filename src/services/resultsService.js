const API_URL = "https://script.google.com/macros/s/AKfycbxBfWSX994-1Z20AAJpUWfoIJoLz7pjFku7ygNWQnkrMiiN8l1_v9DT5iLq7hQKgy_LaA/exec";
const RESULTS_KEY = "mcq_arena_results";
const LAST_RESULT_KEY = "mcq_arena_last_result";

function hasConfiguredApi() {
  return API_URL && !API_URL.includes("YOUR_DEPLOYMENT_ID");
}

function readResults() {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeResults(results) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// async function postToAppsScript(payload) {
//   if (!hasConfiguredApi()) return null;

//   const response = await fetch(API_URL, {
//     method: "POST",
//     redirect: "follow",
//     headers: {
//       "Content-Type": "text/plain;charset=utf-8"
//     },
//     body: JSON.stringify(payload)
//   });

//   if (!response.ok) {
//     throw new Error(`Apps Script request failed with ${response.status}`);
//   }

//   return response.json();
// }
async function postToAppsScript(payload) {
  if (!hasConfiguredApi()) return null;

  console.log("Sending payload:", payload);

  const response = await fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  console.log("HTTP Status:", response.status);

  const text = await response.text();
  console.log("Response:", text);

  return JSON.parse(text);
}

export function persistLastResult(result) {
  sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}

export function getLastResult() {
  try {
    return JSON.parse(sessionStorage.getItem(LAST_RESULT_KEY));
  } catch {
    return null;
  }
}

export function saveLocalResult(result, user) {
  const results = readResults();
  const compactResult = {
    id: result.id,
    user: user.email,
    subject: result.subject,
    subjectSlug: result.subjectSlug,
    stage: result.stage,
    score: result.score,
    correct: result.correct,
    wrong: result.wrong,
    unattempted: result.unattempted,
    totalQuestions: result.totalQuestions,
    elapsedSeconds: result.elapsedSeconds,
    completedAt: result.completedAt,
    weakAreas: result.weakAreas
  };

  writeResults([compactResult, ...results.filter((item) => item.id !== result.id)].slice(0, 100));
}

export async function saveResult(result, user) {
  saveLocalResult(result, user);
  persistLastResult(result);

  return postToAppsScript({
    action: "saveResult",
    result: {
      user: user.email,
      subject: result.subject,
      stage: result.stage,
      score: result.score,
      correct: result.correct,
      wrong: result.wrong,
      unattempted: result.unattempted,
      totalQuestions: result.totalQuestions,
      date: result.completedAt,
      weakAreas: result.weakAreas.map((area) => area.name).join(", ")
    }
  });
}

export function getLocalResults(email) {
  return readResults().filter((result) => result.user === email);
}

export async function fetchRemoteAnalytics(email) {
  const response = await postToAppsScript({
    action: "getAnalytics",
    email
  });
  return response?.results || [];
}
