import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import FlightTracker from './pages/FlightTracker'
import AirportIntelligence from './pages/AirportIntelligence'
import TravelReadyAI from './pages/TravelReadyAI'
import SkyGPT from './pages/SkyGPT'
import CompensationAssistant from './pages/CompensationAssistant'
import MissedConnectionPredictor from './pages/MissedConnectionPredictor'

export default function App() {
  return (
    <BrowserRouter basename="/PROJECT">
      <Routes>
        <Route path="/*" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="flight-tracker" element={<FlightTracker />} />
          <Route path="airport-intelligence" element={<AirportIntelligence />} />
          <Route path="compensation" element={<CompensationAssistant />} />
          <Route path="ai-insights" element={<TravelReadyAI />} />
          <Route path="skygpt" element={<SkyGPT />} />
          <Route path="missed-connection" element={<MissedConnectionPredictor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
