# Google Apps Script Backend

1. Create a Google Sheet with two tabs: `Users` and `Results`.
2. In `Users`, add headers: `Email`, `PasswordTkn`, `Name`.
3. Open Extensions > Apps Script and paste `Code.gs`.
4. Set `SPREADSHEET_ID` to your sheet ID, or bind the script directly to the Sheet and leave the placeholder.
5. Run `setupSheets()` once from Apps Script to create headers and sample data.
6. Deploy as Web app:
   - Execute as: Me
   - Who has access: Anyone
7. Copy the Web app URL into `VITE_APPS_SCRIPT_URL`.

The frontend sends simple `text/plain` JSON requests to avoid CORS preflight issues with Apps Script.
