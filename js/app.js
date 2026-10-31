const API_BASE = "http://127.0.0.1:5000/api";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  currencies: [],
  from: "USD",
  to: "NPR",
  lastRate: null,
  lastRateDate: null,
  source: null
};

const currencyMeta = {
  USD: { country: "United States", flag: "🇺🇸", symbol: "$" },
  NPR: { country: "Nepal", flag: "🇳🇵", symbol: "रू" },
  EUR: { country: "Euro area", flag: "🇪🇺", symbol: "€" },
  GBP: { country: "United Kingdom", flag: "🇬🇧", symbol: "£" },
  INR: { country: "India", flag: "🇮🇳", symbol: "₹" },
  JPY: { country: "Japan", flag: "🇯🇵", symbol: "¥" },
  CNY: { country: "China", flag: "🇨🇳", symbol: "¥" },
  CAD: { country: "Canada", flag: "🇨🇦", symbol: "C$" },
  AUD: { country: "Australia", flag: "🇦🇺", symbol: "A$" },
  CHF: { country: "Switzerland", flag: "🇨🇭", symbol: "Fr" },
  SGD: { country: "Singapore", flag: "🇸🇬", symbol: "S$" },
  KRW: { country: "South Korea", flag: "🇰🇷", symbol: "₩" },
  HKD: { country: "Hong Kong", flag: "🇭🇰", symbol: "HK$" },
  NZD: { country: "New Zealand", flag: "🇳🇿", symbol: "NZ$" },
  PKR: { country: "Pakistan", flag: "🇵🇰", symbol: "₨" },
  BDT: { country: "Bangladesh", flag: "🇧🇩", symbol: "৳" },
  LKR: { country: "Sri Lanka", flag: "🇱🇰", symbol: "Rs" },
  THB: { country: "Thailand", flag: "🇹🇭", symbol: "฿" },
  MYR: { country: "Malaysia", flag: "🇲🇾", symbol: "RM" },
  IDR: { country: "Indonesia", flag: "🇮🇩", symbol: "Rp" },
  AED: { country: "United Arab Emirates", flag: "🇦🇪", symbol: "د.إ" },
  SAR: { country: "Saudi Arabia", flag: "🇸🇦", symbol: "﷼" },
  QAR: { country: "Qatar", flag: "🇶🇦", symbol: "ر.ق" },
  KWD: { country: "Kuwait", flag: "🇰🇼", symbol: "د.ك" },
  TRY: { country: "Türkiye", flag: "🇹🇷", symbol: "₺" },
  ZAR: { country: "South Africa", flag: "🇿🇦", symbol: "R" },
  BRL: { country: "Brazil", flag: "🇧🇷", symbol: "R$" },
  MXN: { country: "Mexico", flag: "🇲🇽", symbol: "$" },
  RUB: { country: "Russia", flag: "🇷🇺", symbol: "₽" },
  VND: { country: "Vietnam", flag: "🇻🇳", symbol: "₫" },
  PHP: { country: "Philippines", flag: "🇵🇭", symbol: "₱" },
  SEK: { country: "Sweden", flag: "🇸🇪", symbol: "kr" },
  NOK: { country: "Norway", flag: "🇳🇴", symbol: "kr" },
  DKK: { country: "Denmark", flag: "🇩🇰", symbol: "kr" },
  PLN: { country: "Poland", flag: "🇵🇱", symbol: "zł" },
  CZK: { country: "Czechia", flag: "🇨🇿", symbol: "Kč" },
  HUF: { country: "Hungary", flag: "🇭🇺", symbol: "Ft" },
  EGP: { country: "Egypt", flag: "🇪🇬", symbol: "£" },
  NGN: { country: "Nigeria", flag: "🇳🇬", symbol: "₦" },
  KES: { country: "Kenya", flag: "🇰🇪", symbol: "KSh" },
  GHS: { country: "Ghana", flag: "🇬🇭", symbol: "₵" },
  UAH: { country: "Ukraine", flag: "🇺🇦", symbol: "₴" },
  XAU: { country: "Gold (troy ounce)", flag: "🪙", symbol: "XAU" },
  XAG: { country: "Silver (troy ounce)", flag: "🥈", symbol: "XAG" },
  BTC: { country: "Bitcoin", flag: "₿", symbol: "₿" },
  BCH: { country: "Bitcoin Cash", flag: "₿", symbol: "BCH" },
  ETH: { country: "Ethereum", flag: "◆", symbol: "ETH" },
  LTC: { country: "Litecoin", flag: "Ł", symbol: "LTC" },
  XRP: { country: "XRP", flag: "✕", symbol: "XRP" }
};
const fallbackSymbols = { USD: "$", EUR: "€", GBP: "£", NPR: "रू", INR: "₹", JPY: "¥", CNY: "¥", KRW: "₩", RUB: "₽", BTC: "₿" };
const assetCodes = new Set(["BTC", "BCH", "ETH", "LTC", "XRP", "XAU", "XAG", "XPD", "XPT", "XDR", "CMD"]);
const commonCountries = {
  AED: "United Arab Emirates", AFN: "Afghanistan", ALL: "Albania", AMD: "Armenia", ARS: "Argentina", AUD: "Australia",
  AZN: "Azerbaijan", BAM: "Bosnia and Herzegovina", BDT: "Bangladesh", BHD: "Bahrain", BIF: "Burundi", BND: "Brunei",
  BOB: "Bolivia", BRL: "Brazil", CAD: "Canada", CDF: "Democratic Republic of the Congo", CHF: "Switzerland",
  CLP: "Chile", CNY: "China", COP: "Colombia", CRC: "Costa Rica", CZK: "Czechia", DKK: "Denmark", DZD: "Algeria",
  EGP: "Egypt", EUR: "Euro area", FJD: "Fiji", GBP: "United Kingdom", GEL: "Georgia", GHS: "Ghana", HKD: "Hong Kong",
  HUF: "Hungary", IDR: "Indonesia", ILS: "Israel", INR: "India", IQD: "Iraq", IRR: "Iran", ISK: "Iceland",
  JMD: "Jamaica", JOD: "Jordan", JPY: "Japan", KES: "Kenya", KHR: "Cambodia", KRW: "South Korea", KWD: "Kuwait",
  KZT: "Kazakhstan", LAK: "Laos", LBP: "Lebanon", LKR: "Sri Lanka", MAD: "Morocco", MMK: "Myanmar", MNT: "Mongolia",
  MUR: "Mauritius", MXN: "Mexico", MYR: "Malaysia", NGN: "Nigeria", NOK: "Norway", NPR: "Nepal", NZD: "New Zealand",
  PKR: "Pakistan", PHP: "Philippines", PLN: "Poland", QAR: "Qatar", RON: "Romania", RUB: "Russia", SAR: "Saudi Arabia",
  SEK: "Sweden", SGD: "Singapore", THB: "Thailand", TRY: "Türkiye", TWD: "Taiwan", TZS: "Tanzania", UAH: "Ukraine",
  UGX: "Uganda", USD: "United States", UYU: "Uruguay", VND: "Vietnam", ZAR: "South Africa", ZMW: "Zambia"
};
const countryFlags = {
  AED:"🇦🇪", AFN:"🇦🇫", ALL:"🇦🇱", AMD:"🇦🇲", ANG:"🇳🇱", AOA:"🇦🇴", ARS:"🇦🇷", AUD:"🇦🇺", AZN:"🇦🇿",
  BAM:"🇧🇦", BBD:"🇧🇧", BDT:"🇧🇩", BHD:"🇧🇭", BIF:"🇧🇮", BND:"🇧🇳", BOB:"🇧🇴", BRL:"🇧🇷", BSD:"🇧🇸",
  CAD:"🇨🇦", CDF:"🇨🇩", CHF:"🇨🇭", CLP:"🇨🇱", CNY:"🇨🇳", CNH:"🇨🇳", COP:"🇨🇴", CRC:"🇨🇷", CUP:"🇨🇺",
  CVE:"🇨🇻", CZK:"🇨🇿", DJF:"🇩🇯", DKK:"🇩🇰", DOP:"🇩🇴", DZD:"🇩🇿", EGP:"🇪🇬", ERN:"🇪🇷", ETB:"🇪🇹",
  EUR:"🇪🇺", FJD:"🇫🇯", GBP:"🇬🇧", GEL:"🇬🇪", GHS:"🇬🇭", GMD:"🇬🇲", GNF:"🇬🇳", GTQ:"🇬🇹", GYD:"🇬🇾",
  HKD:"🇭🇰", HNL:"🇭🇳", HTG:"🇭🇹", HUF:"🇭🇺", IDR:"🇮🇩", ILS:"🇮🇱", INR:"🇮🇳", IQD:"🇮🇶", IRR:"🇮🇷",
  ISK:"🇮🇸", JMD:"🇯🇲", JOD:"🇯🇴", JPY:"🇯🇵", KES:"🇰🇪", KGS:"🇰🇬", KHR:"🇰🇭", KPW:"🇰🇵", KRW:"🇰🇷",
  KWD:"🇰🇼", KYD:"🇰🇾", KZT:"🇰🇿", LAK:"🇱🇦", LBP:"🇱🇧", LKR:"🇱🇰", LRD:"🇱🇷", LYD:"🇱🇾", MAD:"🇲🇦",
  MDL:"🇲🇩", MGA:"🇲🇬", MKD:"🇲🇰", MMK:"🇲🇲", MNT:"🇲🇳", MOP:"🇲🇴", MRU:"🇲🇷", MUR:"🇲🇺", MVR:"🇲🇻",
  MWK:"🇲🇼", MXN:"🇲🇽", MYR:"🇲🇾", MZN:"🇲🇿", NAD:"🇳🇦", NGN:"🇳🇬", NIO:"🇳🇮", NOK:"🇳🇴", NPR:"🇳🇵",
  NZD:"🇳🇿", OMR:"🇴🇲", PAB:"🇵🇦", PEN:"🇵🇪", PGK:"🇵🇬", PHP:"🇵🇭", PKR:"🇵🇰", PLN:"🇵🇱", PYG:"🇵🇾",
  QAR:"🇶🇦", RON:"🇷🇴", RSD:"🇷🇸", RUB:"🇷🇺", RWF:"🇷🇼", SAR:"🇸🇦", SBD:"🇸🇧", SCR:"🇸🇨", SDG:"🇸🇩",
  SEK:"🇸🇪", SGD:"🇸🇬", SLE:"🇸🇱", SOS:"🇸🇴", SRD:"🇸🇷", SSP:"🇸🇸", STN:"🇸🇹", SVC:"🇸🇻", SYP:"🇸🇾",
  SZL:"🇸🇿", THB:"🇹🇭", TJS:"🇹🇯", TMT:"🇹🇲", TND:"🇹🇳", TOP:"🇹🇴", TRY:"🇹🇷", TTD:"🇹🇹", TWD:"🇹🇼",
  TZS:"🇹🇿", UAH:"🇺🇦", UGX:"🇺🇬", USD:"🇺🇸", UYU:"🇺🇾", UZS:"🇺🇿", VES:"🇻🇪", VND:"🇻🇳", VUV:"🇻🇺",
  WST:"🇼🇸", XAF:"🌍", XCD:"🏝️", XCG:"🇨🇼", XOF:"🌍", XPF:"🌏", YER:"🇾🇪", ZAR:"🇿🇦", ZMW:"🇿🇲", ZWG:"🇿🇼"
};

