"""Provider adapter and timestamped JSON cache for published rates."""
from datetime import datetime, timezone
from pathlib import Path
from decimal import Decimal
import json

import requests


class RateProviderError(RuntimeError):
    """Raised when an exchange-rate provider request fails."""


# Sample units of each currency per USD. These are illustrative, not current rates.
# Keep this map small and explicitly labelled as demo data.
DEMO_RATES = {
    "USD": Decimal("1"),
    "EUR": Decimal("0.92"),
    "GBP": Decimal("0.79"),
    "INR": Decimal("83"),
    "NPR": Decimal("133"),
    "JPY": Decimal("150"),
    "CAD": Decimal("1.36"),
    "AUD": Decimal("1.52"),
}


class RateProvider:
    """Small adapter for the Frankfurter v2 API."""

    def __init__(self, base_url="https://api.frankfurter.dev/v2", timeout=8):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()

    def _get_json(self, path, params=None):
        url = f"{self.base_url}/{path.lstrip('/')}"
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, ValueError) as exc:
            raise RateProviderError("Could not reach the exchange-rate provider.") from exc

    def get_currencies(self):
        data = self._get_json("currencies")
        if not isinstance(data, list):
            raise RateProviderError("Provider returned an unexpected currency catalogue.")
        currencies = []
        for item in data:
            # Frankfurter v2 currently uses iso_code; retain code as a fallback
            # for older provider responses and test fixtures.
            code = str(item.get("iso_code") or item.get("code") or "").upper()
            name = str(item.get("name", "")).strip()
            if len(code) == 3 and name:
                currencies.append({"code": code, "name": name})
        if not currencies:
            raise RateProviderError("Provider returned an empty currency catalogue.")
        return sorted(currencies, key=lambda item: item["code"])

    def get_latest_rates(self, base):
        rows = self._get_json("rates", params={"base": base})
        rates = {}
        dates = []
        for row in rows if isinstance(rows, list) else []:
            quote = str(row.get("quote", "")).upper()
            rate = row.get("rate")
            rate_date = row.get("date")
            if len(quote) == 3 and rate is not None:
                try:
                    value = Decimal(str(rate))
                except Exception:
                    continue
                if value > 0 and value.is_finite():
                    rates[quote] = str(value)
                    if rate_date:
                        dates.append(str(rate_date))
        if not rates:
            raise RateProviderError("Provider returned no usable rates for this base currency.")
        return {
            "base": base,
            "rates": rates,
            "rate_date": max(dates) if dates else None,
        }

    def get_history(self, base, quote, start, end):
        rows = self._get_json(
            "rates",
            params={"base": base, "quotes": quote, "from": start, "to": end},
        )
        points = []
        for row in rows if isinstance(rows, list) else []:
            if str(row.get("quote", "")).upper() != quote:
                continue
            if row.get("date") is not None and row.get("rate") is not None:
                points.append({
                    "date": str(row["date"]),
                    "rate": str(row["rate"]),
                })
        points.sort(key=lambda item: item["date"])
        return points


class RateStore:
    """JSON-backed cache of the latest successful rate snapshots."""

    def __init__(self, cache_file="data/rate_cache.json", max_age_hours=72):
        self.path = Path(cache_file)
        self.max_age_hours = float(max_age_hours)

    def _read(self):
        try:
            with self.path.open("r", encoding="utf-8") as file:
                payload = json.load(file)
            return payload if isinstance(payload, dict) else {}
        except (FileNotFoundError, OSError, json.JSONDecodeError):
            return {}

    def _write(self, payload):
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temp_path = self.path.with_suffix(self.path.suffix + ".tmp")
            with temp_path.open("w", encoding="utf-8") as file:
                json.dump(payload, file, indent=2)
            temp_path.replace(self.path)
        except OSError:
            # Caching must not make a successful provider response fail.
            pass

    def save(self, base, payload):
        all_data = self._read()
        all_data[base] = {
            **payload,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }
        self._write(all_data)

    def load(self, base):
        item = self._read().get(base)
        if not item:
            return None
        try:
            saved_at = datetime.fromisoformat(item["saved_at"])
            age_hours = (datetime.now(timezone.utc) - saved_at).total_seconds() / 3600
            if age_hours < 0:
                age_hours = 0
        except (KeyError, TypeError, ValueError):
            return None
        if age_hours > self.max_age_hours:
            return None
        if not isinstance(item.get("rates"), dict):
            return None
        return {
            **item,
            "cache_age_hours": round(age_hours, 2),
        }

    def load_latest(self, base):
        return self.load(base)
