const API_BASE = "http://127.0.0.1:5000/api";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  currencies: [],
  from: "USD",
  to: "NPR",
  lastRate: null,
  lastRateDate: null,
  source: null,
  historyDays: 30,
  historyFrom: "USD",
  historyTo: "NPR",
  historyRequest: 0
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
  WST:"🇼🇸", XAF:"🌍", XCD:"🏝️", XCG:"🇨🇼", XOF:"🌍", XPF:"🌏", YER:"🇾🇪", ZAR:"🇿🇦", ZMW:"🇿🇲", ZWG:"🇿🇼",
  AWG:"🇦🇼", BGN:"🇧🇬", BMD:"🇧🇲", BWP:"🇧🇼", BYN:"🇧🇾", BZD:"🇧🇿", BTN:"🇧🇹", BIF:"🇧🇮", BND:"🇧🇳",
  BOV:"🇧🇴", CHE:"🇨🇭", CHW:"🇨🇭", CLF:"🇨🇱", CUC:"🇨🇺", GGP:"🇬🇬", IMP:"🇮🇲", JEP:"🇯🇪", KMF:"🇰🇲",
  LSL:"🇱🇸", MRU:"🇲🇷", MRO:"🇲🇷", MVR:"🇲🇻", MWK:"🇲🇼", MZN:"🇲🇿", NAD:"🇳🇦", PAB:"🇵🇦", SLL:"🇸🇱",
  SVC:"🇸🇻", SZL:"🇸🇿", TMT:"🇹🇲", TND:"🇹🇳", TTD:"🇹🇹", VES:"🇻🇪", VEF:"🇻🇪", ZMK:"🇿🇲", ZWD:"🇿🇼",
  ZWL:"🇿🇼", ZWN:"🇿🇼", XDR:"🌐", XAU:"🪙", XAG:"🥈", XPT:"🪙", XPD:"🪙", BTC:"₿", BCH:"₿", ETH:"◆", LTC:"Ł", XRP:"✕"
};

