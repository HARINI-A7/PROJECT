/**
 * LoadingSkeleton — animated placeholder while initial data loads.
 * Mimics the layout of the flight list + map area.
 */
function Bone({ width = '100%', height = '16px', radius = '6px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(0,194,255,0.06) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s infinite',
        ...style,
      }}
    />
  )
}

function CardSkeleton() {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(9, 20, 36, 0.6)',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Bone width="120px" height="14px" />
        <Bone width="70px" height="20px" radius="10px" />
      </div>
      <Bone width="220px" height="11px" />
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', marginTop: '20px' }}>
      {/* Left panel skeleton */}
      <div>
        <Bone width="100%" height="36px" radius="8px" style={{ marginBottom: '14px' }} />
        <Bone width="80px" height="12px" style={{ marginBottom: '10px' }} />
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        <Bone width="80px" height="12px" style={{ margin: '16px 0 10px' }} />
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
      </div>

      {/* Map skeleton */}
      <Bone
        height="calc(100vh - 260px)"
        radius="12px"
        style={{ minHeight: '420px' }}
      />
    </div>
  )
}
