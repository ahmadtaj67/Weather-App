

// Apni existing OpenWeatherMap API key yahan paste karo
const apiKey = "046c3e5953ed4fac61bf7a55c8ad4a6c";
let temperatureChart = null;

// HTML Elements
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchBtn");
const errorMessage = document.getElementById("errorMessage");
const clearHistoryButton = document.getElementById("clearHistory");
const dashboard =
  document.querySelector(".dashboard");
  const unitButton =
  document.getElementById("unitButton");

const locationButton =
  document.getElementById("locationButton");
  

let currentUnit = "C";
let latestCurrentData = null;
let latestForecastData = null;
let latestAirQualityData = null;

// ==============================
// Get Weather
// ==============================

async function getWeather(cityFromHistory = "") {
  const city =
    cityFromHistory || cityInput.value.trim();

  clearError();

  if (!city) {
    showError("Please enter a city name.");
    cityInput.focus();
    return;
  }

  if (
    !apiKey ||
    apiKey === "PASTE_YOUR_API_KEY_HERE"
  ) {
    showError(
      "Please add your OpenWeatherMap API key in script.js."
    );
    return;
  }

  setLoading(true);

  const currentWeatherUrl =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?q=${encodeURIComponent(city)}` +
    `&units=metric` +
    `&appid=${apiKey}`;

  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?q=${encodeURIComponent(city)}` +
    `&units=metric` +
    `&appid=${apiKey}`;

  try {
    const responses = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);
    function animateWeatherData() {
  const animatedElements = [
    document.getElementById("city"),
    document.getElementById("temp"),
    document.getElementById("description"),
    document.getElementById("feelsLike"),
    document.getElementById("humidity"),
    document.getElementById("windSpeed"),
    document.getElementById("detailHumidity"),
    document.getElementById("pressure"),
    document.getElementById("visibility"),
    document.getElementById("sunrise"),
    document.getElementById("sunset"),
    document.getElementById("forecastList"),
    document.getElementById("rainList"),
    document.getElementById("weeklyForecast"),
    document.getElementById("aqiValue"),
document.getElementById("aqiStatus"),
document.getElementById("aqiDescription"),
document.getElementById("aqiBadge"),
document.getElementById("pm25"),
document.getElementById("pm10"),
document.getElementById("carbonMonoxide"),
document.getElementById("nitrogenDioxide")
  ];

  animatedElements.forEach((element) => {
    if (!element) {
      return;
    }

    element.classList.remove(
      "weather-data-updated"
    );

    void element.offsetWidth;

    element.classList.add(
      "weather-data-updated"
    );
  });
}

    const currentResponse = responses[0];
    const forecastResponse = responses[1];

    const currentData =
      await currentResponse.json();

    const forecastData =
      await forecastResponse.json();

    if (!currentResponse.ok) {
      if (currentResponse.status === 404) {
        throw new Error(
          "City not found. Please check the city name."
        );
      }

      if (currentResponse.status === 401) {
        throw new Error(
          "Invalid API key. Please check your API key."
        );
      }

      throw new Error(
        currentData.message ||
        "Unable to fetch current weather."
      );
    }

    if (!forecastResponse.ok) {
      throw new Error(
        forecastData.message ||
        "Unable to fetch weather forecast."
      );
    }

latestCurrentData = currentData;
latestForecastData = forecastData;

const airQualityData =
  await getAirQuality(
    currentData.coord.lat,
    currentData.coord.lon
  );

latestAirQualityData =
  airQualityData;

updateWeatherUI(currentData);
    updateHourlyForecast(
      forecastData,
      currentData.timezone
    );
updateWeeklyForecast(
  forecastData,
  currentData.timezone
);
    updateTemperatureChart(
      forecastData,
      currentData.timezone
    );
    updateRainChance(
  forecastData,
  currentData.timezone
);
   updateAirQualityUI(
  airQualityData
);
    saveToHistory(currentData.name);

    cityInput.value = "";
  } catch (error) {
    console.error("Weather error:", error);
    showError(error.message);
  } finally {
    setLoading(false);
  }
}


