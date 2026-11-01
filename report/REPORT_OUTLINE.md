# Nexa Exchange — School Report Outline

## 1. Introduction
Nexa Exchange is a responsive currency conversion website supported by a Python backend. It uses published reference exchange rates when available and includes an explicitly labelled demo mode for testing.

## 2. Objectives
- Convert amounts between supported currencies.
- Retrieve and display published exchange rates.
- Validate user input and handle provider errors.
- Demonstrate Python functions, conditionals, exception handling, API requests, and automated tests.
- Provide a responsive and accessible user interface.

## 3. Algorithm / Pseudocode
1. Read the source currency, target currency, and amount.
2. Normalize and validate the currency codes.
3. Check that the amount is numeric, finite, and not negative.
4. If source and target currencies match, use rate 1.
5. Otherwise retrieve the selected published rate, or an explicitly selected demo rate.
6. If a live request fails, use a sufficiently recent cached published snapshot if available.
7. If no suitable rate exists, return a clear error rather than inventing a result.
8. Multiply the amount by the rate using Decimal arithmetic.
9. Round the displayed result to two decimal places.
10. Return the result with source, rate date, stale status, and an explanatory notice.

## 4. Formula
Converted amount = amount × exchange rate.

## 5. Planned Testing
Run `python -m unittest discover -s tests -v` from the backend folder. Record the actual test output after running the tests; do not claim tests passed before execution.

## 6. Limitations
- Reference rates may not equal rates offered by a bank or money changer.
- Historical coverage and supported currencies depend on the data provider.
- Demo rates are illustrative only.
- The starter API is not a payment, trading, or remittance system.
- Production deployment needs security review, monitoring, rate limiting, and provider terms review.

## 7. Future Improvements
- Add a second provider with documented fallback rules.
- Add rate alerts and richer historical chart controls.
- Add accessibility and browser/device test automation.
- Add deployment monitoring and request rate limiting.
- Add account features only after privacy, security, and regulatory review.
