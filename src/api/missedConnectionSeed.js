import { runQuery } from './neo4j'

/**
 * Seeds the Neo4j knowledge graph with airport transfer nodes and relationships.
 * Idempotent — uses MERGE so re-running is safe.
 *
 * Graph model:
 *   Airport -[:HAS_TRANSFER]-> TransferType
 *   TransferType -[:APPLIES_RULE]-> TransitRule
 */
export async function seedAirportGraph() {
  console.log('[MCP Seed] Seeding airport transfer graph...')

  // ── Airport nodes (major Indian airports) ──
  await runQuery(`
    MERGE (a1:MCPAirport {code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', terminals: 3, hasAirside: true})
    MERGE (a2:MCPAirport {code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', terminals: 2, hasAirside: true})
    MERGE (a3:MCPAirport {code: 'BLR', name: 'Kempegowda International', city: 'Bengaluru', terminals: 2, hasAirside: false})
    MERGE (a4:MCPAirport {code: 'MAA', name: 'Chennai International', city: 'Chennai', terminals: 4, hasAirside: false})
    MERGE (a5:MCPAirport {code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', terminals: 1, hasAirside: false})
    MERGE (a6:MCPAirport {code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', terminals: 2, hasAirside: false})
    MERGE (a7:MCPAirport {code: 'COK', name: 'Cochin International', city: 'Kochi', terminals: 3, hasAirside: false})
    MERGE (a8:MCPAirport {code: 'GOI', name: 'Goa International', city: 'Goa', terminals: 2, hasAirside: false})
    MERGE (a9:MCPAirport {code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', terminals: 2, hasAirside: false})
    MERGE (a10:MCPAirport {code: 'PNQ', name: 'Pune International', city: 'Pune', terminals: 1, hasAirside: false})
  `)

  // ── TransitRule nodes ──
  await runQuery(`
    MERGE (r1:MCPTransitRule {id: 'walk_same_terminal', label: 'Same Terminal Walk', minMinutes: 8, maxMinutes: 15, description: 'Walking within same terminal to connecting gate'})
    MERGE (r2:MCPTransitRule {id: 'walk_diff_terminal', label: 'Different Terminal Transfer', minMinutes: 20, maxMinutes: 35, description: 'Transfer between terminals via bus or aerobridge'})
    MERGE (r3:MCPTransitRule {id: 'security_recheck', label: 'Security Screening', minMinutes: 10, maxMinutes: 22, description: 'Mandatory security screening at departure terminal'})
    MERGE (r4:MCPTransitRule {id: 'immigration_clearance', label: 'Immigration/Customs', minMinutes: 20, maxMinutes: 45, description: 'Immigration check for international arrivals'})
    MERGE (r5:MCPTransitRule {id: 'baggage_claim', label: 'Baggage Collection', minMinutes: 15, maxMinutes: 30, description: 'Waiting and collecting checked baggage at carousel'})
    MERGE (r6:MCPTransitRule {id: 'taxi_deplane', label: 'Aircraft Taxi & Deplaning', minMinutes: 8, maxMinutes: 18, description: 'Taxi to gate and deplaning time after landing'})
    MERGE (r7:MCPTransitRule {id: 'boarding_gate_buffer', label: 'Boarding Gate Buffer', minMinutes: 10, maxMinutes: 10, description: 'Minimum time needed at gate before boarding closes'})
  `)

  // ── TransferType nodes (connection type combinations) ──
  await runQuery(`
    MERGE (t1:MCPTransferType {id: 'dom_dom', label: 'Domestic → Domestic', requiresImmigration: false, requiresSecurityRecheck: false, description: 'Both flights domestic — no immigration, no security recheck if airside'})
    MERGE (t2:MCPTransferType {id: 'dom_intl', label: 'Domestic → International', requiresImmigration: false, requiresSecurityRecheck: true, description: 'Depart international — mandatory security screening at departure terminal'})
    MERGE (t3:MCPTransferType {id: 'intl_dom', label: 'International → Domestic', requiresImmigration: true, requiresSecurityRecheck: true, description: 'Arriving international — full immigration + security recheck'})
    MERGE (t4:MCPTransferType {id: 'intl_intl', label: 'International → International', requiresImmigration: false, requiresSecurityRecheck: true, description: 'Airside transit at most Indian airports — security recheck required'})
  `)

  // ── Airport-specific transfer profiles (Airport HAS_TRANSFER TransferType) ──
  // DEL has true airside for intl-intl (T3)
  await runQuery(`
    MATCH (a:MCPAirport {code: 'DEL'}), (t:MCPTransferType)
    MERGE (a)-[:HAS_TRANSFER]->(t)
  `)
  await runQuery(`
    MATCH (a:MCPAirport {code: 'BOM'}), (t:MCPTransferType)
    MERGE (a)-[:HAS_TRANSFER]->(t)
  `)
  await runQuery(`
    MATCH (a:MCPAirport), (t:MCPTransferType)
    WHERE a.code IN ['BLR','MAA','HYD','CCU','COK','GOI','AMD','PNQ']
    MERGE (a)-[:HAS_TRANSFER]->(t)
  `)

  // ── TransferType APPLIES_RULE TransitRule relationships ──
  // dom_dom: walk + taxi/deplane (no security, no immigration)
  await runQuery(`
    MATCH (t:MCPTransferType {id: 'dom_dom'}), (r1:MCPTransitRule {id: 'taxi_deplane'}), (r2:MCPTransitRule {id: 'walk_same_terminal'})
    MERGE (t)-[:APPLIES_RULE]->(r1)
    MERGE (t)-[:APPLIES_RULE]->(r2)
  `)
  // dom_intl: taxi + walk + security recheck
  await runQuery(`
    MATCH (t:MCPTransferType {id: 'dom_intl'}), (r1:MCPTransitRule {id: 'taxi_deplane'}), (r2:MCPTransitRule {id: 'walk_same_terminal'}), (r3:MCPTransitRule {id: 'security_recheck'})
    MERGE (t)-[:APPLIES_RULE]->(r1)
    MERGE (t)-[:APPLIES_RULE]->(r2)
    MERGE (t)-[:APPLIES_RULE]->(r3)
  `)
  // intl_dom: taxi + immigration + baggage + security recheck + walk
  await runQuery(`
    MATCH (t:MCPTransferType {id: 'intl_dom'}), (r1:MCPTransitRule {id: 'taxi_deplane'}), (r2:MCPTransitRule {id: 'immigration_clearance'}), (r3:MCPTransitRule {id: 'baggage_claim'}), (r4:MCPTransitRule {id: 'security_recheck'}), (r5:MCPTransitRule {id: 'walk_same_terminal'})
    MERGE (t)-[:APPLIES_RULE]->(r1)
    MERGE (t)-[:APPLIES_RULE]->(r2)
    MERGE (t)-[:APPLIES_RULE]->(r3)
    MERGE (t)-[:APPLIES_RULE]->(r4)
    MERGE (t)-[:APPLIES_RULE]->(r5)
  `)
  // intl_intl: taxi + security recheck + walk (airside transit, no immigration at DEL T3)
  await runQuery(`
    MATCH (t:MCPTransferType {id: 'intl_intl'}), (r1:MCPTransitRule {id: 'taxi_deplane'}), (r2:MCPTransitRule {id: 'security_recheck'}), (r3:MCPTransitRule {id: 'walk_same_terminal'})
    MERGE (t)-[:APPLIES_RULE]->(r1)
    MERGE (t)-[:APPLIES_RULE]->(r2)
    MERGE (t)-[:APPLIES_RULE]->(r3)
  `)

  console.log('[MCP Seed] Airport graph seeded successfully.')
}

export async function seedAirportGraphIfEmpty() {
  try {
    const records = await runQuery('MATCH (a:MCPAirport) RETURN count(a) AS c')
    const c = records[0]?.get('c')?.toNumber?.() ?? 0
    if (c === 0) {
      await seedAirportGraph()
    } else {
      console.log(`[MCP Seed] Already seeded (${c} airports). Skipping.`)
    }
  } catch (err) {
    console.warn('[MCP Seed] Failed to check/seed:', err.message)
    throw err
  }
}
