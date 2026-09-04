"use strict";

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const emptyState = document.querySelector(".empty-state");
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

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city) {
    emptyState.textContent = `Looking up ${city}...`;
    try {
      selectedLocation = await findCity(city);
      emptyState.textContent = `Location selected: ${selectedLocation.name}, ${selectedLocation.country}.`;
    } catch (error) {
      selectedLocation = null;
      emptyState.textContent = error.message;
    }
  }
});
