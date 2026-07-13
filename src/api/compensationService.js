import { queryCompensationGraph, queryAirlineNode, buildDecisionTrail } from './graphQueries'

// ── Fallback rules used when Neo4j is unavailable ──
const FALLBACK_RULES = {
  delay_3_5: {
    rule: {
      id: 'rule_delay_3_5',
      eligible: true,
      compensationType: 'meal_voucher',
      description: 'Passenger entitled to meal/refreshment voucher under DGCA CAR Section 3',
      estimatedAmount: 0,
      estimatedAmountNote: 'Meal voucher (per airline policy)',
      requiredAction: 'Request voucher at airline counter immediately',
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV',
    },
    documents: [
      { id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1 },
      { id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1 },
      { id: 'govt_id', name: 'Government ID', description: 'Aadhaar, Passport, or Voter ID', priority: 1 },
    ],
  },
  delay_5_8: {
    rule: {
      id: 'rule_delay_5_8',
      eligible: true,
      compensationType: 'cash_compensation',
      description: 'Passenger entitled to ₹2,000 cash compensation under DGCA 2025 rules',
      estimatedAmount: 2000,
      estimatedAmountNote: '₹2,000 per passenger (DGCA 2025)',
      requiredAction: 'File compensation claim with airline within 30 days',
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV (2025 Update)',
    },
    documents: [
      { id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1 },
      { id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1 },
      { id: 'govt_id', name: 'Government ID', description: 'Aadhaar, Passport, or Voter ID', priority: 1 },
      { id: 'delay_certificate', name: 'Delay Certificate', description: 'Official delay certificate from airline', priority: 2 },
      { id: 'bank_details', name: 'Bank Details', description: 'Account number and IFSC for compensation transfer', priority: 2 },
    ],
  },
  delay_8_plus: {
    rule: {
      id: 'rule_delay_8_plus',
      eligible: true,
      compensationType: 'cash_and_hotel',
      description: 'Passenger entitled to ₹5,000 compensation plus hotel accommodation under DGCA 2025 rules',
      estimatedAmount: 5000,
      estimatedAmountNote: '₹5,000 per passenger + hotel stay (DGCA 2025)',
      requiredAction: 'Request hotel accommodation and file compensation claim',
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV (2025 Update)',
    },
    documents: [
      { id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1 },
      { id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1 },
      { id: 'govt_id', name: 'Government ID', description: 'Aadhaar, Passport, or Voter ID', priority: 1 },
      { id: 'delay_certificate', name: 'Delay Certificate', description: 'Official delay certificate from airline', priority: 2 },
      { id: 'bank_details', name: 'Bank Details', description: 'Account number and IFSC for compensation transfer', priority: 2 },
    ],
  },
  cancellation: {
    rule: {
      id: 'rule_cancellation',
      eligible: true,
      compensationType: 'full_refund_plus_compensation',
      description: 'Full refund entitled. Additional compensation if less than 2 weeks notice given',
      estimatedAmount: 5000,
      estimatedAmountNote: 'Full ticket refund + up to ₹5,000 depending on notice period',
      requiredAction: 'Choose alternative flight or full refund. File compensation claim if < 2 weeks notice',
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV (2025 Update)',
    },
    documents: [
      { id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1 },
      { id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1 },
      { id: 'govt_id', name: 'Government ID', description: 'Aadhaar, Passport, or Voter ID', priority: 1 },
      { id: 'delay_certificate', name: 'Delay Certificate', description: 'Official delay certificate from airline', priority: 2 },
      { id: 'bank_details', name: 'Bank Details', description: 'Account number and IFSC for compensation transfer', priority: 2 },
    ],
  },
  denied_boarding: {
    rule: {
      id: 'rule_denied_boarding',
      eligible: true,
      compensationType: 'cash_compensation',
      description: 'Passenger involuntarily denied boarding entitled to 400% of one-way base fare under DGCA rules',
      estimatedAmount: 5000,
      estimatedAmountNote: '400% of one-way base fare, minimum ₹5,000, maximum ₹20,000',
      requiredAction: 'Demand written explanation and file compensation claim immediately',
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV',
    },
    documents: [
      { id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1 },
      { id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1 },
      { id: 'govt_id', name: 'Government ID', description: 'Aadhaar, Passport, or Voter ID', priority: 1 },
      { id: 'bank_details', name: 'Bank Details', description: 'Account number and IFSC for compensation transfer', priority: 2 },
    ],
  },
  extraordinary: {
    rule: {
      id: 'rule_weather_not_eligible',
      eligible: false,
      compensationType: 'none',
      description: 'Weather, ATC, or security disruptions are extraordinary circumstances. Airlines not liable for compensation',
      estimatedAmount: 0,
      estimatedAmountNote: 'No cash compensation applicable',
      requiredAction: 'Request full refund or rebooking. No compensation claim applicable',
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV',
    },
    documents: [
      { id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1 },
      { id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1 },
    ],
  },
}

