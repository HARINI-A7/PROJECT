import { runQuery } from './neo4j'

/**
 * Seeds the Neo4j database with knowledge graph nodes and relationships
 * for the Compensation Assistant.
 *
 * Run order:
 * 1. DisruptionType nodes
 * 2. CompensationRule nodes  
 * 3. Document nodes
 * 4. Airline nodes
 * 5. AirSewa node
 * 6. Relationships between nodes
 *
 * Idempotent — uses MERGE so re-running is safe.
 */
export async function seedDatabase() {
  console.log('[Neo4j Seed] Starting database seed...')

  // ── DisruptionType nodes ──
  await runQuery(`
    MERGE (d1:DisruptionType {id: 'delay_3_5', label: 'Delay 3–5 Hours', category: 'delay', minHours: 3, maxHours: 5})
    MERGE (d2:DisruptionType {id: 'delay_5_8', label: 'Delay 5–8 Hours', category: 'delay', minHours: 5, maxHours: 8})
    MERGE (d3:DisruptionType {id: 'delay_8_plus', label: 'Delay 8+ Hours / Overnight', category: 'delay', minHours: 8, maxHours: 999})
    MERGE (d4:DisruptionType {id: 'cancellation', label: 'Flight Cancellation', category: 'cancellation', minHours: 0, maxHours: 0})
    MERGE (d5:DisruptionType {id: 'denied_boarding', label: 'Denied Boarding', category: 'denied_boarding', minHours: 0, maxHours: 0})
  `)

  // ── CompensationRule nodes ──
  await runQuery(`
    MERGE (r1:CompensationRule {
      id: 'rule_delay_3_5',
      eligibilityCondition: 'Airline-caused delay of 3 to 5 hours',
      compensationType: 'meal_voucher',
      description: 'Passenger entitled to meal/refreshment voucher under DGCA CAR Section 3, Series M, Part IV',
      estimatedAmount: 0,
      estimatedAmountNote: 'Meal voucher (value per airline policy, typically ₹200–500)',
      requiredAction: 'Request voucher at airline counter immediately',
      eligible: true,
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV'
    })
    MERGE (r2:CompensationRule {
      id: 'rule_delay_5_8',
      eligibilityCondition: 'Airline-caused delay of 5 to 8 hours',
      compensationType: 'cash_compensation',
      description: 'Passenger entitled to cash compensation of ₹2,000 under DGCA 2025 rules',
      estimatedAmount: 2000,
      estimatedAmountNote: '₹2,000 per passenger (DGCA 2025)',
      requiredAction: 'File compensation claim with airline within 30 days',
      eligible: true,
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV (2025 Update)'
    })
    MERGE (r3:CompensationRule {
      id: 'rule_delay_8_plus',
      eligibilityCondition: 'Airline-caused delay of 8+ hours or overnight',
      compensationType: 'cash_and_hotel',
      description: 'Passenger entitled to ₹5,000 compensation plus hotel accommodation under DGCA 2025 rules',
      estimatedAmount: 5000,
      estimatedAmountNote: '₹5,000 per passenger + hotel stay (DGCA 2025)',
      requiredAction: 'Request hotel accommodation from airline and file compensation claim',
      eligible: true,
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV (2025 Update)'
    })
    MERGE (r4:CompensationRule {
      id: 'rule_cancellation',
      eligibilityCondition: 'Flight cancelled by airline with less than 2 weeks notice',
      compensationType: 'full_refund_plus_compensation',
      description: 'Full refund entitled. If cancelled <2 weeks notice, additional compensation applies',
      estimatedAmount: 5000,
      estimatedAmountNote: 'Full ticket refund + up to ₹5,000 depending on notice period',
      requiredAction: 'Choose between alternative flight or full refund. File compensation claim if < 2 weeks notice',
      eligible: true,
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV (2025 Update)'
    })
    MERGE (r5:CompensationRule {
      id: 'rule_denied_boarding',
      eligibilityCondition: 'Involuntary denied boarding due to overbooking',
      compensationType: 'cash_compensation',
      description: 'Passenger involuntarily denied boarding entitled to compensation under DGCA rules',
      estimatedAmount: 5000,
      estimatedAmountNote: '400% of one-way base fare, minimum ₹5,000, maximum ₹20,000',
      requiredAction: 'Demand written explanation and file compensation claim immediately',
      eligible: true,
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV'
    })
    MERGE (r6:CompensationRule {
      id: 'rule_weather_not_eligible',
      eligibilityCondition: 'Delay or cancellation caused by extraordinary circumstances',
      compensationType: 'none',
      description: 'Weather, ATC, or security disruptions are extraordinary circumstances. Airlines are not liable for compensation',
      estimatedAmount: 0,
      estimatedAmountNote: 'No cash compensation. Full refund or rebooking may still apply',
      requiredAction: 'Request full refund or rebooking. No compensation claim applicable',
      eligible: false,
      regulationRef: 'DGCA CAR Section 3, Series M, Part IV'
    })
  `)

  // ── Document nodes ──
  await runQuery(`
    MERGE (doc1:Document {id: 'boarding_pass', name: 'Boarding Pass', description: 'Original or digital boarding pass', priority: 1})
    MERGE (doc2:Document {id: 'flight_ticket', name: 'Flight Ticket / PNR', description: 'Booking confirmation with PNR number', priority: 1})
    MERGE (doc3:Document {id: 'govt_id', name: 'Government ID', description: 'Aadhaar, Passport, or Voter ID', priority: 1})
    MERGE (doc4:Document {id: 'delay_certificate', name: 'Delay Certificate', description: 'Official delay certificate from airline', priority: 2})
    MERGE (doc5:Document {id: 'bank_details', name: 'Bank Details', description: 'Account number and IFSC for compensation transfer', priority: 2})
    MERGE (doc6:Document {id: 'complaint_copy', name: 'Complaint Copy', description: 'Copy of complaint filed with airline', priority: 3})
  `)

  // ── Airline nodes ──
  await runQuery(`
    MERGE (a1:Airline {id: 'indigo', name: 'IndiGo', code: '6E', claimEmail: 'customercare@goindigo.in', claimUrl: 'https://www.goindigo.in'})
    MERGE (a2:Airline {id: 'air_india', name: 'Air India', code: 'AI', claimEmail: 'customer.relations@airindia.in', claimUrl: 'https://www.airindia.com'})
    MERGE (a3:Airline {id: 'spicejet', name: 'SpiceJet', code: 'SG', claimEmail: 'feedback@spicejet.com', claimUrl: 'https://www.spicejet.com'})
    MERGE (a4:Airline {id: 'vistara', name: 'Vistara', code: 'UK', claimEmail: 'customer.care@airvistara.com', claimUrl: 'https://www.airvistara.com'})
    MERGE (a5:Airline {id: 'akasa', name: 'Akasa Air', code: 'QP', claimEmail: 'hello@akasaair.com', claimUrl: 'https://www.akasaair.com'})
  `)

  // ── AirSewa node ──
  await runQuery(`
    MERGE (as:AirSewa {
      id: 'airsewa',
      name: 'AirSewa',
      website: 'https://airsewa.gov.in',
      description: 'DGCA official passenger grievance portal',
      timeline: '30–60 days for resolution',
      process: 'Submit complaint online with supporting documents'
    })
  `)

  // ── Relationships: DisruptionType → CompensationRule ──
  await runQuery(`
    MATCH (d:DisruptionType {id: 'delay_3_5'}), (r:CompensationRule {id: 'rule_delay_3_5'}) MERGE (d)-[:GOVERNED_BY]->(r)
    WITH d, r
    MATCH (d2:DisruptionType {id: 'delay_5_8'}), (r2:CompensationRule {id: 'rule_delay_5_8'}) MERGE (d2)-[:GOVERNED_BY]->(r2)
    WITH d2, r2
    MATCH (d3:DisruptionType {id: 'delay_8_plus'}), (r3:CompensationRule {id: 'rule_delay_8_plus'}) MERGE (d3)-[:GOVERNED_BY]->(r3)
    WITH d3, r3
    MATCH (d4:DisruptionType {id: 'cancellation'}), (r4:CompensationRule {id: 'rule_cancellation'}) MERGE (d4)-[:GOVERNED_BY]->(r4)
    WITH d4, r4
    MATCH (d5:DisruptionType {id: 'denied_boarding'}), (r5:CompensationRule {id: 'rule_denied_boarding'}) MERGE (d5)-[:GOVERNED_BY]->(r5)
  `)

  // ── Relationships: CompensationRule → Documents required ──
  await runQuery(`
    MATCH (r:CompensationRule), (doc1:Document {id: 'boarding_pass'}), (doc2:Document {id: 'flight_ticket'}), (doc3:Document {id: 'govt_id'})
    WHERE r.eligible = true
    MERGE (r)-[:REQUIRES]->(doc1)
    MERGE (r)-[:REQUIRES]->(doc2)
    MERGE (r)-[:REQUIRES]->(doc3)
  `)

  await runQuery(`
    MATCH (r:CompensationRule {compensationType: 'cash_compensation'}), (doc:Document {id: 'delay_certificate'})
    MERGE (r)-[:REQUIRES]->(doc)
    WITH r, doc
    MATCH (r2:CompensationRule {compensationType: 'cash_and_hotel'}), (doc2:Document {id: 'delay_certificate'})
    MERGE (r2)-[:REQUIRES]->(doc2)
    WITH r2, doc2
    MATCH (r3:CompensationRule {compensationType: 'full_refund_plus_compensation'}), (doc3:Document {id: 'delay_certificate'})
    MERGE (r3)-[:REQUIRES]->(doc3)
  `)

  await runQuery(`
    MATCH (r:CompensationRule), (doc:Document {id: 'bank_details'})
    WHERE r.compensationType IN ['cash_compensation', 'cash_and_hotel', 'full_refund_plus_compensation']
    MERGE (r)-[:REQUIRES]->(doc)
  `)

  // ── Relationships: CompensationRule → AirSewa escalation ──
  await runQuery(`
    MATCH (r:CompensationRule), (as:AirSewa)
    WHERE r.eligible = true
    MERGE (r)-[:ESCALATES_TO]->(as)
  `)

  console.log('[Neo4j Seed] Database seeded successfully.')
}

/**
 * Checks if seeding is needed and seeds if so.
 * Safe to call on every page load — skips if already seeded.
 */
export async function seedIfEmpty() {
  const records = await runQuery('MATCH (d:DisruptionType) RETURN count(d) AS count')
  const count = records[0]?.get('count')?.toNumber?.() ?? 0
  if (count === 0) {
    console.log('[Neo4j Seed] Database is empty. Seeding...')
    await seedDatabase()
  } else {
    console.log(`[Neo4j Seed] Database already contains ${count} DisruptionType nodes. Skipping seed.`)
  }
}
