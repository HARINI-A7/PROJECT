import { getCountryRules } from './countryRulesService'
import { getReadinessTier } from '../components/travelready/TRStyles'

export const WORKFLOW_STAGES = [
  { id: 'validate', label: 'Validating destination' },
  { id: 'query_neo4j', label: 'Querying knowledge graph' },
  { id: 'load_rules', label: 'Loading country regulations' },
  { id: 'check_docs', label: 'Checking travel documents' },
  { id: 'eval_packing', label: 'Evaluating packing compliance' },
  { id: 'calc_score', label: 'Calculating readiness score' },
  { id: 'warnings', label: 'Identifying critical warnings' },
  { id: 'ai_summary', label: 'Generating AI travel advice' },
  { id: 'compile', label: 'Compiling travel report' },
]

const delay = ms => new Promise(res => setTimeout(res, ms))

export async function executeTravelReadyWorkflow({ destination, checklist, countryRules }, onStageComplete) {
  let currentStage = 0
  const advanceStage = async (ms) => {
    onStageComplete(currentStage, WORKFLOW_STAGES[currentStage].id)
    currentStage++
    if (ms) await delay(ms)
  }

  try {
    // Stage 0: Validate destination
    await advanceStage(300)
    
    // Stage 1: Query Neo4j
    await advanceStage(400)
    
    // Stage 2: Load country regulations
    await advanceStage(300)
    
    // Stage 3: Check documents
    await advanceStage(400)
    
    // Stage 4: Evaluate packing
    await advanceStage(400)
    
    // Stage 5: Calculate score
    onStageComplete(currentStage, WORKFLOW_STAGES[currentStage].id)
    
    let score = 0
    let warnings = []
    
    // Passport
    if (checklist.passportValid) {
        score += 25
        warnings.push({ status: 'ready', label: 'Passport Valid', explanation: 'Valid for required duration.' })
    } else {
        warnings.push({ status: 'critical', label: 'Passport Invalid', explanation: 'Passport does not meet validity requirements.' })
    }
    
    // Visa
    if (checklist.visaApproved) {
        score += 20
        warnings.push({ status: 'ready', label: 'Visa Approved', explanation: 'Valid visa obtained.' })
    } else {
        warnings.push({ status: 'critical', label: 'Visa Missing', explanation: 'Required visa is missing or not approved.' })
    }
    
    // Insurance
    if (checklist.travelInsurance) {
        score += 15
        warnings.push({ status: 'ready', label: 'Travel Insurance', explanation: 'Insurance purchased.' })
    } else {
        warnings.push({ status: 'warning', label: 'No Travel Insurance', explanation: 'Highly recommended for medical emergencies.' })
    }
    
    // Immigration Docs
    if (checklist.immigrationDocs) {
        score += 15
        warnings.push({ status: 'ready', label: 'Immigration Documents', explanation: 'All supporting documents ready.' })
    } else {
        warnings.push({ status: 'warning', label: 'Missing Documents', explanation: 'Immigration may require return tickets and hotel bookings.' })
    }
    
    // Packing
    let packingScore = 15
    if (checklist.carryingPowerBank) {
        if (checklist.powerBankLocation === 'checked') {
            packingScore -= 5
            warnings.push({ status: 'critical', label: 'Power Bank in Checked Baggage', explanation: 'Must be carried in cabin baggage.' })
        } else {
            warnings.push({ status: 'ready', label: 'Power Bank', explanation: 'Carried correctly in cabin baggage.' })
        }
    }
    if (checklist.carryingFood && countryRules.packingRules.restricted.some(i => i.toLowerCase().includes('food') || i.toLowerCase().includes('meat') || i.toLowerCase().includes('fruit'))) {
         packingScore -= 5
         warnings.push({ status: 'warning', label: 'Food Items', explanation: 'Check strict biosecurity/customs rules for food.' })
    } else if (checklist.carryingFood) {
        warnings.push({ status: 'ready', label: 'Food Items', explanation: 'No major restrictions noted, but declare at customs.' })
    }
    
    if (checklist.carryingDrone) {
        packingScore -= 5
        warnings.push({ status: 'warning', label: 'Drone Registration', explanation: 'Check local drone laws and registration requirements.' })
    }
    
    if (checklist.cashAboveLimit) {
        packingScore -= 5
        warnings.push({ status: 'warning', label: 'Cash Limit Exceeded', explanation: `Must declare at customs (${countryRules.customs.cashLimit}).` })
    }
    score += Math.max(0, packingScore)
    
    // Medicine
    let medicineScore = 10
    if (checklist.carryingMedicine) {
        if (!checklist.hasPrescription) {
            medicineScore -= 10
            warnings.push({ status: 'critical', label: 'Missing Prescription', explanation: 'Original prescription is required for medicines.' })
        } else {
            warnings.push({ status: 'ready', label: 'Medicines', explanation: 'Carrying prescription as required.' })
        }
    }
    score += Math.max(0, medicineScore)
    
    currentStage++
    await delay(300)

    // Stage 6: Identify warnings
    await advanceStage(300)
    
    // Sort warnings: critical, warning, ready
    const severityOrder = { 'critical': 0, 'warning': 1, 'ready': 2 }
    warnings.sort((a, b) => severityOrder[a.status] - severityOrder[b.status])
    
    // Stage 7: AI Summary
    onStageComplete(currentStage, WORKFLOW_STAGES[currentStage].id)
    
    let aiSummary = ""
    try {
        const systemPrompt = `You are a helpful travel assistant. Given a destination (${destination.name}) and a checklist of readiness factors, provide 2-3 short paragraphs of personalized advice for an Indian passenger. Focus on priority actions.`
        const userPrompt = `Destination: ${destination.name}. Score: ${score}/100. Issues: ${warnings.filter(w => w.status !== 'ready').map(w => w.label).join(', ')}`
        
        const res = await fetch('/api/sarvam/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'sarvam-30b',
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
                temperature: 0.3,
            }),
        })
        
        if (res.ok) {
            const data = await res.json()
            if (data.choices && data.choices[0] && data.choices[0].message) {
                 aiSummary = data.choices[0].message.content
            }
        } else {
            throw new Error("Sarvam request failed")
        }
    } catch (err) {
        console.warn("AI generation failed, using rule-based fallback", err)
        aiSummary = `Based on your checklist, please prioritize the following actions before your trip to ${destination.name}:\n\n`
        warnings.filter(w => w.status !== 'ready').forEach(w => {
            aiSummary += `- **${w.label}**: ${w.explanation}\n`
        })
        if (warnings.filter(w => w.status !== 'ready').length === 0) {
            aiSummary = `You are fully prepared for your trip to ${destination.name}. Have a safe flight!`
        }
    }
    
    currentStage++
    await delay(300)
    
    // Stage 8: Compile
    onStageComplete(currentStage, WORKFLOW_STAGES[currentStage].id)
    await delay(300)
    
    const tier = getReadinessTier(score)
    const prepTime = `≈ ${warnings.filter(w => w.status !== 'ready').length * 5} minutes`
    
    return {
        score,
        tier,
        verdict: tier.verdict,
        warnings,
        aiSummary,
        prepTime,
        source: 'render-workflow-sim'
    }

  } catch (error) {
      console.error("Workflow failed", error)
      throw error
  }
}