// ==============================
// Update Dashboard
// ==============================

function updateWeatherUI(data) {
const temperature =
  convertTemperature(data.main.temp);

const feelsLike =
  convertTemperature(data.main.feels_like);
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;

  const windSpeed = Math.round(data.wind.speed * 3.6);

  const visibility = data.visibility
    ? (data.visibility / 1000).toFixed(1)
    : "--";

  const weatherDescription = data.weather[0].description;
  const iconCode = data.weather[0].icon;

  const country = data.sys.country || "";

  // Left weather card
  document.getElementById("city").textContent =
    `${data.name}, ${country}`;

  document.getElementById("temp").textContent =
    temperature;

  document.getElementById("description").textContent =
    weatherDescription;

  document.getElementById("feelsLike").textContent =
    `${feelsLike}°C`;
  document.getElementById("temp").textContent =
  temperature;
  const unitLabel =
  document.querySelector(
    ".temperature-number sup"
  );

if (unitLabel) {
  unitLabel.textContent =
    getUnitSymbol();
}

  document.getElementById("humidity").textContent =
    `${humidity}%`;

  // Main dashboard detail cards
  document.getElementById("detailHumidity").textContent =
    `${humidity}%`;

  document.getElementById("windSpeed").textContent =
    `${windSpeed} km/h`;

  document.getElementById("pressure").textContent =
    `${pressure} hPa`;

  document.getElementById("visibility").textContent =
    `${visibility} km`;

  // Header city
  document.getElementById("headerCity").textContent =
    `${data.name}, ${country}`;

  // Weather icon
  const weatherIcon = document.getElementById("weatherIcon");

  weatherIcon.src =
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherIcon.alt = weatherDescription;

  // City date and time
  document.getElementById("date").textContent =
    formatCityDate(data.timezone);

  // Sunrise and sunset
  document.getElementById("sunrise").textContent =
    formatUnixTime(
      data.sys.sunrise,
      data.timezone
    );

  document.getElementById("sunset").textContent =
    formatUnixTime(
      data.sys.sunset,
      data.timezone
    );
}
function updateRainChance(
  forecastData,
  timezoneOffset
) {
  const rainList =
    document.getElementById("rainList");

  if (!rainList) {
    console.error("rainList element not found.");
    return;
  }

  rainList.innerHTML = "";

  const rainItems =
    forecastData.list.slice(0, 6);

  rainItems.forEach((item, index) => {
    const probability =
      Math.round((item.pop || 0) * 100);

    const time =
      index === 0
        ? "Now"
        : formatForecastTime(
            item.dt,
            timezoneOffset
          );

    const row =
      document.createElement("div");

    row.className = "rain-row";

    row.innerHTML = `
      <span class="rain-time">
        ${time}
      </span>

      <div class="rain-track">
        <div
          class="rain-fill"
          style="width: ${probability}%"
        ></div>
      </div>

      <strong class="rain-percentage">
        ${probability}%
      </strong>
    `;

    rainList.appendChild(row);
  });
}

function updateHourlyForecast(
  forecastData,
  timezoneOffset
) {
  const forecastList =
    document.getElementById("forecastList");

  forecastList.innerHTML = "";

  const hourlyItems =
    forecastData.list.slice(0, 6);

  hourlyItems.forEach((item, index) => {
    const temperature =
      Math.round(item.main.temp);

    const iconCode =
      item.weather[0].icon;

    const description =
      item.weather[0].description;

    const rainProbability =
      Math.round((item.pop || 0) * 100);

    const time =
      index === 0
        ? "Now"
        : formatForecastTime(
            item.dt,
            timezoneOffset
          );

    const card =
      document.createElement("article");

    card.className =
      index === 0
        ? "forecast-card active"
        : "forecast-card";

    card.innerHTML = `
      <span>${time}</span>

      <img
        src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
        alt="${description}"
      >

      <strong>${temperature}°</strong>

      <span class="rain-chance">
        <i class="fa-solid fa-droplet"></i>
        ${rainProbability}%
      </span>
    `;

    forecastList.appendChild(card);
  });
}

