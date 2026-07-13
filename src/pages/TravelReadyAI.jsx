import React from 'react'
import { useTravelReady } from '../hooks/useTravelReady'
import TRProgress from '../components/travelready/TRProgress'
import StepDestination from '../components/travelready/StepDestination'
import StepGuide from '../components/travelready/StepGuide'
import StepChecklist from '../components/travelready/StepChecklist'
import StepProcessing from '../components/travelready/StepProcessing'
import StepResults from '../components/travelready/StepResults'

export default function TravelReadyAI() {
  const wizard = useTravelReady()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Do not show progress bar on the processing screen (step 3) */}
      {wizard.step !== 3 && <TRProgress currentStep={wizard.step} />}

      {wizard.step === 0 && (
        <StepDestination 
          destinationCode={wizard.destinationCode} 
          onChange={wizard.handleDestinationChange} 
          onNext={wizard.nextStep} 
        />
      )}

      {wizard.step === 1 && (
        <StepGuide 
          countryRules={wizard.countryRules} 
          onNext={wizard.nextStep} 
          onBack={wizard.prevStep} 
        />
      )}

      {wizard.step === 2 && (
        <StepChecklist 
          checklist={wizard.checklist} 
          countryRules={wizard.countryRules} 
          onChange={wizard.updateChecklist} 
          onBack={wizard.prevStep} 
          onCalculate={wizard.runWorkflow} 
          isCalculating={wizard.isLoading} 
        />
      )}

      {wizard.step === 3 && (
        <StepProcessing 
          stages={wizard.workflowStages} 
          completedStages={wizard.completedStages} 
        />
      )}

      {wizard.step === 4 && (
        <StepResults 
          result={wizard.readinessResult} 
          aiSummary={wizard.aiSummary}
          isAISummaryLoading={wizard.isAISummaryLoading}
          checklist={wizard.checklist} 
          countryRules={wizard.countryRules} 
          onBack={() => wizard.goToStep(2)} 
          onRestart={wizard.restart} 
          downloadPDF={wizard.downloadPDF} 
          shareLinks={wizard.shareLinks} 
        />
      )}
      
    </div>
  )
}
