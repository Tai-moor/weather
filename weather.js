const API_KEY = "f75f43ff00f44de289d72604252008";
const BASE = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=`;

const el = (id) => document.getElementById(id);
const cityInput = el("city");
const btn = el("go");
const methodSelect = el("method");
const errBox = el("err");
const loader = el("loader");

const out = {
  icon: el("icon"),
  temp: el("temp"),
  condition: el("condition"),
  cityName: el("cityName"),
  feels: el("feels"),
  hum: el("hum"),
  wind: el("wind"),
  localTime: el("localTime"),
};

const online = () => navigator.onLine;

function showError(msg) {
  errBox.textContent = msg;
  errBox.style.display = "block";
  Object.values(out).forEach((el) => {
    if (el.tagName === "IMG") {
      el.src = "";
      el.alt = "";
    } else el.textContent = "—";
  });
}

function clearError() {
  errBox.textContent = "";
  errBox.style.display = "none";
}

function buildUrl(query) {
  return `${BASE}${encodeURIComponent(query)}`;
}

function setBackground(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("rain")) {
    document.body.style.background =
      "linear-gradient(to right, #434343, #000000)";
  } else if (condition.includes("cloud")) {
    document.body.style.background =
      "linear-gradient(to right, #bdc3c7, #2c3e50)";
  } else if (condition.includes("sun") || condition.includes("clear")) {
    document.body.style.background =
      "linear-gradient(to right, #fceabb, #f8b500)";
  } else if (condition.includes("snow")) {
    document.body.style.background =
      "linear-gradient(to right, #83a4d4, #b6fbff)";
  } else {
    document.body.style.background =
      "linear-gradient(to right, #6dd5ed, #2193b0)";
  }
}

function render(data) {
  if (!data || data.error)
    throw new Error(data?.error?.message || "Unknown error");

  const { location, current } = data;
  out.cityName.textContent = `${location.name}`;
  out.icon.src = `https:${current.condition.icon}`;
  out.icon.alt = current.condition.text;
  out.temp.textContent = `${Math.round(current.temp_c)}°C`;
  out.condition.textContent = current.condition.text;
  out.feels.textContent = `${Math.round(current.feelslike_c)}°C`;
  out.hum.textContent = `${current.humidity}%`;
  out.wind.textContent = `${Math.round(current.wind_kph)} kph`;
  out.localTime.textContent = location.localtime || "—";

  setBackground(current.condition.text);
  clearError();
}

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

// Fetch method
async function loadWithFetch() {
  clearError();
  if (!online()) return showError("You appear to be offline.");
  const q = cityInput.value.trim();
  if (!q) return showError("Please enter a city name.");

  try {
    showLoader();
    const response = await fetch(buildUrl(q));
    const data = await response.json();
    render(data);
  } catch (e) {
    showError(e.message || "Something went wrong. Please try again.");
  } finally {
    hideLoader();
  }
}

// Axios method
async function loadWithAxios() {
  clearError();
  if (!online()) return showError("You appear to be offline.");
  const q = cityInput.value.trim();
  if (!q) return showError("Please enter a city name.");

  try {
    showLoader();
    const response = await axios.get(buildUrl(q));
    render(response.data);
  } catch (e) {
    const message =
      e.response?.data?.error?.message ||
      e.message ||
      "Something went wrong. Please try again.";
    showError(message);
  } finally {
    hideLoader();
  }
}

btn.addEventListener("click", () => {
  methodSelect.value === "fetch" ? loadWithFetch() : loadWithAxios();
});

cityInput.value = "Karachi";
setTimeout(() => {
  methodSelect.value === "fetch" ? loadWithFetch() : loadWithAxios();
}, 300);
