const API_KEY = '3fa916b42bfce07d8483560a882561ad';

const citySearch = document.getElementById('city');
const searchBtn = document.getElementById('search-btn');
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');
const box3 = document.getElementById('box3');
const box4 = document.getElementById('box4');
const box5 = document.getElementById('box5'); 

let map;
let marker; 

map = L.map(box3).setView([20.5937, 78.9629], 5); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

const customIcons = {
    '01d': 'icons/clear-day.png',
    '01n': 'icons/clear-night.png',
    '02d': 'icons/few-clouds-day.png',
    '02n': 'icons/few-clouds-night.png',
    '03d': 'icons/scattered-clouds-day.png',
    '03n': 'icons/scattered-cloud-night.png',
    '04d': 'icons/broken-clouds.png',
    '04n': 'icons/broken-clouds.png',
    '09d': 'icons/sun-shower.png',
    '09n': 'icons/night-shower.png',
    '10d': 'icons/rain.png',
    '10n': 'icons/rain.png',
    '11d': 'icons/thunderstorm.png',
    '11n': 'icons/thunderstorm.png',
    '13d': 'icons/snow.png',
    '13n': 'icons/snow.png',
    '50d': 'icons/mist-day.png',
    '50n': 'icons/mist-night.png',
};

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setMarker(lat, lon); 
                fetchWeatherByCoordinates(lat, lon);
                map.setView([lat, lon], 13); 
            },
            () => {
                alert("Unable to retrieve your location.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function setMarker(lat, lon) {
    if (marker) {
        marker.setLatLng([lat, lon]);
    } else {
        marker = L.marker([lat, lon]).addTo(map); 
    }
    map.setView([lat, lon], 14); 
}

async function fetchWeatherData(cityName) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (response.ok) {
            displayWeather(data);
            setMarker(data.coord.lat, data.coord.lon); 
            fetchHourlyAndDailyForecast(data.coord.lat, data.coord.lon); 
            fetchAirQualityAndMoonPhase(data.coord.lat, data.coord.lon);
        } else {

          window.location.href='error.html'
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        window.location.href='error.html'

    }
}

async function fetchAirQualityAndMoonPhase(lat, lon) {
    try {
        const aqiResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const aqiData = await aqiResponse.json();
        const aqi = aqiData.list[0].main.aqi;
        const aqiDescription = getAQIDescription(aqi);
        const moonPhase = getMoonPhase();

        box2.innerHTML = `
            <h3>Air Quality & Moon Phase</h3>
            <div class="air-quality-grid">
                <div class="air-quality-item"><p><strong>Air Quality Index:</strong> ${aqi} /5</p></div>
                <div class="air-quality-item"><p><strong>Condition:</strong> ${aqiDescription}</p></div>
                <div class="air-quality-item"><p><strong>Moon Phase:</strong> ${moonPhase}</p></div>
            </div>
        `;
    } catch (error) {
        box2.innerHTML = '<p>Error fetching air quality data.</p>';
    }
}

function getAQIDescription(aqi) {
    if (aqi === 1) return 'Good 🟢';
    if (aqi === 2) return 'Fair 🟡';
    if (aqi === 3) return 'Moderate 🟠';
    if (aqi === 4) return 'Poor 🔴';
    return 'Very Poor ⚫';
}

function getMoonPhase() {
    const date = new Date();
    const lp = 2551443; 
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
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (response.ok) {
            displayWeather(data);
            setMarker(lat, lon); 
            fetchHourlyAndDailyForecast(lat, lon);
            fetchAirQualityAndMoonPhase(lat, lon); 
            citySearch.value = data.name; 
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
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
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

function displayWeather(data) {
    const iconCode = data.weather[0].icon;
    const customIcon = customIcons[iconCode] || 'icons/default.png'; 

    box1.innerHTML = `
        <h3>${data.name}</h3>
        <br><br>
        <p><b>Temperature:</b> ${data.main.temp}°C</p>
        <br><br>
        <p><b>Condition:</b> ${data.weather[0].description}</p>
        <br><br>
        <p><b>Humidity:</b> ${data.main.humidity}%</p>
        <br><br>
        <img src="${customIcon}" alt="Weather Icon" height="80px">
    `;
}

function displayHourlyForecast(data) {
    box4.innerHTML = '<h3>Hourly Forecast:</h3>';
    const hourlyContainer = document.createElement('div');
    hourlyContainer.className = 'hourly-forecast';

    data.list.slice(0, 8).forEach(hourData => {
        const date = new Date(hourData.dt * 1000);
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const iconCode = hourData.weather[0].icon;
        const customIcon = customIcons[iconCode] || 'assets/icons/default.png';

        const forecastBlock = `
            <div>
            <br>
                <p>${formattedTime}</p>
                <p>${hourData.main.temp}°C</p>
                <img src="${customIcon}" alt="Weather Icon">
            </div>
        `;
        hourlyContainer.innerHTML += forecastBlock;
    });
    box4.appendChild(hourlyContainer);
}

function displayDailyForecast(data) {
    box5.innerHTML = '<h3>Weekly Forecast</h3>';
    const dailyContainer = document.createElement('div');
    dailyContainer.className = 'forecast-grid';

    let dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const key = date.toLocaleDateString();
        if (!dailyData[key]) {
            dailyData[key] = { temp: [], icon: '' };
        }
        dailyData[key].temp.push(item.main.temp);
        dailyData[key].icon = item.weather[0].icon;
    });

    Object.keys(dailyData).slice(0, 8).forEach(day => {
        const avgTemp = dailyData[day].temp.reduce((a, b) => a + b) / dailyData[day].temp.length;
        const customIcon = customIcons[dailyData[day].icon] || 'assets/icons/default.png';

        dailyContainer.innerHTML += `
            <div class="daily-card">
                <p>${day}</p>
                <p>${avgTemp.toFixed(1)}°C</p>
                <img src="${customIcon}" alt="Weather Icon">
            </div>
        `;
    });

    box5.appendChild(dailyContainer);
}

searchBtn.addEventListener('click', () => {
    const cityName = citySearch.value.trim();
    if (cityName) {
        fetchWeatherData(cityName);
    } else {
        box1.innerHTML = '<p>Please enter a city name.</p>';
    }
});

citySearch.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const cityName = citySearch.value.trim();
        if (cityName) {
            fetchWeatherData(cityName);
        } else {
            box1.innerHTML = '<p>Please enter a city name.</p>';
        }
    }
});

map.on('click', async function (e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;
    fetchWeatherByCoordinates(lat, lon);
});

getCurrentLocation();
