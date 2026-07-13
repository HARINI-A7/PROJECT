export function generateTravelRecommendation(trafficCount, weather) {
  // Graceful handling for missing data
  if (trafficCount == null && !weather) {
    return {
      riskLevel: 'Unknown',
      recommendation: 'Live travel recommendation is temporarily unavailable.',
      arrivalTime: 'Check with airline',
      reason: 'Insufficient data available.',
      advisory: 'Weather and traffic data are currently unavailable.',
      statusColor: '#64748B',
      icon: '❓',
    }
  }

  // Determine Traffic Level
  let trafficCategory = 'Low'
  if (trafficCount > 150) trafficCategory = 'Heavy'
  else if (trafficCount > 60) trafficCategory = 'Moderate'

  // Classify Weather using case-insensitive keyword matching
  let weatherCategory = 'Moderate' // Default to Moderate for unknown
  let weatherCondition = weather?.condition?.toLowerCase() || ''

  if (!weatherCondition) {
    weatherCategory = 'Unknown'
  } else if (
    weatherCondition.includes('clear') ||
    weatherCondition.includes('sunny') ||
    weatherCondition.includes('partly cloudy') ||
    weatherCondition.includes('cloudy') ||
    weatherCondition.includes('overcast') ||
    weatherCondition.includes('few clouds') ||
    weatherCondition.includes('scattered clouds') ||
    weatherCondition.includes('broken clouds')
  ) {
    weatherCategory = 'Clear'
  } else if (
    weatherCondition.includes('thunderstorm') ||
    weatherCondition.includes('fog') ||
    weatherCondition.includes('mist') ||
    weatherCondition.includes('blizzard') ||
    weatherCondition.includes('snow') ||
    weatherCondition.includes('hail')
  ) {
    weatherCategory = 'Severe'
  } else if (
    weatherCondition.includes('drizzle') ||
    weatherCondition.includes('rain') ||
    weatherCondition.includes('shower') ||
    weatherCondition.includes('moderate rain') ||
    weatherCondition.includes('light rain') ||
    weatherCondition.includes('heavy rain')
  ) {
    weatherCategory = 'Moderate'
  }

  // Rule Evaluation Priority: Severe Weather > Heavy Traffic > Moderate Traffic > Low Traffic
  
  // Base default state
  let result = {
    riskLevel: 'Unknown',
    recommendation: 'Live travel recommendation is temporarily unavailable.',
    arrivalTime: '',
    reason: '',
    advisory: '',
    statusColor: '#64748B',
    icon: '❓',
  }

  // Severe Weather (Highest Priority)
  if (weatherCategory === 'Severe') {
    result = {
      riskLevel: '🔴 High Risk',
      recommendation: 'Severe weather detected. Expect travel disruptions.',
      arrivalTime: '3 hours before departure',
      reason: 'Severe weather or heavy congestion may cause delays to airport access and operations.',
      advisory: weatherCondition.includes('fog') || weatherCondition.includes('mist')
        ? 'Low visibility detected. Leave earlier and monitor your flight status.'
        : 'Thunderstorms detected. Expect travel disruptions and operational delays.',
      statusColor: '#F43F5E',
      icon: weather?.emoji || '🔴'
    }
  } 
  // Heavy Traffic
  else if (trafficCategory === 'Heavy') {
    result = {
      riskLevel: '🔴 High Risk',
      recommendation: 'Heavy airport traffic detected. Allow extra travel time.',
      arrivalTime: '3 hours before departure and check your flight status',
      reason: 'Severe weather or heavy congestion may cause delays to airport access and operations.',
      advisory: weatherCategory === 'Moderate' 
        ? 'Rainfall detected. Allow extra travel time due to possible traffic slowdowns and boarding delays.'
        : 'Weather conditions are favorable. No significant travel disruptions expected.',
      statusColor: '#F43F5E',
      icon: '🔴'
    }
  } 
  // Moderate Traffic or Moderate Weather
  else if (trafficCategory === 'Moderate' || weatherCategory === 'Moderate') {
    if (trafficCategory === 'Low' && weatherCategory === 'Moderate') {
      result = {
        riskLevel: '🟡 Moderate Risk',
        recommendation: 'Airport traffic is light, but rainfall or reduced visibility may increase travel time.',
        arrivalTime: '2 hours before departure',
        reason: 'Weather conditions or airport activity may increase travel time.',
        advisory: 'Rainfall detected. Allow extra travel time due to possible traffic slowdowns and boarding delays.',
        statusColor: '#F59E0B',
        icon: weather?.emoji || '🟡'
      }
    } else {
      result = {
        riskLevel: '🟡 Moderate Risk',
        recommendation: 'Moderate airport activity detected.',
        arrivalTime: '2 hours before departure',
        reason: 'Weather conditions or airport activity may increase travel time.',
        advisory: weatherCategory === 'Moderate'
          ? 'Rainfall detected. Allow extra travel time due to possible traffic slowdowns and boarding delays.'
          : 'Weather conditions are favorable. No significant travel disruptions expected.',
        statusColor: '#F59E0B',
        icon: trafficCategory === 'Moderate' ? '🟡' : weather?.emoji || '🟡'
      }
    }
  } 
  // Low Traffic & Clear Weather
  else {
    result = {
      riskLevel: '🟢 Low Risk',
      recommendation: 'Traffic is light and weather is clear.',
      arrivalTime: '90 minutes before departure',
      reason: 'Low airport congestion and favorable weather conditions.',
      advisory: 'Weather conditions are favorable. No significant travel disruptions expected.',
      statusColor: '#10B981',
      icon: weather?.emoji || '🟢'
    }
  }

  // Fallback for missing weather but we have traffic
  if (weatherCategory === 'Unknown' && result.riskLevel !== '🔴 High Risk') {
    result.advisory = 'Weather information is currently unavailable.'
  }

  return result
}