// ==============================
// 5-Day Forecast
// ==============================

function updateWeeklyForecast(
  forecastData,
  timezoneOffset
) {
  const weeklyForecast =
    document.getElementById("weeklyForecast");

  if (!weeklyForecast) {
    console.warn(
      "weeklyForecast element was not found."
    );

    return;
  }

  weeklyForecast.innerHTML = "";

  if (
    !forecastData ||
    !Array.isArray(forecastData.list) ||
    forecastData.list.length === 0
  ) {
    weeklyForecast.innerHTML = `
      <p class="forecast-loading">
        5-day forecast is currently unavailable
      </p>
    `;

    return;
  }

  const dailyGroups = {};

  forecastData.list.forEach((item) => {
    if (
      !item ||
      !item.main ||
      !Array.isArray(item.weather) ||
      item.weather.length === 0
    ) {
      return;
    }

    const cityLocalDate = new Date(
      item.dt * 1000 +
      timezoneOffset * 1000
    );

    const dateKey = cityLocalDate
      .toISOString()
      .split("T")[0];

    if (!dailyGroups[dateKey]) {
      dailyGroups[dateKey] = [];
    }

    dailyGroups[dateKey].push(item);
  });

  const currentCityDate = new Date(
    Date.now() +
    new Date().getTimezoneOffset() * 60 * 1000 +
    timezoneOffset * 1000
  );

  const currentDateKey = currentCityDate
    .toISOString()
    .split("T")[0];

  const futureDateKeys = Object.keys(dailyGroups)
    .filter((dateKey) => dateKey > currentDateKey)
    .sort()
    .slice(0, 5);

  if (futureDateKeys.length === 0) {
    weeklyForecast.innerHTML = `
      <p class="forecast-loading">
        5-day forecast is currently unavailable
      </p>
    `;

    return;
  }

  futureDateKeys.forEach((dateKey) => {
    const dayItems = dailyGroups[dateKey];

    const maximumTemperature = Math.max(
      ...dayItems.map(
        (item) => item.main.temp_max
      )
    );

    const minimumTemperature = Math.min(
      ...dayItems.map(
        (item) => item.main.temp_min
      )
    );

    const maximumRainProbability = Math.max(
      ...dayItems.map(
        (item) => Math.round((item.pop || 0) * 100)
      )
    );

    const representativeItem =
      getRepresentativeForecastItem(dayItems);

    const weatherData =
      representativeItem.weather[0];

    const iconCode = weatherData.icon;
    const description = weatherData.description;

    const convertedMaximumTemperature =
      convertTemperature(maximumTemperature);

    const convertedMinimumTemperature =
      convertTemperature(minimumTemperature);

    const formattedDate =
      formatWeeklyForecastDate(
        dateKey
      );

    const card =
      document.createElement("article");

    card.className = "weekly-forecast-card";

    card.innerHTML = `
      <span class="weekly-day">
        ${formattedDate.dayName}
      </span>

      <span class="weekly-date">
        ${formattedDate.dateLabel}
      </span>

      <img
        class="weekly-weather-icon"
        src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
        alt="${description}"
        loading="lazy"
      >

      <div class="weekly-temperature">
        <strong class="weekly-max-temp">
          ${convertedMaximumTemperature}°
        </strong>

        <span class="weekly-min-temp">
          ${convertedMinimumTemperature}°
        </span>
      </div>

      <span class="weekly-description">
        ${description}
      </span>

      <span class="weekly-rain">
        <i class="fa-solid fa-droplet"></i>
        ${maximumRainProbability}%
      </span>
    `;

    weeklyForecast.appendChild(card);
  });
}


