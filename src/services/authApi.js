const API_URL =
  "https://script.google.com/macros/s/AKfycbxBfWSX994-1Z20AAJpUWfoIJoLz7pjFku7ygNWQnkrMiiN8l1_v9DT5iLq7hQKgy_LaA/exec";

function hasConfiguredApi() {
  return API_URL && !API_URL.includes("YOUR_DEPLOYMENT_ID");
}

async function callAppsScript(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Apps Script request failed with ${response.status}`);
  }

  return response.json();
}

export async function loginWithToken({ email, passwordToken }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = passwordToken.trim();

  if (!hasConfiguredApi()) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const isDemoLogin = normalizedEmail === "demo@mcqarena.dev" && normalizedToken === "demo 123";
    return {
      ok: isDemoLogin,
      message: isDemoLogin ? "Login successful." : "Use the configured Google Apps Script endpoint.",
      user: isDemoLogin ? { email: normalizedEmail, name: "Demo Candidate" } : null
    };
  }

  return callAppsScript({
    action: "login",
    email: normalizedEmail,
    passwordToken: normalizedToken
  });
}
