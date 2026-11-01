"""Flask API for Nexa Exchange.

Published reference rates are not guaranteed cash-exchange or remittance quotes.
"""
from datetime import date
from decimal import Decimal, InvalidOperation
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from services.conversion import ConversionError, convert_amount, validate_currency_code
from services.rates import RateProvider, RateProviderError, RateStore, DEMO_RATES

load_dotenv()

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:5501,http://localhost:5501,http://127.0.0.1:5000",
    ).split(",")
    if origin.strip()
]
CORS(app, resources={r"/api/*": {"origins": origins}})

provider = RateProvider(
    base_url=os.getenv("FRANKFURTER_BASE_URL", "https://api.frankfurter.dev/v2"),
    timeout=float(os.getenv("REQUEST_TIMEOUT_SECONDS", "8")),
)
store = RateStore(
    cache_file=os.getenv("CACHE_FILE", "data/rate_cache.json"),
    max_age_hours=float(os.getenv("CACHE_MAX_AGE_HOURS", "72")),
)


def error_response(message: str, status: int = 400):
    return jsonify({"error": message}), status


def get_query_currency(name: str) -> str:
    value = request.args.get(name, "").strip().upper()
    try:
        return validate_currency_code(value)
    except ConversionError as exc:
        raise ValueError(str(exc)) from exc


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "Nexa Exchange API",
        "rates": "published reference rates; availability depends on provider",
    })


@app.get("/api/currencies")
def currencies():
    try:
        result = provider.get_currencies()
        return jsonify({
            "currencies": result,
            "source": "Frankfurter",
            "is_stale": False,
        })
    except RateProviderError as exc:
        # A catalogue failure is explicit: do not fabricate a global currency list.
        return error_response(f"Currency list is temporarily unavailable: {exc}", 503)


@app.get("/api/rates")
def rates():
    try:
        base = get_query_currency("base")
        payload = provider.get_latest_rates(base)
        store.save(base, payload)
        return jsonify({
            "base": base,
            "rates": payload["rates"],
            "rate_date": payload["rate_date"],
            "source": "Frankfurter",
            "is_stale": False,
        })
    except ValueError as exc:
        return error_response(str(exc))
    except RateProviderError:
        try:
            cached = store.load_latest(base)
        except (UnboundLocalError, ValueError):
            cached = None
        if cached:
            return jsonify({
                "base": base,
                "rates": cached["rates"],
                "rate_date": cached["rate_date"],
                "source": "cached published rates",
                "is_stale": True,
                "notice": "The rate provider is unavailable. Showing a cached snapshot.",
                "cache_age_hours": cached["cache_age_hours"],
            })
        return error_response(
            "Published rates are unavailable and no cached snapshot exists. Try again later.",
            503,
        )


@app.get("/api/convert")
def convert():
    try:
        base = get_query_currency("from")
        quote = get_query_currency("to")
        raw_amount = request.args.get("amount", "").strip()
        if not raw_amount:
            raise ValueError("Provide an amount.")
        try:
            amount = Decimal(raw_amount)
        except InvalidOperation as exc:
            raise ValueError("Amount must be a valid number.") from exc

        if not amount.is_finite():
            raise ValueError("Amount must be a finite number.")
        if amount < 0:
            raise ValueError("Amount cannot be negative.")
        if amount > Decimal("999999999999999"):
            raise ValueError("Amount is too large.")

        mode = request.args.get("mode", "live").strip().lower()
        if mode not in {"live", "demo"}:
            raise ValueError("Mode must be 'live' or 'demo'.")

        if base == quote:
            return jsonify({
                "amount": str(amount),
                "base": base,
                "quote": quote,
                "rate": "1",
                "converted_amount": str(amount),
                "source": "identity",
                "rate_date": date.today().isoformat(),
                "is_stale": False,
                "notice": "Both currencies are the same; the rate is 1.",
            })

        if mode == "demo":
            rate = get_demo_rate(base, quote)
            result = convert_amount(amount, rate)
            return jsonify({
                "amount": str(amount),
                "base": base,
                "quote": quote,
                "rate": str(rate),
                "converted_amount": str(result),
                "source": "demo",
                "rate_date": None,
                "is_stale": False,
                "notice": "Demo rate only. Not a live exchange rate.",
            })

        try:
            payload = provider.get_latest_rates(base)
            store.save(base, payload)
            rate = payload["rates"].get(quote)
            if rate is None:
                raise RateProviderError(
                    f"The provider does not currently return a {base}/{quote} rate."
                )
            source = "Frankfurter"
            stale = False
            rate_date = payload["rate_date"]
            notice = "Published reference rate; your provider may offer a different transaction rate."
        except RateProviderError:
            cached = store.load(base)
            if not cached or quote not in cached["rates"]:
                return error_response(
                    "Published rates are unavailable for this pair and no suitable cached rate exists. "
                    "You can explicitly select demo mode for testing.",
                    503,
                )
            rate = cached["rates"][quote]
            source = "cached published rates"
            stale = True
            rate_date = cached["rate_date"]
            notice = "Showing cached published data because the provider is unavailable."

        result = convert_amount(amount, Decimal(str(rate)))
        return jsonify({
            "amount": str(amount),
            "base": base,
            "quote": quote,
            "rate": str(rate),
            "converted_amount": str(result),
            "source": source,
            "rate_date": rate_date,
            "is_stale": stale,
            "notice": notice,
        })
    except ValueError as exc:
        return error_response(str(exc))
    except ConversionError as exc:
        return error_response(str(exc))


@app.get("/api/history")
def history():
    try:
        base = get_query_currency("from")
        quote = get_query_currency("to")
        start = request.args.get("start", "").strip()
        end = request.args.get("end", "").strip()
        if not start or not end:
            raise ValueError("Provide start and end dates in YYYY-MM-DD format.")
        try:
            start_date = date.fromisoformat(start)
            end_date = date.fromisoformat(end)
        except ValueError as exc:
            raise ValueError("Dates must use YYYY-MM-DD format.") from exc
        if start_date > end_date:
            raise ValueError("Start date must be on or before end date.")
        if (end_date - start_date).days > 3660:
            raise ValueError("Choose a date range of 10 years or less.")

        points = provider.get_history(base, quote, start, end)
        return jsonify({
            "base": base,
            "quote": quote,
            "start": start,
            "end": end,
            "points": points,
            "source": "Frankfurter",
            "notice": "Historical published reference rates; dates may reflect business-day availability.",
        })
    except ValueError as exc:
        return error_response(str(exc))
    except RateProviderError as exc:
        return error_response(f"Historical rates are unavailable for this request: {exc}", 503)


def get_demo_rate(base: str, quote: str) -> Decimal:
    """Get a demo rate via USD-relative sample values.

    These intentionally small sample values exist only for deterministic demos/tests.
    """
    if base not in DEMO_RATES or quote not in DEMO_RATES:
        raise ValueError("This currency is not included in the demo-rate set. Use live mode.")
    # DEMO_RATES represent units of each currency per 1 USD.
    return DEMO_RATES[quote] / DEMO_RATES[base]


@app.errorhandler(404)
def not_found(_error):
    return error_response("Route not found.", 404)


@app.errorhandler(500)
def server_error(_error):
    return error_response("Unexpected server error. Please try again later.", 500)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=False)