// ==============================
// Representative Daily Weather
// ==============================

function getRepresentativeForecastItem(dayItems) {
  const middayItem = dayItems.find((item) => {
    const hour = new Date(
      item.dt * 1000
    ).getUTCHours();

    return hour >= 11 && hour <= 14;
  });

  if (middayItem) {
    return middayItem;
  }

  return dayItems[
    Math.floor(dayItems.length / 2)
  ];
}


// ==============================
// Weekly Forecast Date
// ==============================

function formatWeeklyForecastDate(dateKey) {
  const date = new Date(
    `${dateKey}T12:00:00Z`
  );

  const dayName =
    date.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC"
    });

  const dateLabel =
    date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC"
    });

  return {
    dayName,
    dateLabel
  };
}
function updateTemperatureChart(
  forecastData,
  timezoneOffset
) {
  const chartItems =
    forecastData.list.slice(0, 8);

  const labels = chartItems.map((item) =>
    formatForecastTime(
      item.dt,
      timezoneOffset
    )
  );

const temperatures = chartItems.map(
  (item) =>
    convertTemperature(item.main.temp)
);

  const canvas =
    document.getElementById(
      "temperatureChart"
    );

  const context =
    canvas.getContext("2d");

  if (temperatureChart) {
    temperatureChart.destroy();
  }

  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      220
    );

  gradient.addColorStop(
    0,
    "rgba(255, 117, 71, 0.35)"
  );

  gradient.addColorStop(
    1,
    "rgba(255, 117, 71, 0)"
  );

  temperatureChart = new Chart(
    context,
    {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: "Temperature",

            data: temperatures,

            borderColor: "#ff7547",

            backgroundColor: gradient,

            borderWidth: 3,

            fill: true,

            tension: 0.4,

            pointRadius: 4,

            pointHoverRadius: 7,

            pointBackgroundColor:
              "#ff7547",

            pointBorderColor:
              "#2a2724",

            pointBorderWidth: 3
          }
        ]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        interaction: {
          intersect: false,
          mode: "index"
        },

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            backgroundColor: "#191816",

            titleColor: "#ffffff",

            bodyColor: "#d8d4d0",

            borderColor:
              "rgba(255, 255, 255, 0.1)",

            borderWidth: 1,

            padding: 12,

            displayColors: false,

            callbacks: {
              label: function (context) {
                return `${context.parsed.y}${getUnitSymbol()}`;
              }
            }
          }
        },

        scales: {
          x: {
            grid: {
              display: false
            },

            border: {
              display: false
            },

            ticks: {
              color: "#9d9893",

              font: {
                size: 9,
                family: "Poppins"
              }
            }
          },

          y: {
            beginAtZero: false,

            grid: {
              color:
                "rgba(255, 255, 255, 0.055)"
            },

            border: {
              display: false
            },

            ticks: {
              color: "#9d9893",

              callback: function (value) {
                return `${value}°`;
              },

              font: {
                size: 9,
                family: "Poppins"
              }
            }
          }
        }
      }
    }
  );
}
function formatForecastTime(
  unixTimestamp,
  timezoneOffset
) {
  const localDate = new Date(
    unixTimestamp * 1000 +
    timezoneOffset * 1000
  );

  return localDate.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      hour12: true,
      timeZone: "UTC"
    }
  );
}
function convertTemperature(celsiusValue) {
  if (currentUnit === "F") {
    return Math.round(
      (celsiusValue * 9) / 5 + 32
    );
  }

  return Math.round(celsiusValue);
}

function getUnitSymbol() {
  return currentUnit === "F"
    ? "°F"
    : "°C";
}
// ==============================
// City Date
// ==============================

