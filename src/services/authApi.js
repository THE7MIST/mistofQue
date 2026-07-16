import { getRestrictedAccount } from "../utils/restrictedAccounts.js";

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
  const restrictedAccount = getRestrictedAccount(normalizedEmail);

  if (restrictedAccount && normalizedToken === restrictedAccount.passwordToken) {
    return {
      ok: true,
      message: "Login successful.",
      user: { email: normalizedEmail, name: restrictedAccount.name, role: restrictedAccount.role }
    };
  }

  if (!hasConfiguredApi()) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return {
      ok: false,
      message: "Use the configured Google Apps Script endpoint.",
      user: null
    };
  }

  return callAppsScript({
    action: "login",
    email: normalizedEmail,
    passwordToken: normalizedToken
  });
}
