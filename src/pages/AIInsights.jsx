import ModulePage from '../components/layout/ModulePage'
import { NAV_ITEMS } from '../config/navItems'

const item = NAV_ITEMS.find((n) => n.id === 'ai-insights')

const FEATURES = [
  'Flight delay probability',
  'AI explanation of delay causes',
  'Cancellation risk score',
  'Airline on-time performance summary',
  'Best alternative departure recommendations',
  'AI-generated travel summary',
]

const FUTURE_DEMO = {
  description: 'User selects a flight and receives:',
  points: [
    'Delay probability',
    'Cancellation risk',
    'AI explanation of why delays may occur',
    'Recommended travel alternatives',
    'Personalized travel summary',
  ],
}

export default function AIInsights() {
  return <ModulePage item={item} features={FEATURES} futureDemo={FUTURE_DEMO} />
}
