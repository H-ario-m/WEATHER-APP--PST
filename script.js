const API_KEY = '3fa916b42bfce07d8483560a882561ad';

const citySearch = document.getElementById('city');
const searchBtn = document.getElementById('search-btn');
const box1 = document.getElementById('box1'); 
const box3 = document.getElementById('box3'); 
const box4 = document.getElementById('box4'); 
const box5 = document.getElementById('forecast-grid'); 
const box2 = document.getElementById('box2'); 
let map;

map = L.map(box3).setView([20.5937, 78.9629], 5); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

async function fetchWeatherData(cityName) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok) {
            displayWeather(data);
            fetchForecastData(data.coord.lat, data.coord.lon);
            fetchAirQuality(data.coord.lat, data.coord.lon);
        } else {
            throw new Error(data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        box1.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
    }
}

async function fetchForecastData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok) {
            displayHourlyForecast(data);
            displayDailyForecast(data.list);
        } else {
            throw new Error(data.message || 'Failed to fetch forecast data');
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        box4.innerHTML = '<p>Error fetching forecast data. Please try again.</p>';
    }
}

async function fetchAirQuality(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await response.json();
        if (response.ok) {
            displayAirQuality(data);
        } else {
            throw new Error(data.message || 'Failed to fetch air quality data');
        }
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        box2.innerHTML = '<p>Error fetching air quality data. Please try again.</p>';
    }
}

function displayWeather(data) {
    box1.innerHTML = `
        <h3>${data.name}</h3>
        <br><br>
        <p><b>Temperature:</b> ${data.main.temp}°C</p>
        <br><br>
        <p><b>Condition:</b> ${data.weather[0].description}</p>
        <br><br>
        <p><b>Humidity:</b> ${data.main.humidity}%</p>
        <br><br>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
    `;
}

function displayHourlyForecast(data) {
    box4.innerHTML = '<h3>Hourly Forecast:</h3>';
    const hourlyContainer = document.createElement('div');
    hourlyContainer.className = 'hourly-forecast';

    data.list.slice(0, 8).forEach(hourData => {
        const date = new Date(hourData.dt * 1000);
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const forecastBlock = `
            <div>
                <p>${formattedTime}</p>
                <p>${hourData.main.temp}°C</p>
                <img src="https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png" alt="Weather Icon">
            </div>
        `;
        hourlyContainer.innerHTML += forecastBlock;
    });
    box4.appendChild(hourlyContainer);
}

function displayDailyForecast(forecastList) {
    box5.innerHTML = ' ';
    const dailyData = [];

    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });

        if (!dailyData.some(d => d.date === date)) {
            dailyData.push({
                date,
                temp: forecast.main.temp,
                icon: forecast.weather[0].icon,
            });
        }
    });

    dailyData.forEach(day => {
        const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
        const dailyCard = document.createElement('div');
        dailyCard.classList.add('daily-card');
        dailyCard.innerHTML = `
            <p>${day.date}</p>
            <img src="${iconUrl}" alt="Weather Icon">
            <p>${Math.round(day.temp)}°C</p>
        `;
        box5.appendChild(dailyCard);
    });
}

function displayAirQuality(data) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    const airQualityLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const airQualityText = airQualityLevels[aqi - 1] || "Unknown";

    box2.innerHTML = `
        <h3>Air Quality</h3>
       <p><strong>AQI:</strong> ${aqi} (${airQualityText})</p>
      <div class="air-quality-grid">
      <div class="air-quality-item"><p>PM2.5: ${components.pm2_5} µg/m³</strong></p></div>
      <div class="air-quality-item"><p>PM10: ${components.pm10} µg/m³</strong></p></div>
      <div class="air-quality-item"><p>CO: ${components.co} µg/m³</strong></p></div>
      <div class="air-quality-item"><p>NO₂: ${components.no2} µg/m³</strong></p></div>
    `;
}

searchBtn.addEventListener('click', () => {
    const cityName = citySearch.value.trim();
    if (cityName) {
        fetchWeatherData(cityName);
    } else {
        box1.innerHTML = '<p>Please enter a city name.</p>';
    }
});

map.on('click', async function (e) {
    const { lat, lng } = e.latlng;
    fetchWeatherDataByCoordinates(lat, lng);
});

async function fetchWeatherDataByCoordinates(lat, lon) {
    await fetchWeatherData(`${lat},${lon}`);
}
   