function getMeta(code, currencyName = "") {
  if (currencyMeta[code]) return currencyMeta[code];
  const country = commonCountries[code] || currencyName;
  let flag = countryFlags[code];
  // Some provider entries use less common or legacy currency codes. Match their
  // displayed currency names to a country before falling back to a neutral mark.
  if (!flag && currencyName) {
    const name = currencyName.toLowerCase();
    const countryNameFlags = [
      [/afghan/, "🇦🇫"], [/albanian/, "🇦🇱"], [/algerian/, "🇩🇿"], [/angolan/, "🇦🇴"], [/argentine/, "🇦🇷"],
      [/armenian/, "🇦🇲"], [/aruban/, "🇦🇼"], [/azerbaijan/, "🇦🇿"], [/bahamian/, "🇧🇸"], [/bahraini/, "🇧🇭"],
      [/barbadian/, "🇧🇧"], [/belarus/, "🇧🇾"], [/belize/, "🇧🇿"], [/bermudian/, "🇧🇲"], [/bhutan/, "🇧🇹"],
      [/bolivian/, "🇧🇴"], [/botswana/, "🇧🇼"], [/bulgarian/, "🇧🇬"], [/burundi/, "🇧🇮"], [/cambodian/, "🇰🇭"],
      [/cape verde/, "🇨🇻"], [/cayman/, "🇰🇾"], [/colombian/, "🇨🇴"], [/comorian/, "🇰🇲"], [/congolese/, "🇨🇩"],
      [/costa rican/, "🇨🇷"], [/cuban/, "🇨🇺"], [/djibouti/, "🇩🇯"], [/dominican/, "🇩🇴"], [/eritrean/, "🇪🇷"],
      [/ethiopian/, "🇪🇹"], [/fijian/, "🇫🇯"], [/gambian/, "🇬🇲"], [/georgian/, "🇬🇪"], [/guatemalan/, "🇬🇹"],
      [/guinean/, "🇬🇳"], [/guyanese/, "🇬🇾"], [/haitian/, "🇭🇹"], [/honduran/, "🇭🇳"], [/icelandic/, "🇮🇸"],
      [/jamaican/, "🇯🇲"], [/jordanian/, "🇯🇴"], [/kazakh/, "🇰🇿"], [/kyrgyz/, "🇰🇬"], [/lao /, "🇱🇦"],
      [/lebanese/, "🇱🇧"], [/lesotho/, "🇱🇸"], [/liberian/, "🇱🇷"], [/libyan/, "🇱🇾"], [/macedonian/, "🇲🇰"],
      [/malagasy/, "🇲🇬"], [/malawian/, "🇲🇼"], [/maldivian/, "🇲🇻"], [/mauritanian/, "🇲🇷"], [/mauritian/, "🇲🇺"],
      [/moldovan/, "🇲🇩"], [/mongolian/, "🇲🇳"], [/mozambican/, "🇲🇿"], [/namibian/, "🇳🇦"], [/nicaraguan/, "🇳🇮"],
      [/omani/, "🇴🇲"], [/panamanian/, "🇵🇦"], [/papua new guinean/, "🇵🇬"], [/paraguayan/, "🇵🇾"], [/peruvian/, "🇵🇪"],
      [/rwandan/, "🇷🇼"], [/serbian/, "🇷🇸"], [/seychellois/, "🇸🇨"], [/sierra leonean/, "🇸🇱"], [/solomon islands/, "🇸🇧"],
      [/somali/, "🇸🇴"], [/sudanese/, "🇸🇩"], [/surinamese/, "🇸🇷"], [/swazi/, "🇸🇿"], [/tajik/, "🇹🇯"],
      [/tanzanian/, "🇹🇿"], [/tongan/, "🇹🇴"], [/trinidad/, "🇹🇹"], [/turkmen/, "🇹🇲"], [/ugandan/, "🇺🇬"],
      [/uruguayan/, "🇺🇾"], [/uzbek/, "🇺🇿"], [/vanuatu/, "🇻🇺"], [/venezuelan/, "🇻🇪"], [/zambian/, "🇿🇲"],
      [/zimbabwe/, "🇿🇼"]
    ];
    const match = countryNameFlags.find(([pattern]) => pattern.test(name));
    if (match) flag = match[1];
  }
  return { country, flag: flag || (assetCodes.has(code) ? "🪙" : "🌐"), symbol: fallbackSymbols[code] || code };
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
      loadHistory();
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
    populateHistoryPairSelectors();
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
function populateHistoryPairSelectors() {
  const baseSelect = $("#history-base");
  const quoteSelect = $("#history-quote");
  if (!baseSelect || !quoteSelect || !state.currencies.length) return;
  const buildOptions = (select, selectedCode) => {
    select.replaceChildren();
    state.currencies.forEach(currency => {
      const option = document.createElement("option");
      option.value = currency.code;
      option.textContent = `${currency.code} · ${currency.name}`;
      select.append(option);
    });
    if (state.currencies.some(currency => currency.code === selectedCode)) select.value = selectedCode;
    else select.selectedIndex = 0;
  };
  buildOptions(baseSelect, state.historyFrom);
  buildOptions(quoteSelect, state.historyTo);
  state.historyFrom = baseSelect.value;
  state.historyTo = quoteSelect.value;
  baseSelect.addEventListener("change", () => {
    state.historyFrom = baseSelect.value;
    loadHistory();
  });
  quoteSelect.addEventListener("change", () => {
    state.historyTo = quoteSelect.value;
    loadHistory();
  });
}
function setupHistoryControls() {
  $$("[data-period]").forEach(button => button.addEventListener("click", () => {
    state.historyDays = Number(button.dataset.period) || 30;
    $$("[data-period]").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    loadHistory();
  }));
  const details = $("#history-details");
  const mobile = window.matchMedia("(max-width: 680px)");
  const applyResponsiveDisclosure = () => {
    if (mobile.matches) details.removeAttribute("open");
    else details.setAttribute("open", "");
  };
  applyResponsiveDisclosure();
  mobile.addEventListener?.("change", applyResponsiveDisclosure);
}
function formatChartDate(dateString, includeYear = false) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(includeYear ? { year: "2-digit" } : {}) });
}
function renderHistoryChart(points, base, quote) {
  const wrap = $("#history-chart-wrap");
  if (!points.length) {
    wrap.innerHTML = '<div class="chart-empty">No published reference points are available for this period.</div>';
    return;
  }
  const width = 900, height = 300, left = 14, right = 14, top = 22, bottom = 36;
  const values = points.map(point => Number(point.rate)).filter(Number.isFinite);
  if (!values.length) {
    wrap.innerHTML = '<div class="chart-empty">The provider returned no usable rate values.</div>';
    return;
  }
  const min = Math.min(...values), max = Math.max(...values);
  const spread = max - min || Math.max(Math.abs(max) * 0.01, 0.000001);
  const low = min - spread * 0.16, high = max + spread * 0.16;
  const x = index => left + (index / Math.max(points.length - 1, 1)) * (width - left - right);
  const y = value => top + ((high - value) / (high - low)) * (height - top - bottom);
  const coords = points.map((point, index) => `${x(index).toFixed(2)},${y(Number(point.rate)).toFixed(2)}`).join(" ");
  const area = `${left},${height-bottom} ${coords} ${width-right},${height-bottom}`;
  const last = Number(points[points.length - 1].rate);
  const first = Number(points[0].rate);
  const delta = last - first;
  const pct = first ? (delta / first) * 100 : 0;
  const positive = delta >= 0;
  const gradientId = `historyGradient${state.historyRequest}`;
  const yLabels = [0, 1, 2, 3].map(i => {
    const val = high - ((high - low) * i / 3);
    const yy = top + ((height - top - bottom) * i / 3);
    return `<line x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}" class="chart-gridline"/><text x="${left}" y="${yy-7}" class="chart-axis-label">${val.toLocaleString(undefined,{maximumFractionDigits:6})}</text>`;
  }).join("");
  const tickIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  const xLabels = tickIndexes.map(index => `<text x="${x(index)}" y="${height-9}" text-anchor="${index===0?'start':index===points.length-1?'end':'middle'}" class="chart-axis-label">${formatChartDate(points[index].date, state.historyDays >= 180)}</text>`).join("");
  wrap.innerHTML = `<svg class="history-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="${base} to ${quote} historical rates, ${points.length} published observations" role="img"><defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" class="chart-fill-start"/><stop offset="100%" class="chart-fill-end"/></linearGradient></defs>${yLabels}<polygon points="${area}" fill="url(#${gradientId})"/><polyline points="${coords}" class="chart-line"/><circle cx="${x(points.length-1)}" cy="${y(last)}" r="5" class="chart-last-point"/>${xLabels}</svg>`;
  $("#history-latest").textContent = `${prettyNumber(last, 6)} ${quote}`;
  $("#history-date").textContent = `As of ${formatChartDate(points[points.length - 1].date, true)}`;
  const change = $("#history-change");
  change.classList.toggle("up", positive);
  change.classList.toggle("down", !positive);
  change.textContent = `${positive ? "↗" : "↘"} ${positive ? "+" : ""}${prettyNumber(pct, 2)}% over selected period`;
  $("#history-source").textContent = `Source: Frankfurter · ${points.length} observations`;
}
async function loadHistory() {
  const wrap = $("#history-chart-wrap");
  if (!wrap || !state.historyFrom || !state.historyTo) return;
  const base = state.historyFrom;
  const quote = state.historyTo;
  const requestId = ++state.historyRequest;
  $("#history-pair-label").textContent = `${base} / ${quote}`;
  $("#history-error").textContent = "";
  if (base === quote) {
    $("#history-latest").textContent = `1 ${quote}`;
    $("#history-date").textContent = "Same-currency pair";
    $("#history-change").textContent = "No exchange-rate movement for identical currencies";
    $("#history-source").textContent = "No conversion required";
    wrap.innerHTML = '<div class="chart-empty">Choose two different currencies to explore their historical reference rate.</div>';
    return;
  }
  wrap.innerHTML = '<div class="chart-loading"><span class="chart-spinner"></span><span>Loading published history…</span></div>';
  $("#history-latest").textContent = "Loading…";
  $("#history-date").textContent = "Fetching available observations";
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - state.historyDays);
  const toISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const params = new URLSearchParams({ from: base, to: quote, start: toISO(startDate), end: toISO(endDate) });
  try {
    const data = await fetchJSON(`${API_BASE}/history?${params}`);
    if (requestId !== state.historyRequest) return;
    renderHistoryChart(data.points || [], base, quote);
    if (!(data.points || []).length) $("#history-footnote").textContent = "No observations were published for this pair and period. Try a longer time range.";
    else $("#history-footnote").textContent = "Historical reference rates are generally published on business days. Past movement does not predict future rates.";
  } catch (error) {
    if (requestId !== state.historyRequest) return;
    wrap.innerHTML = '<div class="chart-empty">Historical data is temporarily unavailable.</div>';
    $("#history-latest").textContent = "Unavailable";
    $("#history-date").textContent = "No historical observation loaded";
    $("#history-change").textContent = "Rate movement could not be calculated";
    $("#history-source").textContent = "Source: Frankfurter";
    $("#history-error").textContent = `${error.message} Please check the backend connection and try again.`;
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

function setupMobileNavigation() {
    const menuButton = document.getElementById("menu-toggle");
    const navigation = document.getElementById("main-navigation");

    if (!menuButton || !navigation) return;

    function closeMenu() {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
        menuButton.setAttribute("title", "Open navigation menu");
    }

    function toggleMenu() {
        const isOpen = navigation.classList.toggle("is-open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
        menuButton.setAttribute(
            "title",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    }

    menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    // Close after choosing a navigation link.
    navigation.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // Close if the user clicks outside the menu and header.
    document.addEventListener("click", (event) => {
        if (
            navigation.classList.contains("is-open") &&
            !navigation.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // Close with Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // Restore desktop navigation when the viewport gets wider.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 680) {
            closeMenu();
        }
    });
}
async function init() {
  $("#year").textContent = new Date().getFullYear();
  setupNavigation();
  setupMobileNavigation();
  setupTheme();
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
    loadHistory();
  });
  setupHistoryControls();
  const ready = await loadCurrencies();
  if (ready) {
    await Promise.all([convert(), loadRates(), loadHistory()]);
  }
}
document.addEventListener("DOMContentLoaded", init);
