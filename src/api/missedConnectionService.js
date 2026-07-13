import { runQuery } from './neo4j'

// ── Fallback airport data (used when Neo4j unavailable) ──────────────────────
const FALLBACK_AIRPORTS = {
  DEL: { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', terminals: 3, hasAirside: true },
  BOM: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', terminals: 2, hasAirside: true },
  BLR: { code: 'BLR', name: 'Kempegowda International', city: 'Bengaluru', terminals: 2, hasAirside: false },
  MAA: { code: 'MAA', name: 'Chennai International', city: 'Chennai', terminals: 4, hasAirside: false },
  HYD: { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', terminals: 1, hasAirside: false },
  CCU: { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', terminals: 2, hasAirside: false },
  COK: { code: 'COK', name: 'Cochin International', city: 'Kochi', terminals: 3, hasAirside: false },
  GOI: { code: 'GOI', name: 'Goa International', city: 'Goa', terminals: 2, hasAirside: false },
  AMD: { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', terminals: 2, hasAirside: false },
  PNQ: { code: 'PNQ', name: 'Pune International', city: 'Pune', terminals: 1, hasAirside: false },
}

const FALLBACK_TRANSIT_RULES = {
  taxi_deplane:        { id: 'taxi_deplane',        label: 'Aircraft Taxi & Deplaning',    minMinutes: 8,  maxMinutes: 18 },
  walk_same_terminal:  { id: 'walk_same_terminal',  label: 'Same Terminal Walk',            minMinutes: 8,  maxMinutes: 15 },
  walk_diff_terminal:  { id: 'walk_diff_terminal',  label: 'Different Terminal Transfer',   minMinutes: 20, maxMinutes: 35 },
  security_recheck:    { id: 'security_recheck',    label: 'Security Screening',            minMinutes: 10, maxMinutes: 22 },
  immigration_clearance:{ id: 'immigration_clearance', label: 'Immigration/Customs',         minMinutes: 20, maxMinutes: 45 },
  baggage_claim:       { id: 'baggage_claim',       label: 'Baggage Collection',            minMinutes: 15, maxMinutes: 30 },
  boarding_gate_buffer:{ id: 'boarding_gate_buffer',label: 'Boarding Gate Buffer',          minMinutes: 10, maxMinutes: 10 },
}

const CONNECTION_RULES = {
  dom_dom:  { rules: ['taxi_deplane', 'walk_same_terminal'] },
  dom_intl: { rules: ['taxi_deplane', 'walk_same_terminal', 'security_recheck'] },
  intl_dom: { rules: ['taxi_deplane', 'immigration_clearance', 'baggage_claim', 'security_recheck', 'walk_same_terminal'] },
  intl_intl:{ rules: ['taxi_deplane', 'security_recheck', 'walk_same_terminal'] },
}

// ── Walking speed adjustments (minutes added to each rule) ──────────────────
const WALKING_ADJUSTMENTS = {
  slow:   { walk: +6, security: +4, total: +10 },
  normal: { walk:  0, security:  0, total:   0 },
  fast:   { walk: -3, security: -2, total:  -5 },
}

// ── Personal factor adjustments ──────────────────────────────────────────────
function getPersonalAdjustments(profile, diffTerminal) {
  const adjustments = []
  if (profile.seniorCitizen) {
    adjustments.push({ id: 'senior', icon: '👴', label: 'Senior Citizen', minutes: diffTerminal ? 8 : 5, reason: 'slower walking and terminal navigation' })
  }
  if (profile.firstVisit) {
    adjustments.push({ id: 'first', icon: '🗺', label: 'First Visit', minutes: 3, reason: 'airport navigation' })
  }
  if (profile.frequentTraveller) {
    adjustments.push({ id: 'freq', icon: '⭐', label: 'Frequent Traveller', minutes: -4, reason: 'familiarity with airport procedures' })
  }
  if (profile.withChildren) {
    adjustments.push({ id: 'kids', icon: '👨‍👧', label: 'Travelling with Children', minutes: 8, reason: 'slower walking and waiting time' })
  }
  if (profile.wheelchair) {
    adjustments.push({ id: 'wheelchair', icon: '♿', label: 'Mobility Assistance', minutes: 15, reason: 'assistance requirements and transfer time' })
  }
  return adjustments
}

// ── Different-terminal check ─────────────────────────────────────────────────
function isDifferentTerminal(connectionType, airportCode) {
  // Multi-terminal airports — assume different terminal if connection involves
  // a terminal switch (simplified model: intl/dom at same airport)
  const multiTerminal = { DEL: true, BOM: true, BLR: true, MAA: true, CCU: true, COK: true }
  if (!multiTerminal[airportCode]) return false
  return connectionType === 'dom_intl' || connectionType === 'intl_dom'
}

/**
 * Queries the Neo4j graph for transit rules for a given connection type and airport.
 * Falls back to local rules if Neo4j is unavailable.
 *
 * @param {string} connectionTypeId  e.g. 'dom_dom'
 * @param {string} airportCode       e.g. 'DEL'
 * @returns {Promise<{rules: object[], source: string}>}
 */
async function queryTransitRules(connectionTypeId, airportCode) {
  try {
    const records = await runQuery(`
      MATCH (a:MCPAirport {code: $airport})-[:HAS_TRANSFER]->(t:MCPTransferType {id: $connectionType})
      MATCH (t)-[:APPLIES_RULE]->(r:MCPTransitRule)
      RETURN r ORDER BY r.minMinutes ASC
    `, { airport: airportCode, connectionType: connectionTypeId })

    if (!records.length) throw new Error('No rules from graph')

    const rules = records.map(rec => {
      const r = rec.get('r').properties
      return {
        id: r.id,
        label: r.label,
        minMinutes: r.minMinutes?.toNumber?.() ?? r.minMinutes,
        maxMinutes: r.maxMinutes?.toNumber?.() ?? r.maxMinutes,
        description: r.description,
      }
    })

    return { rules, source: 'neo4j' }
  } catch (err) {
    console.warn('[MCP] Graph unavailable, using fallback rules:', err.message)
    const fallback = CONNECTION_RULES[connectionTypeId]?.rules || CONNECTION_RULES.dom_dom.rules
    const rules = fallback.map(id => FALLBACK_TRANSIT_RULES[id]).filter(Boolean)
    return { rules, source: 'fallback' }
  }
}

/**
 * Core connection risk engine.
 *
 * @param {object} params
 * @param {string} params.connectionTypeId   'dom_dom' | 'dom_intl' | 'intl_dom' | 'intl_intl'
 * @param {string} params.airportCode        Transit airport IATA code
 * @param {string} params.arrivalTime        'HH:MM' scheduled arrival
 * @param {string} params.boardingTime       'HH:MM' boarding opens
 * @param {string} params.departureTime      'HH:MM' departure
 * @param {string} params.walkingSpeed       'slow' | 'normal' | 'fast'
 * @param {object} params.passengerProfile   { hasBaggage, withChildren, ... }
 * @param {number} params.arrivalDelayMin    estimated delay in minutes (0 if on time)
 * @returns {Promise<ConnectionResult>}
 */
export async function predictConnection(params) {
  const {
    connectionTypeId,
    airportCode,
    arrivalTime,
    boardingTime,
    departureTime,
    walkingSpeed = 'normal',
    passengerProfile = {},
    arrivalDelayMin = 0,
  } = params

  // 1. Query transit rules from graph
  const { rules, source } = await queryTransitRules(connectionTypeId, airportCode)

  // 2. Check if different terminal needed
  const diffTerminal = isDifferentTerminal(connectionTypeId, airportCode)
  if (diffTerminal) {
    // Replace walk_same_terminal with walk_diff_terminal
    const idx = rules.findIndex(r => r.id === 'walk_same_terminal')
    if (idx !== -1) rules[idx] = FALLBACK_TRANSIT_RULES.walk_diff_terminal
  }

  // 3. Handle baggage collection
  const baggageRuleIdx = rules.findIndex(r => r.id === 'baggage_claim')
  const graphRequiresBaggage = baggageRuleIdx !== -1
  
  if (passengerProfile.hasBaggage) {
    if (!graphRequiresBaggage) {
      // Add baggage claim if they checked bags but it's not in the rules
      const idx = rules.findIndex(r => r.id === 'immigration_clearance')
      const insertAt = idx !== -1 ? idx + 1 : rules.length
      rules.splice(insertAt, 0, { ...FALLBACK_TRANSIT_RULES.baggage_claim, label: 'Baggage Collection (Checked baggage selected)' })
    } else {
      // It's in the rules, we just update the label
      rules[baggageRuleIdx].label = 'Baggage Collection (Checked baggage selected)'
    }
  } else {
    // If they do not have checked baggage, remove it from rules if it was there
    if (graphRequiresBaggage) {
      rules.splice(baggageRuleIdx, 1)
    }
  }

  // 4. Compute per-rule timings
  const walkAdj = WALKING_ADJUSTMENTS[walkingSpeed] || WALKING_ADJUSTMENTS.normal

  const ruleBreakdown = rules.map(rule => {
    let min = rule.minMinutes
    let max = rule.maxMinutes

    // Apply walking speed to walk and security rules
    if (rule.id === 'walk_same_terminal' || rule.id === 'walk_diff_terminal') {
      min = Math.max(3, min + walkAdj.walk)
      max = Math.max(5, max + walkAdj.walk)
    }
    if (rule.id === 'security_recheck') {
      min = Math.max(5, min + walkAdj.security)
      max = Math.max(8, max + walkAdj.security)
    }

    const estimate = Math.round((min + max) / 2)
    return { ...rule, estimatedMinutes: estimate, min, max }
  })

  // 5. Personal Adjustments
  const personalAdjustments = getPersonalAdjustments(passengerProfile, diffTerminal)
  const personalExtra = personalAdjustments.reduce((acc, adj) => acc + adj.minutes, 0)

  // 6. Total transit time
  const baseTransit = ruleBreakdown.reduce((acc, r) => acc + r.estimatedMinutes, 0)
  const passengerAdjustedTransit = baseTransit + personalExtra
  // Add boarding buffer
  const BOARDING_BUFFER = 10
  const totalTransitNeeded = passengerAdjustedTransit + BOARDING_BUFFER

  // 6. Parse times and compute available connection time
  const toMins = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
  }

  const arrivalMins = toMins(arrivalTime) + arrivalDelayMin
  const boardingMins = toMins(boardingTime)
  const departureMins = toMins(departureTime)
  const availableConnectionTime = boardingMins - arrivalMins

  // 7. Estimated arrival at gate
  const estimatedGateArrival = arrivalMins + passengerAdjustedTransit

  // 8. Timeline steps
  let cursor = arrivalMins
  const timeline = []

  timeline.push({ label: 'Flight Lands', time: cursor, icon: '✈', type: 'event' })

  for (const rule of ruleBreakdown) {
    const start = cursor
    cursor += rule.estimatedMinutes
    timeline.push({ label: rule.label, time: cursor, duration: rule.estimatedMinutes, icon: getTimelineIcon(rule.id), type: 'step', ruleId: rule.id })
  }

  if (personalExtra !== 0) {
    cursor += personalExtra
    timeline.push({ label: 'Personal Adjustments', time: cursor, duration: personalExtra, icon: '👤', type: 'step', ruleId: 'personal_adjustments' })
  }

  const gateArrivalTime = cursor
  // onTime is consistent with slack: uses totalTransitNeeded (buffer-inclusive)
  const onTime = (availableConnectionTime - totalTransitNeeded) >= 0

  timeline.push({
    label: 'Arrive at Gate',
    time: gateArrivalTime,
    icon: '🚶',
    type: 'arrival',
    onTime,
  })
  timeline.push({ label: 'Boarding Closes', time: boardingMins, icon: '🚪', type: 'deadline' })
  timeline.push({ label: 'Departure', time: departureMins, icon: '🛫', type: 'event' })

  // 9. Risk score calculation
  // slack = available window minus TOTAL transit needed (including boarding buffer)
  const slack = availableConnectionTime - totalTransitNeeded  // positive = have time, negative = missed
  let riskScore

  if (slack >= 20) riskScore = 10
  else if (slack >= 10) riskScore = 25
  else if (slack >= 0) riskScore = 55
  else if (slack >= -10) riskScore = 80
  else riskScore = 95

  // Additional risk modifiers
  if (diffTerminal) riskScore = Math.min(100, riskScore + 10)
  if (passengerProfile.hasBaggage && connectionTypeId.startsWith('intl')) riskScore = Math.min(100, riskScore + 8)
  if (walkingSpeed === 'slow') riskScore = Math.min(100, riskScore + 5)
  if (passengerProfile.wheelchair) riskScore = Math.min(100, riskScore + 8)
  if (passengerProfile.frequentTraveller) riskScore = Math.max(0, riskScore - 5)
  if (arrivalDelayMin > 15) riskScore = Math.min(100, riskScore + 15)
  if (arrivalDelayMin > 30) riskScore = Math.min(100, riskScore + 15)

  riskScore = Math.round(riskScore)

  const riskCategory = riskScore < 35 ? 'low' : riskScore < 65 ? 'moderate' : 'high'

  // 10. Risk factors explanation
  const riskFactors = buildRiskFactors({
    slack, diffTerminal, connectionTypeId, walkingSpeed,
    passengerProfile, arrivalDelayMin, ruleBreakdown, onTime, boardingMins, gateArrivalTime,
  })

  // 11. Smart recommendations
  const recommendations = buildRecommendations({ riskScore, riskCategory, slack, diffTerminal, walkingSpeed, passengerProfile, connectionTypeId, onTime })

  // 12. Explainability factors
  const explanationFactors = [
    { label: 'Walking Profile', value: capitalise(walkingSpeed) },
    { label: 'Connection Type', value: connectionTypeId.replace('_', ' → ').toUpperCase() },
    { label: 'Terminal Change', value: diffTerminal ? 'Yes' : 'No' },
    { label: 'Security Required', value: ruleBreakdown.some(r => r.id === 'security_recheck') ? 'Yes' : 'No' },
    { label: 'Immigration Required', value: ruleBreakdown.some(r => r.id === 'immigration_clearance') ? 'Yes' : 'No' },
  ]
  
  const baggageRule = ruleBreakdown.find(r => r.id === 'baggage_claim')
  if (baggageRule) explanationFactors.push({ label: 'Checked Baggage', value: `Yes (+${baggageRule.estimatedMinutes} min)` })

  if (passengerProfile.seniorCitizen) explanationFactors.push({ label: 'Senior Citizen', value: `Yes (+${diffTerminal ? 8 : 5} min)` })
  if (passengerProfile.firstVisit) explanationFactors.push({ label: 'First Visit', value: 'Yes (+3 min)' })
  if (passengerProfile.withChildren) explanationFactors.push({ label: 'With Children', value: 'Yes (+8 min)' })
  if (passengerProfile.wheelchair) explanationFactors.push({ label: 'Wheelchair', value: 'Yes (+15 min)' })
  if (passengerProfile.frequentTraveller) explanationFactors.push({ label: 'Frequent Traveller', value: 'Yes (-4 min)' })

  explanationFactors.push(
    { label: 'Available Time',   value: `${availableConnectionTime} min` },
    { label: 'Estimated Transit', value: `${totalTransitNeeded} min` },
    { label: 'Time Slack',        value: slack >= 0 ? `+${slack} min` : `${slack} min` },
    { label: 'Final Decision', value: riskCategory === 'low' ? 'Low Risk' : riskCategory === 'moderate' ? 'Moderate Risk' : 'High Risk' },
  )

  return {
    riskScore,
    riskCategory,
    onTime,
    slack,
    availableConnectionTime,
    totalTransitNeeded,
    passengerAdjustedTransit,
    ruleBreakdown,
    personalAdjustments,
    personalExtra,
    timeline,
    riskFactors,
    recommendations,
    explanationFactors,
    source,
    diffTerminal,
    passengerExtra: personalExtra,
    gateArrivalTime,
    boardingMins,
    arrivalMins,
  }
}

function getTimelineIcon(ruleId) {
  const icons = {
    taxi_deplane: '🛬',
    walk_same_terminal: '🚶',
    walk_diff_terminal: '🚌',
    security_recheck: '🔍',
    immigration_clearance: '🛂',
    baggage_claim: '🧳',
    boarding_gate_buffer: '🚪',
  }
  return icons[ruleId] || '→'
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function buildRiskFactors({ slack, diffTerminal, connectionTypeId, walkingSpeed, passengerProfile, arrivalDelayMin, ruleBreakdown, onTime, boardingMins, gateArrivalTime }) {
  const factors = []

  if (slack < 15) {
    if (slack >= 0) {
      factors.push({ icon: '⚠', text: `Tight connection — ${slack} min remaining`, risk: true })
    } else {
      factors.push({ icon: '🚫', text: `You are expected to arrive ${Math.abs(slack)} minutes after boarding closes`, risk: true })
    }
  } else {
    factors.push({ icon: '✓', text: `Comfortable connection time (+${slack} min remaining)`, risk: false })
  }

  if (diffTerminal) factors.push({ icon: '⚠', text: 'Terminal change required — adds 20–35 min', risk: true })
  else factors.push({ icon: '✓', text: 'Same terminal — no terminal transfer needed', risk: false })

  if (ruleBreakdown.some(r => r.id === 'immigration_clearance')) factors.push({ icon: '⚠', text: 'Immigration clearance required — 20–45 min', risk: true })
  if (ruleBreakdown.some(r => r.id === 'security_recheck')) factors.push({ icon: '⚠', text: 'Security screening required at departure terminal', risk: true })
  if (passengerProfile.hasBaggage) factors.push({ icon: '⚠', text: 'Checked baggage collection adds 15–30 min', risk: true })

  if (walkingSpeed === 'slow') factors.push({ icon: '⚠', text: 'Slow walking speed selected — +10 min penalty', risk: true })
  else if (walkingSpeed === 'fast') factors.push({ icon: '✓', text: 'Fast walking — saves ~5 min', risk: false })

  if (arrivalDelayMin > 0) factors.push({ icon: '⚠', text: `Arrival delay of ${arrivalDelayMin} min reduces connection time`, risk: true })

  if (!onTime) factors.push({ icon: '🚫', text: 'Estimated gate arrival is AFTER boarding closes', risk: true })
  else factors.push({ icon: '✓', text: 'Estimated gate arrival before boarding closes', risk: false })

  if (passengerProfile.frequentTraveller) factors.push({ icon: '✓', text: 'Frequent traveller — knows airport layout (-4 min)', risk: false })
  if (passengerProfile.withChildren) factors.push({ icon: '⚠', text: 'Travelling with children adds ~8 min', risk: true })
  if (passengerProfile.wheelchair) factors.push({ icon: '⚠', text: 'Mobility assistance required — request priority deplaning', risk: true })

  return factors
}

function buildRecommendations({ riskScore, riskCategory, slack, diffTerminal, walkingSpeed, passengerProfile, connectionTypeId, onTime }) {
  const recs = []

  if (riskCategory === 'high' || !onTime) {
    recs.push({ priority: 'critical', icon: '🔴', text: 'Consider rebooking your connecting flight now before landing.' })
    recs.push({ priority: 'critical', icon: '📢', text: 'Inform cabin crew you have a tight connection — request priority deplaning.' })
  }

  if (diffTerminal) {
    recs.push({ priority: 'high', icon: '🚌', text: 'Locate the inter-terminal transfer shuttle immediately after deplaning.' })
  }

  if (riskCategory !== 'low') {
    recs.push({ priority: 'high', icon: '🪑', text: 'Request a seat near the aircraft exit door when checking in.' })
    recs.push({ priority: 'high', icon: '🏃', text: 'Proceed directly to your connecting gate — skip shops, food, and lounges.' })
  }

  if (passengerProfile.seniorCitizen || passengerProfile.wheelchair) {
    recs.push({ priority: 'high', icon: '👴', text: 'Request an airport buggy or mobility assistance if available.' })
  }

  if (passengerProfile.firstVisit) {
    recs.push({ priority: 'medium', icon: '🗺', text: 'Follow airport wayfinding signs or seek assistance from airport staff.' })
  }

  if (passengerProfile.hasBaggage) {
    recs.push({ priority: 'medium', icon: '🧳', text: 'Proceed directly to the baggage carousel after landing.' })
  }

  if (passengerProfile.frequentTraveller) {
    recs.push({ priority: 'low', icon: '⭐', text: 'Use the fastest transfer route and proceed directly to security.' })
  }

  if (connectionTypeId === 'intl_dom' || connectionTypeId === 'intl_intl') {
    recs.push({ priority: 'medium', icon: '🛂', text: 'Have your passport and boarding pass ready before joining the immigration queue.' })
    recs.push({ priority: 'medium', icon: '🔍', text: 'Use fast-track security lanes if available (check your airline app).' })
  }

  if (walkingSpeed === 'slow' && !passengerProfile.seniorCitizen && !passengerProfile.wheelchair) {
    recs.push({ priority: 'medium', icon: '♿', text: 'Request an airport buggy or mobility cart from airline staff for faster transit.' })
  }

  if (riskCategory === 'low') {
    recs.push({ priority: 'low', icon: '✅', text: 'Your connection looks comfortable. Proceed normally.' })
    recs.push({ priority: 'low', icon: '📱', text: 'Download your connecting airline\'s app and verify gate assignment during transit.' })
  }

  if (!onTime) {
    recs.push({ priority: 'critical', icon: '📞', text: 'Contact airline ground staff on landing — they can assist with rebooking.' })
    recs.push({ priority: 'critical', icon: '⚖', text: 'If missed due to airline delay, you may be entitled to compensation.' })
  }

  return recs
}

const toTimeStr = (totalMins) => {
  const h = Math.floor(((totalMins % 1440) + 1440) % 1440 / 60)
  const m = ((totalMins % 1440) + 1440) % 1440 % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export { toTimeStr, FALLBACK_AIRPORTS }