function formatCityDate(timezoneOffset) {
  const currentUtcTime =
    Date.now() +
    new Date().getTimezoneOffset() * 60 * 1000;

  const cityTime =
    new Date(currentUtcTime + timezoneOffset * 1000);

  return cityTime.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

// ==============================
// Sunrise / Sunset Time
// ==============================

function formatUnixTime(unixTimestamp, timezoneOffset) {
  const utcMilliseconds = unixTimestamp * 1000;

  const localDate = new Date(
    utcMilliseconds + timezoneOffset * 1000
  );

  return localDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  });
}

// ==============================
// Loading State
// ==============================

function setLoading(isLoading) {
  searchButton.disabled = isLoading;

  searchButton.innerHTML = isLoading
    ? `<i class="fa-solid fa-spinner fa-spin"></i>`
    : `<i class="fa-solid fa-magnifying-glass"></i>`;

  if (dashboard) {
    dashboard.classList.toggle(
      "dashboard-is-loading",
      isLoading
    );
  }
}

// ==============================
// Errors
// ==============================

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}
function animateWeatherData() {
  const animatedElements = [
    document.getElementById("city"),
    document.getElementById("temp"),
    document.getElementById("description"),
    document.getElementById("feelsLike"),
    document.getElementById("humidity"),
    document.getElementById("windSpeed"),
    document.getElementById("detailHumidity"),
    document.getElementById("pressure"),
    document.getElementById("visibility"),
    document.getElementById("sunrise"),
    document.getElementById("sunset"),
    document.getElementById("forecastList"),
    document.getElementById("weeklyForecast"),
    document.getElementById("rainList")
  ];

  animatedElements.forEach((element) => {
    if (!element) {
      return;
    }

    element.classList.remove(
      "weather-data-updated"
    );

    void element.offsetWidth;

    element.classList.add(
      "weather-data-updated"
    );
  });
}

// ==============================
// Search History
// ==============================

function saveToHistory(city) {
  let history =
    JSON.parse(
      localStorage.getItem("weatherHistory")
    ) || [];

  history = history.filter(
    (historyCity) =>
      historyCity.toLowerCase() !== city.toLowerCase()
  );

  history.unshift(city);

  history = history.slice(0, 5);

  localStorage.setItem(
    "weatherHistory",
    JSON.stringify(history)
  );

  displayHistory();
}

function displayHistory() {
  const historyList =
    document.getElementById("historyList");

  const history =
    JSON.parse(
      localStorage.getItem("weatherHistory")
    ) || [];

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML =
      `<p class="empty-history">No recent searches</p>`;

    return;
  }

  history.forEach((city) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "history-button";
    button.textContent = city;

    button.addEventListener("click", () => {
      cityInput.value = city;
      getWeather(city);
    });

    historyList.appendChild(button);
  });
}

function clearHistory() {
  localStorage.removeItem("weatherHistory");
  displayHistory();
}

function toggleTemperatureUnit() {
  currentUnit =
    currentUnit === "C"
      ? "F"
      : "C";

  unitButton.textContent =
    `°${currentUnit}`;

  unitButton.classList.toggle(
    "unit-fahrenheit",
    currentUnit === "F"
  );

  if (
    latestCurrentData &&
    latestForecastData
  ) {
    updateWeatherUI(
      latestCurrentData
    );

    updateHourlyForecast(
      latestForecastData,
      latestCurrentData.timezone
    );
    updateWeeklyForecast(
  latestForecastData,
  latestCurrentData.timezone
);

    updateTemperatureChart(
      latestForecastData,
      latestCurrentData.timezone
    );

    animateWeatherData();
  }
}

function getCurrentLocationWeather() {
  clearError();

  if (!navigator.geolocation) {
    showError(
      "Geolocation is not supported by this browser."
    );

    return;
  }

  locationButton.disabled = true;

  locationButton.innerHTML =
    `<i class="fa-solid fa-spinner fa-spin"></i>`;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      await getWeatherByCoordinates(
        latitude,
        longitude
      );

      locationButton.disabled = false;

      locationButton.innerHTML =
        `<i class="fa-solid fa-location-crosshairs"></i>`;
    },

    (error) => {
      console.error(
        "Location error:",
        error
      );

      if (error.code === 1) {
        showError(
          "Location permission was denied."
        );
      } else {
        showError(
          "Unable to get your current location."
        );
      }

      locationButton.disabled = false;

      locationButton.innerHTML =
        `<i class="fa-solid fa-location-crosshairs"></i>`;
    }
  );
}
// ==============================
// Air Quality API
// ==============================

