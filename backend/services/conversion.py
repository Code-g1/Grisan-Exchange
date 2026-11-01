"""Pure conversion and validation functions."""
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP


class ConversionError(ValueError):
    """Raised when conversion input is invalid."""


def validate_currency_code(code: str) -> str:
    """Validate the shape of an ISO-style currency code.

    The provider remains the authority on whether a code is supported.
    """
    normalized = code.strip().upper()
    if len(normalized) != 3 or not normalized.isalpha() or not normalized.isascii():
        raise ConversionError("Currency codes must be three letters, such as USD or NPR.")
    return normalized


def convert_amount(amount: Decimal, rate: Decimal) -> Decimal:
    """Multiply an amount by a rate and round to two display decimals.

    This is a reference conversion display rule, not a settlement rule.
    """
    if not amount.is_finite() or not rate.is_finite():
        raise ConversionError("Amount and rate must be finite numbers.")
    if amount < 0:
        raise ConversionError("Amount cannot be negative.")
    if rate <= 0:
        raise ConversionError("Exchange rate must be greater than zero.")
    try:
        result = amount * rate
    except (InvalidOperation, TypeError) as exc:
        raise ConversionError("Could not calculate this conversion.") from exc
    return result.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