function getMeta(code, currencyName = "") {
  if (currencyMeta[code]) return currencyMeta[code];
  const country = commonCountries[code] || currencyName;
  return { country, flag: countryFlags[code] || (assetCodes.has(code) ? "🪙" : "🌐"), symbol: fallbackSymbols[code] || code };
}
function createFlagVisual(flag) {
  // Convert a flag emoji such as 🇺🇸 into a real flag image, avoiding Windows
  // fonts that display regional-indicator letters (US, NP) instead of flags.
  const regionalIndicators = [...flag].map(char => char.codePointAt(0)).filter(cp => cp >= 0x1F1E6 && cp <= 0x1F1FF);
  if (regionalIndicators.length === 2) {
    const countryCode = regionalIndicators.map(cp => String.fromCharCode(cp - 0x1F1E6 + 65)).join('').toLowerCase();
    const img = document.createElement("img");
    img.src = `https://flagcdn.com/32x24/${countryCode}.png`;
    img.alt = `${countryCode.toUpperCase()} flag`;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      const fallback = document.createTextNode(flag);
      img.replaceWith(fallback);
    }, { once: true });
    return img;
  }
  const fallback = document.createElement("span");
  fallback.className = "flag-symbol";
  fallback.textContent = flag;
  return fallback;
}

