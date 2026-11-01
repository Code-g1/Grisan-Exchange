import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import unittest
from decimal import Decimal
from services.conversion import ConversionError, convert_amount, validate_currency_code


class ConversionTests(unittest.TestCase):
    def test_basic_conversion(self):
        self.assertEqual(convert_amount(Decimal("100"), Decimal("133")), Decimal("13300.00"))

    def test_decimal_conversion(self):
        self.assertEqual(convert_amount(Decimal("12.50"), Decimal("2")), Decimal("25.00"))

    def test_rounds_half_up(self):
        self.assertEqual(convert_amount(Decimal("1"), Decimal("1.235")), Decimal("1.24"))

    def test_zero_is_valid(self):
        self.assertEqual(convert_amount(Decimal("0"), Decimal("133")), Decimal("0.00"))

    def test_negative_amount_rejected(self):
        with self.assertRaises(ConversionError):
            convert_amount(Decimal("-1"), Decimal("2"))

    def test_zero_rate_rejected(self):
        with self.assertRaises(ConversionError):
            convert_amount(Decimal("10"), Decimal("0"))

    def test_non_finite_amount_rejected(self):
        with self.assertRaises(ConversionError):
            convert_amount(Decimal("NaN"), Decimal("2"))

    def test_currency_code_normalized(self):
        self.assertEqual(validate_currency_code(" npr "), "NPR")

    def test_invalid_currency_code_rejected(self):
        for code in ("US", "USDD", "1NP", "N!P", ""):
            with self.subTest(code=code):
                with self.assertRaises(ConversionError):
                    validate_currency_code(code)


if __name__ == "__main__":
    unittest.main()
