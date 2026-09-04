# WeatherApp

WeatherApp is a small, accessible weather forecast web application built with plain HTML, CSS, and vanilla JavaScript. Search for a city to see its current conditions and a seven-day forecast without creating an account or supplying an API key.

## Features

- City search with Open-Meteo geocoding
- Current temperature, condition, wind, humidity, feels-like temperature, and precipitation
- Seven-day forecast with weather icons and high/low temperatures
- Celsius and Fahrenheit switching without another request
- Loading and friendly error states
- Last searched city restored from local storage
- Light and dark themes persisted in local storage
- Responsive layout for desktop, tablet, and mobile screens
- Semantic HTML, keyboard-friendly controls, visible focus states, and live status messaging

## Technologies

- HTML5 for semantic document structure
- CSS3 for layout, responsive breakpoints, theme colors, and visual states
- Modern browser JavaScript using `async`/`await`, the Fetch API, DOM methods, and `localStorage`

## API usage

WeatherApp uses the free [Open-Meteo API](https://open-meteo.com/), which does not require an API key.

1. The Geocoding API finds the first matching city and returns its latitude and longitude.
2. The Forecast API uses those coordinates to request current values and daily values for seven days.
3. Weather condition codes follow the WMO interpretation supplied by Open-Meteo and are mapped to readable labels and icons in the client.

The application checks response status, handles missing search results, and shows a friendly message when a request fails. API values are written through safe DOM APIs rather than inserted as HTML.

## Setup

No build step or dependency installation is needed.

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.
3. Search for a city and allow network access for the Open-Meteo requests.

For local development, any static file server can also serve the project directory, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```text
weather-forecast/
├── index.html   # Semantic application markup
├── style.css    # Layout, responsive design, and themes
├── script.js    # Search, API requests, rendering, and preferences
└── README.md    # Project documentation
```

## Browser support

Use a current browser with support for `fetch`, `async`/`await`, `URLSearchParams`, `localStorage`, and modern CSS media queries.