async function getAirQuality(latitude, longitude) {
  const airQualityUrl =
    `https://api.openweathermap.org/data/2.5/air_pollution` +
    `?lat=${latitude}` +
    `&lon=${longitude}` +
    `&appid=${apiKey}`;

  try {
    const response = await fetch(airQualityUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Unable to fetch air quality data."
      );
    }

    if (!data.list || data.list.length === 0) {
      throw new Error(
        "Air quality data is not available."
      );
    }

    return data;
  } catch (error) {
    /*
      AQI failure ko sirf console mein show karna hai.
      Error ko dobara throw nahi karna, warna weather,
      forecast aur chart bhi ruk jayenge.
    */
    console.warn("Air quality error:", error);

    return null;
  }
}


// ==============================
// AQI Information
// ==============================

function getAqiInformation(aqi) {
  const aqiStates = {
    1: {
      status: "Good",
      className: "aqi-state-good",
      message:
        "Air quality is good and outdoor activity is comfortable."
    },

    2: {
      status: "Fair",
      className: "aqi-state-fair",
      message:
        "Air quality is acceptable for most people."
    },

    3: {
      status: "Moderate",
      className: "aqi-state-moderate",
      message:
        "Sensitive people should limit prolonged outdoor activity."
    },

    4: {
      status: "Poor",
      className: "aqi-state-poor",
      message:
        "Consider reducing prolonged or intense outdoor activity."
    },

    5: {
      status: "Very Poor",
      className: "aqi-state-very-poor",
      message:
        "Avoid prolonged outdoor activity where possible."
    }
  };

  return (
    aqiStates[aqi] || {
      status: "Unavailable",
      className: "aqi-loading",
      message:
        "Air quality information is currently unavailable."
    }
  );
}


// ==============================
// Update Air Quality UI
// ==============================

function updateAirQualityUI(airQualityData) {
  const aqiValue =
    document.getElementById("aqiValue");

  const aqiStatus =
    document.getElementById("aqiStatus");

  const aqiDescription =
    document.getElementById("aqiDescription");

  const aqiBadge =
    document.getElementById("aqiBadge");

  const pm25 =
    document.getElementById("pm25");

  const pm10 =
    document.getElementById("pm10");

  const carbonMonoxide =
    document.getElementById("carbonMonoxide");

  const nitrogenDioxide =
    document.getElementById("nitrogenDioxide");

  /*
    Kisi HTML element ki ID missing ho to function ko
    safely stop karna hai, taa-ke baqi dashboard na toote.
  */
  if (
    !aqiValue ||
    !aqiStatus ||
    !aqiDescription ||
    !aqiBadge ||
    !pm25 ||
    !pm10 ||
    !carbonMonoxide ||
    !nitrogenDioxide
  ) {
    console.warn(
      "One or more Air Quality HTML elements were not found."
    );

    return;
  }

  const stateClasses = [
    "aqi-loading",
    "aqi-state-good",
    "aqi-state-fair",
    "aqi-state-moderate",
    "aqi-state-poor",
    "aqi-state-very-poor"
  ];

  /*
    API fail ya empty data ho to AQI card ko Loading
    par chhorne ke bajaye Unavailable dikhaya jayega.
  */
  if (
    !airQualityData ||
    !airQualityData.list ||
    airQualityData.list.length === 0
  ) {
    aqiValue.textContent = "--";
    aqiStatus.textContent = "Unavailable";

    aqiDescription.textContent =
      "Air quality information is currently unavailable.";

    pm25.textContent = "--";
    pm10.textContent = "--";
    carbonMonoxide.textContent = "--";
    nitrogenDioxide.textContent = "--";

    aqiBadge.classList.remove(...stateClasses);
    aqiBadge.classList.add("aqi-loading");
    aqiBadge.textContent = "Unavailable";

    resetAqiCircleState();

    return;
  }

  const airData = airQualityData.list[0];
  const aqi = airData.main.aqi;
  const components = airData.components;
  const aqiInformation = getAqiInformation(aqi);

  aqiValue.textContent = aqi;
  aqiStatus.textContent = aqiInformation.status;
  aqiDescription.textContent = aqiInformation.message;

  pm25.textContent =
    formatPollutantValue(components.pm2_5);

  pm10.textContent =
    formatPollutantValue(components.pm10);

  carbonMonoxide.textContent =
    formatPollutantValue(components.co);

  nitrogenDioxide.textContent =
    formatPollutantValue(components.no2);

  aqiBadge.classList.remove(...stateClasses);

  aqiBadge.classList.add(
    aqiInformation.className
  );

  aqiBadge.textContent =
    aqiInformation.status;

  updateAqiCircleState(
    aqiInformation.className
  );
}