function currencyLabel(code) {
  const found = state.currencies.find(c => c.code === code);
  return found ? found.name : code;
}
function prettyNumber(value, maximumFractionDigits = 2) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits, minimumFractionDigits: 2 });
}
function setConnection(ok, label) {
  $("#connection-label").textContent = label;
  const dot = $(".status-pill .status-dot");
  dot.classList.toggle("offline", !ok);
}
async function fetchJSON(url) {
  const response = await fetch(url);
  let data;
  try { data = await response.json(); } catch { throw new Error("The server returned an unreadable response."); }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function renderCurrencyPicker(id, selectedCode) {
  const picker = document.getElementById(id);
  const selected = state.currencies.find(c => c.code === selectedCode);
  if (!selected) return;
  const meta = getMeta(selected.code, selected.name);
  $(".currency-flag", picker).replaceChildren(createFlagVisual(meta.flag));
  $(".currency-code", picker).textContent = selected.code;
  $(".currency-name", picker).textContent = meta.country || selected.name;
  const options = $(".currency-options", picker);
  options.replaceChildren();
  const query = $(".currency-search", picker).value.trim().toLowerCase();
  const filtered = state.currencies.filter(c => {
    const m = getMeta(c.code, c.name);
    return `${c.code} ${c.name} ${m.country}`.toLowerCase().includes(query);
  });
  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty-options";
    empty.textContent = "No matching currencies.";
    empty.style.cssText = "padding:8px;color:var(--muted);font-size:12px";
    options.append(empty);
    return;
  }
  filtered.forEach(c => {
    const m = getMeta(c.code, c.name);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "currency-option";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(c.code === selectedCode));
    const flag = document.createElement("span");
    flag.className = "option-flag";
    flag.append(createFlagVisual(m.flag));
    const copy = document.createElement("span");
    copy.className = "option-copy";
    const strong = document.createElement("strong");
    strong.textContent = `${c.code} · ${c.name}`;
    const small = document.createElement("small");
    small.textContent = m.country || (assetCodes.has(c.code) ? "Digital or precious-metal asset" : "Currency");
    copy.append(strong, small);
    button.append(flag, copy);
    button.addEventListener("click", () => {
      if (id === "from-picker") state.from = c.code;
      else state.to = c.code;
      closePickers();
      updateSelectedCurrencies();
      convert();
    });
    options.append(button);
  });
}
function closePickers() {
  $$(".currency-picker").forEach(p => {
    p.classList.remove("open");
    $(".currency-trigger", p).setAttribute("aria-expanded", "false");
  });
}
function updateSelectedCurrencies() {
  renderCurrencyPicker("from-picker", state.from);
  renderCurrencyPicker("to-picker", state.to);
  $("#from-symbol").textContent = getMeta(state.from, currencyLabel(state.from)).symbol;
  $("#to-symbol").textContent = getMeta(state.to, currencyLabel(state.to)).symbol;
}
function setupPickers() {
  [["from-picker", state.from], ["to-picker", state.to]].forEach(([id]) => {
    const picker = document.getElementById(id);
    $(".currency-trigger", picker).addEventListener("click", () => {
      const willOpen = !picker.classList.contains("open");
      closePickers();
      if (willOpen) {
        picker.classList.add("open");
        $(".currency-trigger", picker).setAttribute("aria-expanded", "true");
        $(".currency-search", picker).value = "";
        renderCurrencyPicker(id, id === "from-picker" ? state.from : state.to);
        $(".currency-search", picker).focus();
      }
    });
    $(".currency-search", picker).addEventListener("input", () => renderCurrencyPicker(id, id === "from-picker" ? state.from : state.to));
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".currency-picker")) closePickers();
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closePickers(); });
}
async function loadCurrencies() {
  try {
    const data = await fetchJSON(`${API_BASE}/currencies`);
    state.currencies = (data.currencies || []).filter(c => c.code && c.name).sort((a,b) => a.code.localeCompare(b.code));
    if (!state.currencies.length) throw new Error("The currency list was empty.");
    if (!state.currencies.some(c => c.code === state.from)) state.from = state.currencies[0].code;
    if (!state.currencies.some(c => c.code === state.to)) state.to = state.currencies[0].code;
    updateSelectedCurrencies();
    setConnection(true, "API connected");
    return true;
  } catch (error) {
    setConnection(false, "API unavailable");
    $("#conversion-error").textContent = `${error.message} Start the Flask backend and reload this page.`;
    $("#rates-status").textContent = "Currency data unavailable.";
    return false;
  }
}
async function convert() {
  const amount = Number($("#amount-input").value);
  const button = $("#convert-button");
  const result = $("#result-amount");
  const error = $("#conversion-error");
  error.textContent = "";
  if (!Number.isFinite(amount) || amount <= 0) {
    result.textContent = "—";
    error.textContent = "Enter an amount greater than zero.";
    $("#rate-summary").textContent = "Enter a valid amount to convert.";
    return;
  }
  if (!state.from || !state.to) return;
  if (state.from === state.to) {
    result.textContent = prettyNumber(amount);
    state.lastRate = 1;
    state.lastRateDate = null;
    $("#rate-summary").textContent = `1 ${state.from} = 1 ${state.to}`;
    $("#conversion-notice").textContent = "Same-currency conversion. No exchange rate is applied.";
    return;
  }
  button.disabled = true;
  button.textContent = "Converting…";
  try {
    const params = new URLSearchParams({ from: state.from, to: state.to, amount: String(amount), mode: "live" });
    const data = await fetchJSON(`${API_BASE}/convert?${params}`);
    result.textContent = prettyNumber(data.converted_amount);
    state.lastRate = Number(data.rate);
    state.lastRateDate = data.rate_date;
    state.source = data.source;
    $("#rate-summary").textContent = `1 ${data.base} = ${prettyNumber(data.rate, 6)} ${data.quote}`;
    $("#conversion-notice").textContent = [data.notice, data.rate_date ? `Rate date: ${data.rate_date}.` : "", data.source ? `Source: ${data.source}.` : ""].filter(Boolean).join(" ");
    saveRecent({ amount, from: state.from, to: state.to, result: data.converted_amount, date: data.rate_date });
  } catch (err) {
    result.textContent = "—";
    error.textContent = err.message || "Conversion failed. Please try again.";
    $("#rate-summary").textContent = "Could not retrieve a reference rate.";
  } finally {
    button.disabled = false;
    button.innerHTML = 'Convert <span aria-hidden="true">↗</span>';
  }
}
async function loadRates() {
  const grid = $("#rates-grid");
  try {
    const data = await fetchJSON(`${API_BASE}/rates?base=USD`);
    const codes = ["NPR", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF"];
    grid.replaceChildren();
    codes.filter(code => data.rates && data.rates[code]).forEach(code => {
      const currency = state.currencies.find(c => c.code === code);
      const meta = getMeta(code, currency ? currency.name : code);
      const card = document.createElement("article");
      card.className = "rate-card";
      const top = document.createElement("div");
      top.className = "rate-card-top";
      const name = document.createElement("div");
      name.className = "rate-currency";
      const flag = document.createElement("span");
      flag.className = "rate-flag";
      flag.append(createFlagVisual(meta.flag));
      const textWrap = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = code;
      const small = document.createElement("small");
      small.textContent = meta.country || (currency ? currency.name : code);
      textWrap.append(strong, small);
      name.append(flag, textWrap);
      top.append(name);
      const star = document.createElement("span");
      star.style.cssText = "color:var(--gold);font-size:12px";
      star.textContent = "↗";
      top.append(star);
      const value = document.createElement("div");
      value.className = "rate-value";
      value.textContent = prettyNumber(data.rates[code], 4);
      const unit = document.createElement("div");
      unit.className = "rate-unit";
      unit.textContent = `per 1 USD`;
      card.append(top, value, unit);
      grid.append(card);
    });
    $("#rates-status").textContent = `Reference rates · ${data.source || "provider"}`;
    $("#rates-date").textContent = data.rate_date ? `Rate date: ${data.rate_date}` : "";
  } catch (error) {
    grid.replaceChildren();
    const message = document.createElement("p");
    message.className = "notice";
    message.textContent = "Rates are temporarily unavailable. Start or check the backend, then reload.";
    grid.append(message);
    $("#rates-status").textContent = "Could not load rates.";
  }
}
function saveRecent(item) {
  try {
    const items = JSON.parse(localStorage.getItem("nexa-recent") || "[]");
    items.unshift({ ...item, at: Date.now() });
    localStorage.setItem("nexa-recent", JSON.stringify(items.slice(0, 10)));
  } catch { /* Local history is optional; conversion still succeeds. */ }
}
function setupTheme() {
  const button = $("#theme-toggle");
  try {
    if (localStorage.getItem("nexa-theme") === "light") document.body.classList.add("light-theme");
  } catch {}
  button.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    try { localStorage.setItem("nexa-theme", document.body.classList.contains("light-theme") ? "light" : "dark"); } catch {}
  });
}
function setupNavigation() {
  $$(".nav-link").forEach(link => link.addEventListener("click", () => {
    $$(".nav-link").forEach(item => item.classList.toggle("active", item === link));
  }));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  ["home", "rates", "about"].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
}
async function init() {
  $("#year").textContent = new Date().getFullYear();
  setupTheme();
  setupNavigation();
  setupPickers();
  $("#convert-button").addEventListener("click", convert);
  $("#amount-input").addEventListener("input", () => {
    clearTimeout(window.nexaInputDelay);
    window.nexaInputDelay = setTimeout(convert, 350);
  });
  $("#swap-button").addEventListener("click", () => {
    [state.from, state.to] = [state.to, state.from];
    updateSelectedCurrencies();
    convert();
  });
  const ready = await loadCurrencies();
  if (ready) {
    await Promise.all([convert(), loadRates()]);
  }
}
document.addEventListener("DOMContentLoaded", init);
