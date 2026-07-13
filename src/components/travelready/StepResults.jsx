import React from 'react'
import { StickyFooter, ghostBtn, primaryBtn } from './TRStyles'
import ReadinessHeroCard from './ReadinessHeroCard'
import ReadinessBreakdownCard from './ReadinessBreakdownCard'
import AISummaryCard from './AISummaryCard'
import TravelChecklistCard from './TravelChecklistCard'
import ExportActionsCard from './ExportActionsCard'

export default function StepResults({ result, aiSummary, isAISummaryLoading, checklist, countryRules, onBack, onRestart, downloadPDF, shareLinks }) {
  if (!result) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
      <ReadinessHeroCard result={result} />
      
      <ReadinessBreakdownCard result={result} />
      
      <AISummaryCard aiSummary={aiSummary} isLoading={isAISummaryLoading} />
      
      <TravelChecklistCard checklist={checklist} countryRules={countryRules} result={result} />
      
      <ExportActionsCard downloadPDF={downloadPDF} shareLinks={shareLinks} />
      
      <StickyFooter>
        <button style={ghostBtn} onClick={onBack}>← Back to Checklist</button>
        <button style={primaryBtn} onClick={onRestart}>Start New Assessment</button>
      </StickyFooter>
    </div>
  )
}
