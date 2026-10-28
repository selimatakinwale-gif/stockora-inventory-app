import { useEffect, useState } from 'react'
import OnboardingScreen from './OnboardingScreen.jsx'

const screens = {
  'workspace-setup': () => import('./screens/workspace-setup.html?raw').then((module) => module.default),
  'sign-in': () => import('./screens/sign-in.html?raw').then((module) => module.default),
  'forgot-password': () => import('./screens/forgot-password.html?raw').then((module) => module.default),
  'reset-password': () => import('./screens/reset-password.html?raw').then((module) => module.default),
  'create-account': () => import('./screens/create-account.html?raw').then((module) => module.default),
  'inventory-profile': () => import('./screens/inventory-profile.html?raw').then((module) => module.default),
  'catalog-setup': () => import('./screens/catalog-setup.html?raw').then((module) => module.default),
}

function OnboardingFlow({ screen, ...callbacks }) {
  const [loadedScreen, setLoadedScreen] = useState({ name: '', html: '', error: '' })
  const loadScreen = screens[screen]

  useEffect(() => {
    let active = true
    if (loadScreen) loadScreen().then(
      (html) => {
        if (active) setLoadedScreen({ name: screen, html, error: '' })
      },
      (error) => {
        if (active) setLoadedScreen({ name: screen, html: '', error: error.message })
      },
    )

    return () => {
      active = false
    }
  }, [screen, loadScreen])

  if (!loadScreen) {
    return <p className="m-6 rounded-lg border border-status-error bg-white p-4 text-status-error" role="alert">This onboarding screen is not available.</p>
  }
  if (loadedScreen.name !== screen) {
    return <div className="min-h-screen bg-surface px-6 py-10" aria-live="polite">Loading Stockora…</div>
  }
  if (loadedScreen.error) {
    return <p className="m-6 rounded-lg border border-status-error bg-white p-4 text-status-error" role="alert">{loadedScreen.error}</p>
  }

  return <OnboardingScreen key={screen} html={loadedScreen.html} screen={screen} {...callbacks} />
}

export default OnboardingFlow
