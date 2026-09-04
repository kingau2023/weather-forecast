"use strict";

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const emptyState = document.querySelector(".empty-state");
const statusMessage = document.querySelector("#status-message");
const currentWeather = document.querySelector("#current-weather");
const locationName = document.querySelector("#location-name");
const currentIcon = document.querySelector("#current-icon");
const temperature = document.querySelector("#temperature");
const condition = document.querySelector("#condition");
const windSpeed = document.querySelector("#wind-speed");
const feelsLike = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const precipitation = document.querySelector("#precipitation");
const forecastPanel = document.querySelector(".forecast-panel");
const forecastGrid = document.querySelector("#forecast-grid");
const unitToggle = document.querySelector("#unit-toggle");
const themeToggle = document.querySelector("#theme-toggle");
let selectedLocation = null;
let latestWeather = null;
let useFahrenheit = false;
const savedCity = localStorage.getItem("weatherapp-city");
const savedTheme = localStorage.getItem("weatherapp-theme");

if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
  themeToggle.textContent = "Light mode";
  themeToggle.setAttribute("aria-pressed", "true");
  themeToggle.setAttribute("aria-label", "Switch to light mode");
}

if (savedCity) {
  cityInput.value = savedCity;
  emptyState.textContent = `Ready to refresh the forecast for ${savedCity}.`;
}

function formatTemperature(value) {
  const converted = useFahrenheit ? (value * 9) / 5 + 32 : value;
  return `${Math.round(converted)}°${useFahrenheit ? "F" : "C"}`;
}

function getWeatherCondition(code) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Mixed conditions";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀";
  if ([1, 2, 3].includes(code)) return "☁";
  if ([45, 48].includes(code)) return "〰";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "☂";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄";
  if ([95, 96, 99].includes(code)) return "⚡";
  return "○";
}

async function findCity(city) {
  const endpoint = new URL("https://geocoding-api.open-meteo.com/v1/search");
  endpoint.search = new URLSearchParams({
    name: city,
    count: "10",
    language: "uk",
    format: "json"
  });
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Geocoding request failed.");
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found.");
  }

  const normalizedCity = city.toLocaleLowerCase("uk");
  return data.results.find((result) => result.name.toLocaleLowerCase("uk") === normalizedCity) || data.results[0];
}

async function getCurrentWeather(location) {
  const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
  endpoint.search = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,weather_code,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto"
  });
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  return response.json();
}

function renderForecast(daily) {
  forecastGrid.replaceChildren();
  daily.time.forEach((date, index) => {
    const day = document.createElement("article");
    day.className = "forecast-day";
    const dayName = document.createElement("p");
    dayName.textContent = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
    const conditionName = document.createElement("p");
    conditionName.textContent = getWeatherCondition(daily.weather_code[index]);
    const icon = document.createElement("p");
    icon.className = "weather-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = getWeatherIcon(daily.weather_code[index]);
    const temperatures = document.createElement("p");
    temperatures.className = "temperature-range";
    temperatures.textContent = `${formatTemperature(daily.temperature_2m_max[index])} / ${formatTemperature(daily.temperature_2m_min[index])}`;
    day.append(dayName, icon, conditionName, temperatures);
    forecastGrid.append(day);
  });
  forecastPanel.hidden = false;
}

function renderWeather(weather) {
  temperature.textContent = formatTemperature(weather.current.temperature_2m);
  feelsLike.textContent = formatTemperature(weather.current.apparent_temperature);
  renderForecast(weather.daily);
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city) {
    emptyState.textContent = `Looking up ${city}...`;
    statusMessage.hidden = false;
    currentWeather.hidden = true;
    forecastPanel.hidden = true;
    try {
      selectedLocation = await findCity(city);
      const weather = await getCurrentWeather(selectedLocation);
      latestWeather = weather;
      localStorage.setItem("weatherapp-city", city);
      locationName.textContent = `${selectedLocation.name}, ${selectedLocation.country}`;
      renderWeather(weather);
      condition.textContent = getWeatherCondition(weather.current.weather_code);
      currentIcon.textContent = getWeatherIcon(weather.current.weather_code);
      windSpeed.textContent = Math.round(weather.current.wind_speed_10m);
      humidity.textContent = weather.current.relative_humidity_2m;
      precipitation.textContent = weather.current.precipitation;
      currentWeather.hidden = false;
      emptyState.textContent = "Current conditions";
    } catch (error) {
      selectedLocation = null;
      emptyState.textContent = "We could not find that city or load its forecast. Please try again.";
    } finally {
      statusMessage.hidden = true;
    }
  }
});

unitToggle.addEventListener("click", () => {
  useFahrenheit = !useFahrenheit;
  unitToggle.textContent = useFahrenheit ? "Use °C" : "Use °F";
  unitToggle.setAttribute("aria-pressed", String(useFahrenheit));
  if (latestWeather) renderWeather(latestWeather);
});

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  localStorage.setItem("weatherapp-theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
});
