import type { Context } from "hono";

/** Browser page for reading check-ins. The API key stays in localStorage, not on the server. */
export function isCheckinView(c: Context): boolean {
	if (c.req.method !== "GET" && c.req.method !== "HEAD") {
		return false;
	}
	if (c.req.path === "/view") {
		return true;
	}
	return c.req.path === "/" && acceptsHtml(c.req.header("Accept"));
}

function acceptsHtml(accept: string | undefined): boolean {
	return !!accept && /text\/html/i.test(accept);
}

export const checkinViewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Check-ins</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, sans-serif; margin: 0; padding: 1.25rem; line-height: 1.4; }
  main { max-width: 52rem; margin: 0 auto; }
  h1 { font-size: 1.4rem; margin: 0 0 1rem; }
  form { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: end; margin-bottom: 1rem; }
  .is-hidden { display: none !important; }
  label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; flex: 1; min-width: 16rem; }
  input { font: inherit; padding: 0.45rem 0.55rem; }
  button { font: inherit; padding: 0.45rem 0.8rem; cursor: pointer; }
  p.message { margin: 0 0 1rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.45rem 0.6rem; border-bottom: 1px solid #8884; vertical-align: top; }
  th { font-size: 0.85rem; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  a { color: inherit; }
  .toolbar { margin: 0 0 0.75rem; }
</style>
</head>
<body>
<main>
  <h1>Check-ins</h1>
  <form id="key-form" class="is-hidden">
    <label>API key
      <input id="api-key" name="api-key" type="password" autocomplete="off" required>
    </label>
    <button type="submit">Show check-ins</button>
  </form>
  <p id="message" class="message is-hidden"></p>
  <div id="results" class="is-hidden">
    <p class="toolbar"><button type="button" id="change-key">Use a different API key</button></p>
    <table>
      <thead>
        <tr>
          <th>Fix time</th>
          <th class="num">Battery</th>
          <th>Location</th>
          <th class="num">Accuracy</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
</main>
<script>
const STORAGE_KEY = "locationCheckinApiKey";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const form = document.getElementById("key-form");
const keyInput = document.getElementById("api-key");
const message = document.getElementById("message");
const results = document.getElementById("results");
const rows = document.getElementById("rows");

function showMessage(text) {
  message.classList.toggle("is-hidden", !text);
  message.textContent = text || "";
}

function formatFix(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return day + " " + month + " : " + hour + ":" + minute;
}

function formatBattery(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return Math.round(value) + "%";
}

function formatAccuracy(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  return (Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)) + " m";
}

function fixTime(row) {
  const parsed = Date.parse(row.fix_timestamp || "");
  return Number.isNaN(parsed) ? -Infinity : parsed;
}

function fillTable(entries) {
  rows.replaceChildren();
  const ordered = entries.slice().sort((a, b) => fixTime(b) - fixTime(a));
  if (ordered.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "No check-ins.";
    tr.append(td);
    rows.append(tr);
    return;
  }
  for (const entry of ordered) {
    const tr = document.createElement("tr");
    const time = document.createElement("td");
    time.textContent = formatFix(entry.fix_timestamp);
    const battery = document.createElement("td");
    battery.className = "num";
    battery.textContent = formatBattery(entry.battery);
    const location = document.createElement("td");
    const lat = entry.lat;
    const lon = entry.lon;
    if (typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon)) {
      const link = document.createElement("a");
      link.href = "https://www.google.com/maps?q=" + encodeURIComponent(lat + "," + lon);
      link.textContent = lat + ", " + lon;
      location.append(link);
    } else {
      location.textContent = "—";
    }
    const accuracy = document.createElement("td");
    accuracy.className = "num";
    accuracy.textContent = formatAccuracy(entry.accuracy);
    tr.append(time, battery, location, accuracy);
    rows.append(tr);
  }
}

async function loadCheckins(apiKey) {
  const entries = [];
  let page = 1;
  for (;;) {
    const response = await fetch("/?page=" + page + "&per_page=100", {
      headers: {
        "Accept": "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (response.status === 401) {
      const error = new Error("unauthorized");
      error.status = 401;
      throw error;
    }
    if (!response.ok) {
      throw new Error("Could not load check-ins.");
    }
    const body = await response.json();
    const batch = Array.isArray(body.result) ? body.result : [];
    entries.push(...batch);
    const total = Number(body.result_info && body.result_info.total_count);
    if (batch.length === 0 || !Number.isFinite(total) || entries.length >= total) {
      break;
    }
    page += 1;
    if (page > 500) break;
  }
  return entries;
}

function showResults() {
  form.classList.add("is-hidden");
  results.classList.remove("is-hidden");
}

function showKeyForm() {
  results.classList.add("is-hidden");
  form.classList.remove("is-hidden");
  keyInput.value = "";
}

async function openWithKey(apiKey) {
  showMessage("");
  try {
    const entries = await loadCheckins(apiKey);
    localStorage.setItem(STORAGE_KEY, apiKey);
    fillTable(entries);
    showResults();
  } catch (error) {
    if (error && error.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      showKeyForm();
      showMessage("That API key was not accepted.");
      return;
    }
    showMessage(error && error.message ? error.message : "Could not load check-ins.");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const apiKey = keyInput.value.trim();
  if (!apiKey) return;
  openWithKey(apiKey);
});

document.getElementById("change-key").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  showMessage("");
  showKeyForm();
  keyInput.focus();
});

const savedKey = localStorage.getItem(STORAGE_KEY);
if (savedKey) {
  openWithKey(savedKey);
} else {
  form.classList.remove("is-hidden");
}
</script>
</body>
</html>
`;
