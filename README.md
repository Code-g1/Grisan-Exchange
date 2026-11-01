# Nexa Exchange — Full Project

This folder contains the Python/Flask backend, frontend website, and school report outline.

## Important: run the frontend WITHOUT Live Server for this test

Because Live Server was repeatedly refreshing your page, this version lets you serve the frontend with Python's built-in web server instead. This does not require installing another VS Code extension.

### 1. Start the backend

Open a VS Code terminal and run:

```powershell
cd backend
python -m pip install -r requirements.txt
python app.py
```

Keep this terminal open. Check that `http://127.0.0.1:5000/api/health` displays JSON with `"status":"ok"`.

### 2. Start the frontend in a second terminal

Open a **second** VS Code terminal, then run:

```powershell
cd frontend
python -m http.server 5501
```

Keep this terminal open too. Open this address in your browser:

`http://127.0.0.1:5501`

Do not click Go Live for this test. This bypasses Live Server while keeping the frontend connected to the Flask API.

## What's included

- `backend/` — Flask API, currency conversion, published reference rates, cache, and tests
- `frontend/` — responsive Nexa Exchange page, searchable currency selectors, country flags, conversion, rate cards, and theme toggle
- `report/REPORT_OUTLINE.md` — school report outline

## Test checklist

1. Page stays still for 10–15 seconds without refreshing.
2. Currency dropdowns show flag images for national currencies (internet is needed for flag images).
3. Convert USD to NPR with amount `100`.
4. Swap currencies and convert again.
5. Toggle dark/light theme.

## Notes

- Exchange rates are published reference rates, not guaranteed cash-exchange, bank, or remittance quotes.
- Flag images are fetched from FlagCDN, so an internet connection is required to load them.
- The default API address is local: `http://127.0.0.1:5000/api`.


## Luxury rate-history chart and currency flags

The homepage includes a responsive historical-rate chart for the selected currency pair. It requests published time-series data from the Flask `/api/history` route and Frankfurter API; it does not generate fake market points. On desktop the chart opens automatically, while on smaller screens it starts collapsed so the converter remains the focus. Use the period controls to switch between 1 week, 1 month, 3 months, 6 months, and 1 year. Historical availability varies by currency pair and provider publication dates.

Currency flag handling includes an expanded currency-to-flag catalogue and name-based fallbacks for less common and legacy currency codes. Flag images are loaded from FlagCDN, with an emoji fallback if the image cannot load. Some non-country assets (such as gold, silver, and digital assets) use an asset symbol instead of a national flag.

### Independent market-history chart
The historical chart has its own **Base Currency** and **Quote Currency** selectors. Changing these controls changes only the chart pair; it does not change the currencies selected in the converter. Select a period (1W, 1M, 3M, 6M, or 1Y) to load published history for that pair. Historical observations come from the Frankfurter-backed `/api/history` endpoint and are generally available on business days.
# Nexa Exchange — Frontend

## Files
- `index.html` — page structure
- `css/style.css` — responsive Obsidian Black + Champagne Gold styling
- `js/app.js` — API connection, currency selectors, conversion, market cards, theme toggle

## Run it locally
1. Keep the Flask backend running from the `backend` folder:
   `python app.py`
2. In VS Code, open the `frontend` folder.
3. Install/use the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.
4. The page calls the API at `http://127.0.0.1:5000/api`.

If the page says API unavailable, verify `http://127.0.0.1:5000/api/health` opens successfully, and check that the Flask server is still running.

## Important
Currency flags and country labels are presentation hints. Some provider entries are digital assets, metals, or regional units rather than sovereign national currencies. Rates shown are published reference rates and may differ from transaction offers.

