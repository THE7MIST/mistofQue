export const RESTRICTED_ACCOUNTS = {
  "demo@mcqarena.dev": {
    passwordToken: "demo123",
    name: "Demo Candidate",
    role: "demo",
    title: "Demo Account",
    quizBlockedMessage: "This quiz is available only for registered users."
  },
  "user@gmail.com": {
    passwordToken: "abc123",
    name: "Candidate",
    role: "restricted",
    title: "Attempts Used",
    quizBlockedMessage: "All available attempts are used. Login with actual credentials."
  }
};

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function getRestrictedAccount(email) {
  return RESTRICTED_ACCOUNTS[normalizeEmail(email)] || null;
}

export function isRestrictedAccount(emailOrUser) {
  const email = typeof emailOrUser === "string" ? emailOrUser : emailOrUser?.email;
  return Boolean(getRestrictedAccount(email));
}
