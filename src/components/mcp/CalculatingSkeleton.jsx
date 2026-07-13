import { T } from './mcpStyles'

function Skeleton({ w = '100%', h = '20px', radius = '8px' }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
        animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  )
}

export function CalculatingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: T.bg, border: '1px solid rgba(244,63,94,0.12)', borderRadius: '16px', padding: '28px', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '28px', animation: 'spin 1.5s linear infinite' }}>⟳</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton h="28px" w="60%" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Skeleton h="56px" radius="10px" />
            <Skeleton h="56px" radius="10px" />
            <Skeleton h="56px" radius="10px" />
            <Skeleton h="56px" radius="10px" />
          </div>
        </div>
      </div>

      {[1,2,3].map(i => (
        <div key={i} style={{ background: T.bg, border: '1px solid rgba(0,194,255,0.1)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton h="18px" w="40%" />
          <Skeleton h="14px" w="90%" />
          <Skeleton h="14px" w="75%" />
          <Skeleton h="14px" w="60%" />
        </div>
      ))}

      <p style={{ textAlign: 'center', color: T.textMuted, fontSize: '13px', marginTop: '4px' }}>
        ⬡ Querying airport knowledge graph...
      </p>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
