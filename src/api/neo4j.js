import neo4j from 'neo4j-driver'

let _driver = null

/**
 * Returns a singleton Neo4j driver instance.
 * Reads credentials from VITE_ env vars.
 */
export function getDriver() {
  if (_driver) return _driver

  const uri = import.meta.env.VITE_NEO4J_URI
  const user = import.meta.env.VITE_NEO4J_USERNAME
  const password = import.meta.env.VITE_NEO4J_PASSWORD

  if (!uri || !user || !password) {
    throw new Error('NEO4J_MISSING_CREDENTIALS')
  }

  _driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 10,
    connectionTimeout: 8000,
    encrypted: false,
    trust: 'TRUST_ALL_CERTIFICATES'
  })

  return _driver
}

/**
 * Runs a Cypher query and returns records.
 * Throws with code 'NEO4J_UNAVAILABLE' if connection fails.
 */
export async function runQuery(cypher, params = {}) {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(cypher, params)
    return result.records
  } catch (err) {
    console.error('[Neo4j] Query failed:', err.message)
    throw Object.assign(new Error('Neo4j query failed'), { code: 'NEO4J_UNAVAILABLE', cause: err })
  } finally {
    await session.close()
  }
}

/**
 * Tests connectivity to Neo4j.
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    await runQuery('RETURN 1 AS ok')
    return true
  } catch {
    return false
  }
}
