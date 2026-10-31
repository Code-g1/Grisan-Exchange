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
