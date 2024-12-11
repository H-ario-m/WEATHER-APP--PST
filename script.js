function getWeather() {
  const apiKey = '3fa916b42bfce07d8483560a882561ad';
  const city = document.getElementById('city').value.trim();

  if (!city) {
    alert('Please enter a city');
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

 
  fetch(currentWeatherUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      displayWeather(data);
    })
    .catch((error) => {
      console.error('Error fetching current weather:', error);
      alert('Could not fetch current weather. Please check the city name.');
    });

  fetch(forecastUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      displayHourlyForecast(data.list);
    })
    .catch((error) => {
      console.error('Error fetching hourly forecast:', error);
      alert('Could not fetch hourly forecast. Please try again later.');
    });
}

function displayWeather(data) {
  const tempDiv = document.getElementById('temp-div');
  const weatherInfo = document.getElementById('weather-info');
  const weatherIcon = document.getElementById('weather-icon');

  const temperature = Math.round(data.main.temp);
  const weatherDescription = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  tempDiv.innerHTML = `<p>${temperature}°C</p>`;
  weatherInfo.textContent = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
  weatherIcon.src = iconUrl;
  weatherIcon.style.display = 'block';
}

function displayHourlyForecast(forecastList) {
  const hourlyForecastDiv = document.getElementById('hourly-forecast');
  hourlyForecastDiv.innerHTML = ''; 

  forecastList.slice(0, 8).forEach((forecast) => {
    const time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const temperature = Math.round(forecast.main.temp);
    const iconCode = forecast.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    const hourlyItem = document.createElement('div');
    hourlyItem.classList.add('hourly-item');

    hourlyItem.innerHTML = `
      <p>${time}</p>
      <img src="${iconUrl}" alt="${forecast.weather[0].description}">
      <p>${temperature}°C</p>
    `;

    hourlyForecastDiv.appendChild(hourlyItem);
  });
}