// ==============================
// Format Pollutant Values
// ==============================

function formatPollutantValue(value) {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(Number(value))
  ) {
    return "--";
  }

  if (value >= 100) {
    return Math.round(value);
  }

  return Number(value).toFixed(1);
}


// ==============================
// AQI Circle State
// ==============================

function updateAqiCircleState(stateClass) {
  const aqiCircle =
    document.querySelector(".aqi-circle");

  if (!aqiCircle) {
    return;
  }

  const styles = {
    "aqi-state-good": {
      background:
        "radial-gradient(circle, rgba(47, 211, 130, 0.18), rgba(47, 211, 130, 0.035) 60%, transparent 62%)",

      borderColor:
        "rgba(47, 211, 130, 0.3)",

      shadow:
        "inset 0 0 35px rgba(47, 211, 130, 0.07), 0 18px 35px rgba(0, 0, 0, 0.18)"
    },

    "aqi-state-fair": {
      background:
        "radial-gradient(circle, rgba(180, 220, 70, 0.17), rgba(180, 220, 70, 0.03) 60%, transparent 62%)",

      borderColor:
        "rgba(180, 220, 70, 0.3)",

      shadow:
        "inset 0 0 35px rgba(180, 220, 70, 0.06), 0 18px 35px rgba(0, 0, 0, 0.18)"
    },

    "aqi-state-moderate": {
      background:
        "radial-gradient(circle, rgba(255, 179, 71, 0.18), rgba(255, 179, 71, 0.035) 60%, transparent 62%)",

      borderColor:
        "rgba(255, 179, 71, 0.3)",

      shadow:
        "inset 0 0 35px rgba(255, 179, 71, 0.07), 0 18px 35px rgba(0, 0, 0, 0.18)"
    },

    "aqi-state-poor": {
      background:
        "radial-gradient(circle, rgba(255, 112, 72, 0.2), rgba(255, 112, 72, 0.04) 60%, transparent 62%)",

      borderColor:
        "rgba(255, 112, 72, 0.34)",

      shadow:
        "inset 0 0 35px rgba(255, 112, 72, 0.08), 0 18px 35px rgba(0, 0, 0, 0.18)"
    },

    "aqi-state-very-poor": {
      background:
        "radial-gradient(circle, rgba(255, 72, 105, 0.2), rgba(255, 72, 105, 0.04) 60%, transparent 62%)",

      borderColor:
        "rgba(255, 72, 105, 0.35)",

      shadow:
        "inset 0 0 35px rgba(255, 72, 105, 0.08), 0 18px 35px rgba(0, 0, 0, 0.18)"
    }
  };

  const selectedStyle = styles[stateClass];

  if (!selectedStyle) {
    resetAqiCircleState();
    return;
  }

  aqiCircle.style.background =
    selectedStyle.background;

  aqiCircle.style.borderColor =
    selectedStyle.borderColor;

  aqiCircle.style.boxShadow =
    selectedStyle.shadow;
}


