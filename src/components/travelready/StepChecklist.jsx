import React from 'react'
import { T, cardStyle, StickyFooter, ghostBtn, primaryBtn } from './TRStyles'

function ToggleRow({ label, checked, onChange }) {
  return (
    <label style={{ 
        display: 'flex', alignItems: 'center', padding: '16px', 
        borderBottom: `1px solid rgba(255,255,255,0.05)`, cursor: 'pointer',
        transition: T.trans
    }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
        style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }} 
      />
      <div style={{
          width: '20px', height: '20px', borderRadius: '4px',
          border: `2px solid ${checked ? T.purple : T.borderNeutral}`,
          background: checked ? T.purple : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: '12px', transition: T.trans
      }}>
          {checked && <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
      </div>
      <div style={{ flex: 1, fontSize: '15px', color: checked ? T.text : T.textSub, fontWeight: checked ? 600 : 400 }}>
          {label}
      </div>
    </label>
  )
}

export default function StepChecklist({ checklist, countryRules, onChange, onBack, onCalculate, isCalculating }) {
  
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Let's assess your travel readiness.</h2>
        <p style={{ margin: 0, color: T.textSub, fontSize: '14px' }}>Answer these questions based on your current preparation.</p>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <ToggleRow label="Passport valid for required duration" checked={checklist.passportValid} onChange={() => onChange('passportValid', !checklist.passportValid)} />
          <ToggleRow label="Visa approved" checked={checklist.visaApproved} onChange={() => onChange('visaApproved', !checklist.visaApproved)} />
          <ToggleRow label="Travel insurance purchased" checked={checklist.travelInsurance} onChange={() => onChange('travelInsurance', !checklist.travelInsurance)} />
          <ToggleRow label="Immigration documents ready (return ticket, hotel booking)" checked={checklist.immigrationDocs} onChange={() => onChange('immigrationDocs', !checklist.immigrationDocs)} />
          
          <ToggleRow label="Carrying prescription medicines?" checked={checklist.carryingMedicine} onChange={() => onChange('carryingMedicine', !checklist.carryingMedicine)} />
          {checklist.carryingMedicine && (
              <div style={{ padding: '12px 16px 12px 48px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ fontSize: '13px', color: T.textSub, marginBottom: '8px' }}>Do you have the original prescription?</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                          style={{ ...ghostBtn, padding: '6px 16px', background: checklist.hasPrescription ? 'rgba(124,58,237,0.2)' : 'transparent', borderColor: checklist.hasPrescription ? T.purple : T.borderNeutral, color: checklist.hasPrescription ? '#fff' : T.textSub }}
                          onClick={() => onChange('hasPrescription', true)}
                      >Yes</button>
                      <button 
                          style={{ ...ghostBtn, padding: '6px 16px', background: checklist.hasPrescription === false ? 'rgba(255,255,255,0.1)' : 'transparent', borderColor: checklist.hasPrescription === false ? T.textMuted : T.borderNeutral }}
                          onClick={() => onChange('hasPrescription', false)}
                      >No</button>
                  </div>
              </div>
          )}

          <ToggleRow label="Carrying a power bank?" checked={checklist.carryingPowerBank} onChange={() => onChange('carryingPowerBank', !checklist.carryingPowerBank)} />
          {checklist.carryingPowerBank && (
              <div style={{ padding: '12px 16px 12px 48px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ fontSize: '13px', color: T.textSub, marginBottom: '8px' }}>Where is it packed?</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                          style={{ ...ghostBtn, padding: '6px 16px', background: checklist.powerBankLocation === 'cabin' ? 'rgba(16,185,129,0.2)' : 'transparent', borderColor: checklist.powerBankLocation === 'cabin' ? T.emerald : T.borderNeutral, color: checklist.powerBankLocation === 'cabin' ? '#fff' : T.textSub }}
                          onClick={() => onChange('powerBankLocation', 'cabin')}
                      >Cabin Baggage</button>
                      <button 
                          style={{ ...ghostBtn, padding: '6px 16px', background: checklist.powerBankLocation === 'checked' ? 'rgba(244,63,94,0.2)' : 'transparent', borderColor: checklist.powerBankLocation === 'checked' ? T.rose : T.borderNeutral, color: checklist.powerBankLocation === 'checked' ? '#fff' : T.textSub }}
                          onClick={() => onChange('powerBankLocation', 'checked')}
                      >Checked Baggage</button>
                  </div>
              </div>
          )}

          <ToggleRow label="Carrying food items?" checked={checklist.carryingFood} onChange={() => onChange('carryingFood', !checklist.carryingFood)} />
          <ToggleRow label="Carrying a drone?" checked={checklist.carryingDrone} onChange={() => onChange('carryingDrone', !checklist.carryingDrone)} />
          <ToggleRow label={`Carrying cash above ${countryRules.customs.cashLimit.split('—')[0].trim()}?`} checked={checklist.cashAboveLimit} onChange={() => onChange('cashAboveLimit', !checklist.cashAboveLimit)} />
      </div>

      <StickyFooter>
        <button style={ghostBtn} onClick={onBack} disabled={isCalculating}>← Back</button>
        <button style={{ ...primaryBtn, opacity: isCalculating ? 0.7 : 1 }} onClick={onCalculate} disabled={isCalculating}>
           {isCalculating ? 'Calculating...' : 'Calculate Readiness Score'}
        </button>
      </StickyFooter>
    </div>
  )
}
