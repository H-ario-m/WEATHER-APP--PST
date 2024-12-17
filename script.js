const API_KEY = '3fa916b42bfce07d8483560a882561ad';

const citySearch = document.getElementById('city');
const searchBtn = document.getElementById('search-btn');
const box1 = document.getElementById('box1'); 
const box2 = document.getElementById('box2'); 
const box3 = document.getElementById('box3'); 
const box4 = document.getElementById('box4'); 
const box5 = document.getElementById('box5'); 
const mapDiv = document.createElement('div'); 

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
            fetchHourlyAndDailyForecast(data.coord.lat, data.coord.lon);
            fetchAirQualityAndMoonPhase(data.coord.lat, data.coord.lon); 
        } else {
            throw new Error(data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        box1.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
    }
}

async function fetchHourlyAndDailyForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok) {
            displayHourlyForecast(data);
            displayDailyForecast(data);
        } else {
            throw new Error(data.message || 'Failed to fetch forecast data');
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        box4.innerHTML = '<p>Error fetching forecast data. Please try again.</p>';
        box5.innerHTML = '<p>Error fetching daily forecast. Please try again.</p>';
    }
}

async function fetchAirQualityAndMoonPhase(lat, lon) {
    try {
     
        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiResponse.json();

        const aqi = aqiData.list[0].main.aqi;
        const aqiDescription = getAQIDescription(aqi);

     
        const moonPhase = getMoonPhase();

        box2.innerHTML = `
            <h3>Air Quality & Moon Phase</h3>
            <p><strong>Air Quality Index:</strong> ${aqi}</p>
            <p><strong>Condition:</strong> ${aqiDescription}</p>
            <p><strong>Moon Phase:</strong> ${moonPhase}</p>
        `;
    } catch (error) {
        console.error('Error fetching AQI or Moon Phase:', error);
        box2.innerHTML = '<p>Error fetching air quality or moon phase data.</p>';
    }
}

function getAQIDescription(aqi) {
    if (aqi === 1) return 'Good 🟢';
    if (aqi === 2) return 'Fair 🟡';
    if (aqi === 3) return 'Moderate 🟠';
    if (aqi === 4) return 'Poor 🔴';
    if (aqi === 5) return 'Very Poor ⚫';
    return 'Unknown';
}

function getMoonPhase() {
    const date = new Date();
    const lp = 2551443; // Lunar cycle in seconds
    const newMoon = new Date(1970, 0, 7, 20, 35, 0);
    const phase = (((date.getTime() - newMoon.getTime()) / 1000) % lp) / lp;

    if (phase < 0.03 || phase > 0.97) return 'New Moon 🌑';
    if (phase < 0.25) return 'Waxing Crescent 🌒';
    if (phase < 0.50) return 'First Quarter 🌓';
    if (phase < 0.75) return 'Waxing Gibbous 🌔';
    return 'Full Moon 🌕';
}

async function fetchWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (response.ok) {
            displayWeather(data);
            fetchHourlyAndDailyForecast(lat, lon); 
            fetchAirQualityAndMoonPhase(lat, lon); 
        } else {
            throw new Error(data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        box1.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
    }
}

function displayWeather(data) {
    box1.innerHTML = `
        <h2>${data.name}</h2>
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
            <br>
                <p>${formattedTime}</p>
                <p>${hourData.main.temp}°C</p>
                <img src="https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png" alt="Weather Icon">
            </div>
        `;
        hourlyContainer.innerHTML += forecastBlock;
    });
    box4.appendChild(hourlyContainer);
}

function displayDailyForecast(data) {
    box5.innerHTML = '<h3>8-Day Forecast:</h3>';
    let dailyHTML = '';
    let dailyData = [];
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const key = `${month} ${day}`;

        if (!dailyData[key]) {
            dailyData[key] = {
                date: `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
                temps: [],
                icons: [],
            };
        }
        dailyData[key].temps.push(item.main.temp);
        dailyData[key].icons.push(item.weather[0].icon);
    });

    for (const key in dailyData) {
        const avgTemp = dailyData[key].temps.reduce((sum, temp) => sum + temp, 0) / dailyData[key].temps.length;
        const icon = dailyData[key].icons[0]; 
        dailyHTML += `
            <div>
                <p>${dailyData[key].date}</p>
                <p>Avg Temp: ${avgTemp.toFixed(1)}°C</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
            </div>
        `;
    }
    box5.innerHTML += dailyHTML;
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
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    fetchWeatherByCoordinates(lat, lon);
});