function resetAqiCircleState() {
  const aqiCircle =
    document.querySelector(".aqi-circle");

  if (!aqiCircle) {
    return;
  }

  aqiCircle.style.background = "";
  aqiCircle.style.borderColor = "";
  aqiCircle.style.boxShadow = "";
}

// ==============================
// Reverse Geocoding
// ==============================

async function getLocationName(latitude, longitude) {
  const url =
    `https://api.openweathermap.org/geo/1.0/reverse` +
    `?lat=${latitude}` +
    `&lon=${longitude}` +
    `&limit=1` +
    `&appid=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.warn("Reverse geocoding error:", error);
    return null;
  }
}
// ==============================
// Weather By Coordinates
// ==============================

async function getWeatherByCoordinates(
  latitude,
  longitude
) {
  clearError();
  setLoading(true);

  const currentWeatherUrl =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${latitude}` +
    `&lon=${longitude}` +
    `&units=metric` +
    `&appid=${apiKey}`;

  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${latitude}` +
    `&lon=${longitude}` +
    `&units=metric` +
    `&appid=${apiKey}`;

  try {
    const responses = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    const locationData =
  await getLocationName(
    latitude,
    longitude
  );

    const currentResponse = responses[0];
    const forecastResponse = responses[1];

    const currentData =
      await currentResponse.json();

    const forecastData =
      await forecastResponse.json();

    if (!currentResponse.ok) {
      throw new Error(
        currentData.message ||
        "Unable to fetch your location weather."
      );
    }

    if (!forecastResponse.ok) {
      throw new Error(
        forecastData.message ||
        "Unable to fetch location forecast."
      );
    }

if (locationData && locationData.name) {
  currentData.name = locationData.name;

  if (locationData.country) {
    currentData.sys.country =
      locationData.country;
  }
}

latestCurrentData = currentData;
latestForecastData = forecastData;

    /*
      AQI request safe hai. getAirQuality() error par
      null return karega, weather request ko fail nahi karega.
    */
    const airQualityData =
      await getAirQuality(
        currentData.coord.lat,
        currentData.coord.lon
      );

    latestAirQualityData = airQualityData;

    updateWeatherUI(currentData);

    updateHourlyForecast(
      forecastData,
      currentData.timezone
    );

    updateWeeklyForecast(
  forecastData,
  currentData.timezone
);

    updateTemperatureChart(
      forecastData,
      currentData.timezone
    );

    updateRainChance(
      forecastData,
      currentData.timezone
    );

    updateAirQualityUI(airQualityData);

    animateWeatherData();

    saveToHistory(currentData.name);

    cityInput.value = "";
  } catch (error) {
    console.error(
      "Location weather error:",
      error
    );

    showError(error.message);
  } finally {
    setLoading(false);
  }
}
// ==============================
// Events
// ==============================

searchButton.addEventListener("click", () => {
  getWeather();
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});

cityInput.addEventListener("input", clearError);

cityInput.addEventListener("focus", () => {
  cityInput.parentElement.classList.add(
    "search-active"
  );
});

cityInput.addEventListener("blur", () => {
  cityInput.parentElement.classList.remove(
    "search-active"
  );
});

clearHistoryButton.addEventListener(
  "click",
  clearHistory
);

// Page load
window.addEventListener("DOMContentLoaded", () => {
  displayHistory();

  // Default city on first load
  cityInput.value = "Lahore";
  getWeather();
});

searchButton.addEventListener("click", () => {
  getWeather();
});
unitButton.addEventListener(
  "click",
  toggleTemperatureUnit
);

locationButton.addEventListener(
  "click",
  getCurrentLocationWeather
);

