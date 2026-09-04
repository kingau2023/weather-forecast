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
let selectedLocation = null;

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
    count: "1",
    language: "en",
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

  return data.results[0];
}

async function getCurrentWeather(location) {
  const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
  endpoint.search = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,weather_code,wind_speed_10m,apparent_temperature,relative_humidity_2m,precipitation",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
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
    temperatures.textContent = `${Math.round(daily.temperature_2m_max[index])} / ${Math.round(daily.temperature_2m_min[index])}°C`;
    day.append(dayName, icon, conditionName, temperatures);
    forecastGrid.append(day);
  });
  forecastPanel.hidden = false;
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
      locationName.textContent = `${selectedLocation.name}, ${selectedLocation.country}`;
      temperature.textContent = Math.round(weather.current.temperature_2m);
      condition.textContent = getWeatherCondition(weather.current.weather_code);
      currentIcon.textContent = getWeatherIcon(weather.current.weather_code);
      windSpeed.textContent = Math.round(weather.current.wind_speed_10m);
      feelsLike.textContent = Math.round(weather.current.apparent_temperature);
      humidity.textContent = weather.current.relative_humidity_2m;
      precipitation.textContent = weather.current.precipitation;
      renderForecast(weather.daily);
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
