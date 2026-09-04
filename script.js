"use strict";

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const emptyState = document.querySelector(".empty-state");
const currentWeather = document.querySelector("#current-weather");
const locationName = document.querySelector("#location-name");
const temperature = document.querySelector("#temperature");
const weatherCode = document.querySelector("#weather-code");
const windSpeed = document.querySelector("#wind-speed");
let selectedLocation = null;

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
    current: "temperature_2m,weather_code,wind_speed_10m",
    timezone: "auto"
  });
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  return response.json();
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city) {
    emptyState.textContent = `Looking up ${city}...`;
    try {
      selectedLocation = await findCity(city);
      const weather = await getCurrentWeather(selectedLocation);
      locationName.textContent = `${selectedLocation.name}, ${selectedLocation.country}`;
      temperature.textContent = Math.round(weather.current.temperature_2m);
      weatherCode.textContent = weather.current.weather_code;
      windSpeed.textContent = Math.round(weather.current.wind_speed_10m);
      currentWeather.hidden = false;
      emptyState.textContent = "Current conditions";
    } catch (error) {
      selectedLocation = null;
      emptyState.textContent = error.message;
    }
  }
});
