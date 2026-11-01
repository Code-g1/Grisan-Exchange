import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import unittest
from unittest.mock import patch
from app import app


class ApiTests(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_health(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "ok")

    def test_demo_conversion(self):
        response = self.client.get(
            "/api/convert?from=USD&to=NPR&amount=100&mode=demo"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["converted_amount"], "13300.00")
        self.assertEqual(response.json["source"], "demo")
        self.assertIn("Not a live", response.json["notice"])

    def test_invalid_amount(self):
        response = self.client.get("/api/convert?from=USD&to=NPR&amount=abc")
        self.assertEqual(response.status_code, 400)
        self.assertIn("valid number", response.json["error"])

    def test_negative_amount(self):
        response = self.client.get("/api/convert?from=USD&to=NPR&amount=-5")
        self.assertEqual(response.status_code, 400)

    def test_same_currency(self):
        response = self.client.get("/api/convert?from=USD&to=USD&amount=15")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["rate"], "1")
        self.assertEqual(response.json["converted_amount"], "15")

    def test_invalid_mode(self):
        response = self.client.get("/api/convert?from=USD&to=NPR&amount=1&mode=maybe")
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
