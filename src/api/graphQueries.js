import { runQuery } from './neo4j'

/**
 * Traverses the graph to find the compensation rule for a given disruption.
 *
 * Graph traversal:
 *   DisruptionType -[:GOVERNED_BY]-> CompensationRule
 *               -[:REQUIRES]-> Document
 *               -[:ESCALATES_TO]-> AirSewa
 *
 * @param {string} disruptionId - DisruptionType node id
 * @param {string} cause - 'airline'|'weather'|'atc'|'security'|'unknown'
 */
export async function queryCompensationGraph(disruptionId, cause) {
  const isExtraordinary = ['weather', 'atc', 'security'].includes(cause)
  
  // If extraordinary, fetch the not-eligible rule directly
  const ruleId = isExtraordinary ? 'rule_weather_not_eligible' : null

  const cypher = ruleId
    ? `
      MATCH (r:CompensationRule {id: $ruleId})
      OPTIONAL MATCH (r)-[:REQUIRES]->(doc:Document)
      OPTIONAL MATCH (r)-[:ESCALATES_TO]->(as:AirSewa)
      RETURN r, collect(DISTINCT doc) AS documents, as
    `
    : `
      MATCH (d:DisruptionType {id: $disruptionId})-[:GOVERNED_BY]->(r:CompensationRule)
      OPTIONAL MATCH (r)-[:REQUIRES]->(doc:Document)
      OPTIONAL MATCH (r)-[:ESCALATES_TO]->(as:AirSewa)
      RETURN d, r, collect(DISTINCT doc) AS documents, as
    `

  const params = ruleId ? { ruleId } : { disruptionId }
  const records = await runQuery(cypher, params)

  if (!records.length) return null

  const rec = records[0]
  const rule = rec.get('r').properties
  const docsNodes = rec.get('documents')
  const airsewaNode = rec.get('as')

  const documents = docsNodes
    .filter(Boolean)
    .map(n => n.properties)
    .sort((a, b) => a.priority - b.priority)

  const airsewa = airsewaNode ? airsewaNode.properties : null
  const disruption = rec.has('d') && rec.get('d') ? rec.get('d').properties : null

  return { rule, documents, airsewa, disruption }
}

/**
 * Fetches airline node properties from the graph.
 * @param {string} airlineId 
 */
export async function queryAirlineNode(airlineId) {
  const records = await runQuery(
    'MATCH (a:Airline {id: $airlineId}) RETURN a',
    { airlineId }
  )
  if (!records.length) return null
  return records[0].get('a').properties
}

/**
 * Builds the decision explanation trail by tracing graph edges.
 * Returns human-readable reasoning steps shown in the UI.
 */
export function buildDecisionTrail(disruptionId, cause, rule, disruption) {
  const steps = []
  const isExtraordinary = ['weather', 'atc', 'security'].includes(cause)

  if (disruption) {
    steps.push({ ok: true, text: `Disruption identified: ${disruption.label}` })
  } else {
    steps.push({ ok: true, text: 'Disruption type identified from provided details' })
  }

  if (isExtraordinary) {
    steps.push({ ok: false, text: `Cause: ${cause.toUpperCase()} is classified as an extraordinary circumstance` })
    steps.push({ ok: false, text: 'DGCA rules exempt airlines from compensation for extraordinary events' })
    steps.push({ ok: true, text: 'Refund or rebooking rights still apply' })
  } else {
    steps.push({ ok: true, text: 'Cause: Airline operations — extraordinary circumstance exemption does NOT apply' })
    steps.push({ ok: true, text: `Applicable rule found: ${rule.regulationRef}` })
    steps.push({ ok: true, text: `Compensation type: ${rule.compensationType.replace(/_/g, ' ')}` })
    if (rule.estimatedAmount > 0) {
      steps.push({ ok: true, text: `Estimated entitlement: ${rule.estimatedAmountNote}` })
    }
    steps.push({ ok: true, text: 'Passenger appears eligible for compensation' })
  }

  return steps
}