const FALLBACK_AIRSEWA = {
  name: 'AirSewa',
  website: 'https://airsewa.gov.in',
  description: 'DGCA official passenger grievance portal',
  timeline: '30–60 days for resolution',
  process: 'Submit complaint online with supporting documents',
}

const FALLBACK_AIRLINES = {
  indigo: { name: 'IndiGo', code: '6E', claimEmail: 'customercare@goindigo.in', claimUrl: 'https://www.goindigo.in' },
  air_india: { name: 'Air India', code: 'AI', claimEmail: 'customer.relations@airindia.in', claimUrl: 'https://www.airindia.com' },
  spicejet: { name: 'SpiceJet', code: 'SG', claimEmail: 'feedback@spicejet.com', claimUrl: 'https://www.spicejet.com' },
  vistara: { name: 'Vistara', code: 'UK', claimEmail: 'customer.care@airvistara.com', claimUrl: 'https://www.airvistara.com' },
  akasa: { name: 'Akasa Air', code: 'QP', claimEmail: 'hello@akasaair.com', claimUrl: 'https://www.akasaair.com' },
}

/**
 * Maps disruption form inputs to a DisruptionType node ID.
 */
export function resolveDisruptionId(type, delayRange, cause) {
  const isExtraordinary = ['weather', 'atc', 'security'].includes(cause)
  if (isExtraordinary) return 'extraordinary'
  if (type === 'delay') return `delay_${delayRange.replace('-', '_')}`
  return type
}

/**
 * Main compensation analysis function.
 * Tries Neo4j graph traversal first; falls back to local rules if unavailable.
 *
 * @param {object} flightDetails
 * @param {object} disruptionDetails
 * @returns {Promise<{rule, documents, airsewa, decisionTrail, airlineInfo, source}>}
 */
export async function analyzeCompensation(flightDetails, disruptionDetails) {
  const { type, delayRange, cause } = disruptionDetails
  const disruptionId = resolveDisruptionId(type, delayRange, cause)
  const isExtraordinary = disruptionId === 'extraordinary'

  let result = null
  let source = 'neo4j'

  // 1. Try graph traversal
  try {
    result = await queryCompensationGraph(disruptionId, cause)
    if (!result) throw new Error('No graph result')
  } catch (err) {
    console.warn('[Compensation] Neo4j unavailable, using fallback rules:', err.message)
    source = 'fallback'
    const fallback = FALLBACK_RULES[disruptionId] || FALLBACK_RULES.extraordinary
    result = { ...fallback, airsewa: FALLBACK_AIRSEWA }
  }

  // 2. Ensure airsewa is present
  if (!result.airsewa) {
    result.airsewa = FALLBACK_AIRSEWA
  }

  // 3. Get airline info
  let airlineInfo = null
  try {
    airlineInfo = await queryAirlineNode(flightDetails.airlineId)
  } catch {
    airlineInfo = FALLBACK_AIRLINES[flightDetails.airlineId] || null
  }
  if (!airlineInfo) {
    airlineInfo = FALLBACK_AIRLINES[flightDetails.airlineId] || { name: flightDetails.airline, code: '', claimEmail: '', claimUrl: '' }
  }

  // 4. Build decision trail
  const decisionTrail = buildDecisionTrail(disruptionId, cause, result.rule, result.disruption)

  return {
    ...result,
    decisionTrail,
    airlineInfo,
    source,
    disruptionId,
    isExtraordinary,
  }
}
