import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import StatusBar from './StatusBar'

const SIDEBAR_WIDTH = 240

// ── Layout ────────────────────────────────────────────────────
// Persistent shell: sidebar (left) + scrollable main content
// ─────────────────────────────────────────────────────────────
export default function Layout() {
  return (
    <div
      id="app-layout"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main
        id="main-content"
        className="grid-bg"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
          paddingBottom: '52px', // space for status bar
          background: 'linear-gradient(180deg, #02060F 0%, #050D1A 100%)',
          position: 'relative',
        }}
      >
        <Outlet />
      </main>

      {/* Fixed bottom status bar */}
      <StatusBar sidebarWidth={SIDEBAR_WIDTH} />
    </div>
  )
}
