const SPREADSHEET_ID = "1GPL5mJH66u_Zy67Ud28_F3vY2GBn3AZx5nMYy9_XkPU";
const USERS_SHEET = "Users";
const RESULTS_SHEET = "Results";

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const payload = parsePayload(e);

    switch (payload.action) {
      case "login":
        return jsonResponse(login(payload));
      case "saveResult":
        return jsonResponse(saveResult(payload.result));
      case "getAnalytics":
        return jsonResponse(getAnalytics(payload.email));
      case "health":
        return jsonResponse({ ok: true, message: "MCQ Arena API is online." });
      default:
        return jsonResponse({ ok: false, message: "Unknown action." });
    }
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message || "Server error." });
  }
}

function parsePayload(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return e && e.parameter ? e.parameter : {};
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "PASTE_GOOGLE_SHEET_ID_HERE") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name, headers) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function getRowsAsObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map((header) => String(header).trim());
  return values.slice(1).map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = row[index];
      return record;
    }, {})
  );
}

function login(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const passwordToken = String(payload.passwordToken || "").trim();

  if (!email || !passwordToken) {
    return { ok: false, message: "Email and password token are required." };
  }

  const sheet = getOrCreateSheet(USERS_SHEET, ["Email", "PasswordTkn", "Name"]);
  const users = getRowsAsObjects(sheet);
  const matchedUser = users.find((user) => {
    const sheetEmail = String(user.Email || "").trim().toLowerCase();
    const sheetToken = String(user.PasswordTkn || "").trim();
    return sheetEmail === email && sheetToken === passwordToken;
  });

  if (!matchedUser) {
    return { ok: false, message: "Invalid email or password token." };
  }

  return {
    ok: true,
    user: {
      email,
      name: matchedUser.Name || email.split("@")[0]
    },
    sessionToken: Utilities.getUuid()
  };
}

function saveResult(result) {
  if (!result || !result.user) {
    return { ok: false, message: "Result payload is required." };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getOrCreateSheet(RESULTS_SHEET, [
      "user",
      "subject",
      "score",
      "correct",
      "wrong",
      "date",
      "stage",
      "unattempted",
      "totalQuestions",
      "weakAreas"
    ]);

    sheet.appendRow([
      result.user,
      result.subject,
      Number(result.score || 0),
      Number(result.correct || 0),
      Number(result.wrong || 0),
      result.date || new Date(),
      result.stage || "Practice",
      Number(result.unattempted || 0),
      Number(result.totalQuestions || 0),
      result.weakAreas || ""
    ]);

    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function getAnalytics(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const sheet = getOrCreateSheet(RESULTS_SHEET, [
    "user",
    "subject",
    "score",
    "correct",
    "wrong",
    "date",
    "stage",
    "unattempted",
    "totalQuestions",
    "weakAreas"
  ]);

  const rows = getRowsAsObjects(sheet)
    .filter((row) => String(row.user || "").trim().toLowerCase() === normalizedEmail)
    .map((row, index) => ({
      id: "sheet-" + index + "-" + new Date(row.date).getTime(),
      user: row.user,
      subject: row.subject,
      score: Number(row.score || 0),
      correct: Number(row.correct || 0),
      wrong: Number(row.wrong || 0),
      date: row.date,
      stage: row.stage || "Practice",
      unattempted: Number(row.unattempted || 0),
      totalQuestions: Number(row.totalQuestions || 0),
      weakAreas: row.weakAreas || ""
    }))
    .reverse();

  return { ok: true, results: rows };
}

function setupSheets() {
  const users = getOrCreateSheet(USERS_SHEET, ["Email", "PasswordTkn", "Name"]);
  const results = getOrCreateSheet(RESULTS_SHEET, [
    "user",
    "subject",
    "score",
    "correct",
    "wrong",
    "date",
    "stage",
    "unattempted",
    "totalQuestions",
    "weakAreas"
  ]);

  if (users.getLastRow() === 1) {
    users.appendRow(["user@gmail.com", "abc123", "Candidate"]);
  }

  results.autoResizeColumns(1, results.getLastColumn());
  users.autoResizeColumns(1, users.getLastColumn());
}

