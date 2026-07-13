// ── Open-Meteo API Service ─────────────────────────────────────
// Free API, no key required.

const WMO_CODES = {
  0: { label: 'Clear Sky', emoji: '☀️' },
  1: { label: 'Mainly Clear', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Depositing Rime Fog', emoji: '🌫️' },
  51: { label: 'Light Drizzle', emoji: '🌧️' },
  53: { label: 'Moderate Drizzle', emoji: '🌧️' },
  55: { label: 'Dense Drizzle', emoji: '🌧️' },
  61: { label: 'Slight Rain', emoji: '🌧️' },
  63: { label: 'Moderate Rain', emoji: '🌧️' },
  65: { label: 'Heavy Rain', emoji: '🌧️' },
  71: { label: 'Slight Snow Fall', emoji: '🌨️' },
  73: { label: 'Moderate Snow Fall', emoji: '🌨️' },
  75: { label: 'Heavy Snow Fall', emoji: '🌨️' },
  77: { label: 'Snow Grains', emoji: '🌨️' },
  80: { label: 'Slight Rain Showers', emoji: '🌦️' },
  81: { label: 'Moderate Rain Showers', emoji: '🌧️' },
  82: { label: 'Violent Rain Showers', emoji: '⛈️' },
  85: { label: 'Slight Snow Showers', emoji: '🌨️' },
  86: { label: 'Heavy Snow Showers', emoji: '🌨️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm with Hail', emoji: '⛈️' },
  99: { label: 'Heavy Thunderstorm with Hail', emoji: '⛈️' },
}

export async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Asia%2FKolkata`)
    if (!res.ok) throw new Error('WEATHER_API_ERROR')
    
    const data = await res.json()
    if (!data || !data.current) throw new Error('INVALID_WEATHER_DATA')

    const current = data.current
    const codeInfo = WMO_CODES[current.weather_code] || { label: 'Unknown', emoji: '❓' }

    return {
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      visibility: '10+ km', // OpenMeteo current endpoint doesn't return visibility natively without hourly array, we'll mock it based on code
      condition: codeInfo.label,
      emoji: codeInfo.emoji,
      code: current.weather_code,
    }
  } catch (err) {
    console.error('[Weather Service] Failed to fetch weather:', err)
    throw new Error('Weather information is currently unavailable.')
  }
}


