import { runQuery } from './neo4j'

/**
 * Seeds the Neo4j database with TravelReady AI country rules.
 * Uses MERGE to be idempotent (safe to run multiple times).
 */
export async function seedCountryRulesIfEmpty() {
  try {
    const result = await runQuery(`MATCH (c:TRCountry) RETURN count(c) as count`)
    if (result && result[0] && result[0].count > 0) {
      console.log('[Neo4j] TRCountry nodes already exist. Skipping seed.')
      return
    }

    console.log('[Neo4j] Seeding TravelReady AI country rules...')

    await runQuery(`
      MERGE (ae:TRCountry {code: 'AE', name: 'United Arab Emirates'})
      MERGE (vAE:TRVisaRule {type: 'Visa on Arrival (30 days)'})
      MERGE (pAE1:TRProhibitedItem {name: 'Narcotics and drugs'})
      MERGE (ae)-[:REQUIRES]->(vAE)
      MERGE (ae)-[:PROHIBITS]->(pAE1)

      MERGE (sg:TRCountry {code: 'SG', name: 'Singapore'})
      MERGE (vSG:TRVisaRule {type: 'Visa Required'})
      MERGE (pSG1:TRProhibitedItem {name: 'Chewing gum'})
      MERGE (eSG1:TRElectronicsRule {name: 'E-cigarettes banned'})
      MERGE (sg)-[:REQUIRES]->(vSG)
      MERGE (sg)-[:PROHIBITS]->(pSG1)
      MERGE (sg)-[:RESTRICTS]->(eSG1)

      MERGE (jp:TRCountry {code: 'JP', name: 'Japan'})
      MERGE (vJP:TRVisaRule {type: 'Visa Required'})
      MERGE (mJP1:TRRestrictedMedicine {name: 'Medicines with stimulants'})
      MERGE (jp)-[:REQUIRES]->(vJP)
      MERGE (jp)-[:RESTRICTS]->(mJP1)

      MERGE (th:TRCountry {code: 'TH', name: 'Thailand'})
      MERGE (vTH:TRVisaRule {type: 'Visa on Arrival (30 days)'})
      MERGE (pTH1:TRProhibitedItem {name: 'E-cigarettes and vapes'})
      MERGE (th)-[:REQUIRES]->(vTH)
      MERGE (th)-[:PROHIBITS]->(pTH1)

      MERGE (au:TRCountry {code: 'AU', name: 'Australia'})
      MERGE (vAU:TRVisaRule {type: 'Visa Required'})
      MERGE (pAU1:TRProhibitedItem {name: 'Fresh fruit and meat'})
      MERGE (au)-[:REQUIRES]->(vAU)
      MERGE (au)-[:PROHIBITS]->(pAU1)

      MERGE (us:TRCountry {code: 'US', name: 'USA'})
      MERGE (vUS:TRVisaRule {type: 'Visa Required (B1/B2)'})
      MERGE (us)-[:REQUIRES]->(vUS)
    `)
    console.log('[Neo4j] TravelReady AI seeding complete.')
  } catch (error) {
    console.error('[Neo4j] Error seeding country rules:', error)
  }
}
