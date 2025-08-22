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
  if (!data || data.error) {
    const code = data?.error?.code;
    if (code === 1002)
      throw new Error("Invalid API key. Please update your configuration.");
    if (code === 1006)
      throw new Error("City not found. Please check the spelling.");
    throw new Error(
      data?.error?.message || "Something went wrong. Please try again."
    );
  }

  const { location, current } = data;

  out.cityName.textContent = `${location.name}, ${location.country}`;

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

// Unified error formatter
function formatError(e) {
  const msg = e?.message?.toLowerCase() || "";
  if (msg.includes("failed to fetch"))
    return "Unable to connect. Check your internet or try again.";
  return e.message || "Something went wrong. Please try again.";
}

// Fetch method
async function loadWithFetch() {
  clearError();
  const q = cityInput.value.trim();
  if (!q) return showError("Please enter a city name.");

  try {
    showLoader();
    const response = await fetch(buildUrl(q));
    const data = await response.json();
    render(data);
  } catch (e) {
    showError(formatError(e));
  } finally {
    hideLoader();
  }
}

// Axios method
async function loadWithAxios() {
  clearError();
  const q = cityInput.value.trim();
  if (!q) return showError("Please enter a city name.");

  try {
    showLoader();
    const response = await axios.get(buildUrl(q));
    render(response.data);
  } catch (e) {
    const message = e.response?.data?.error?.message || formatError(e);
    showError(message);
  } finally {
    hideLoader();
  }
}

//CallBck
function loadWithCallback() {
  const q = cityInput.value.trim();
  if (!q) return showError("Please enter a city name.");

  showLoader();

  const xhr = new XMLHttpRequest();
  xhr.open("GET", buildUrl(q));

  xhr.onload = () => {
    hideLoader();
    if (xhr.status === 200) {
      try {
        render(JSON.parse(xhr.responseText));
      } catch (err) {
        showError("Invalid response: " + err.message);
      }
    } else {
      showError("Request failed: " + xhr.status);
    }
  };

  xhr.onerror = () => {
    hideLoader();
    showError("Network error occurred.");
  };
  xhr.send();
}

// Async JS method
function loadWithAsyncJS() {
  clearError();
  const q = cityInput.value.trim();
  if (!q) return showError("Please enter a city name.");

  showLoader();
  new Promise((resolve, reject) => {
    fetch(buildUrl(q))
      .then((res) => {
        if (!res.ok)
          reject(new Error("Request failed with status " + res.status));
        return res.json();
      })
      .then(resolve)
      .catch(reject);
  })
    .then((data) => render(data))
    .catch((err) => showError(formatError(err)))
    .finally(() => hideLoader());
}

btn.addEventListener("click", () => {
  switch (methodSelect.value) {
    case "fetch":
      loadWithFetch();
      break;
    case "axios":
      loadWithAxios();
      break;
    case "callback":
      loadWithCallback();
      break;
    case "asyncjs":
      loadWithAsyncJS();
      break;
  }
});

// Default city
cityInput.value = "Karachi";
setTimeout(loadWithFetch, 300);
