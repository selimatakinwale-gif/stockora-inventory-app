import { useCallback, useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import OnboardingFlow from './pages/onboarding/OnboardingFlow.jsx'
import DashboardFlow from './pages/dashboard/DashboardFlow.jsx'
import {
  completeOnboarding,
  createDemoProducts,
  getCurrentAccount,
  getPendingAccount,
  loadActivity,
  loadProducts,
  recordActivity,
  registerLocalAccount,
  saveOnboardingStep,
  saveProducts,
  signInLocalAccount,
  signOutLocalAccount,
  updateLocalAccount,
} from './lib/stockoraStore.js'

const ONBOARDING_SCREENS = new Set([
  'sign-in',
  'forgot-password',
  'reset-password',
  'create-account',
  'workspace-setup',
  'inventory-profile',
  'catalog-setup',
])

const DASHBOARD_SCREENS = new Set([
  'overview',
  'inventory',
  'add-item',
  'edit-item',
  'adjust-stock',
  'intelligence',
  'categories',
  'analytics',
  'activity',
  'settings',
])
const REDIRECT_KEY = 'stockora.after-sign-in'

function getRouteFromHash() {
  const hash = window.location.hash
  return hash.startsWith('#/') ? hash.slice(2).split('?')[0] : ''
}

function getDashboardScreen(route) {
  if (!route.startsWith('dashboard')) return ''
  const requested = route.split('/')[1] || 'overview'
  return DASHBOARD_SCREENS.has(requested) ? requested : ''
}

function loadInitialState() {
  try {
    const account = getCurrentAccount()
    return {
      account,
      pendingAccount: getPendingAccount(),
      products: account ? loadProducts(account.id) : [],
      events: account ? loadActivity(account.id) : [],
      error: '',
    }
  } catch (error) {
    return { account: null, pendingAccount: null, products: [], events: [], error: error.message }
  }
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash)
  const [initialState] = useState(loadInitialState)
  const [account, setAccount] = useState(initialState.account)
  const [pendingAccount, setPendingAccount] = useState(initialState.pendingAccount)
  const [products, setProducts] = useState(initialState.products)
  const [events, setEvents] = useState(initialState.events)
  const [appError, setAppError] = useState(initialState.error)
  const dashboardScreen = getDashboardScreen(route)
  const onboardingScreen = ONBOARDING_SCREENS.has(route) ? route : ''

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!route) {
      const anchor = window.location.hash.slice(1)
      if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView())
      return
    }

    if (route.startsWith('dashboard/') || route === 'dashboard') {
      if (!account) {
        window.sessionStorage.setItem(REDIRECT_KEY, `#/${route}`)
        window.location.hash = '#/sign-in'
        return
      }
      if (!dashboardScreen) window.location.hash = '#/dashboard'
      else window.scrollTo(0, 0)
      return
    }

    if (['workspace-setup', 'inventory-profile', 'catalog-setup'].includes(route) && !account && !pendingAccount) {
      window.location.hash = '#/create-account'
      return
    }

    if (onboardingScreen) window.scrollTo(0, 0)
  }, [route, account, pendingAccount, dashboardScreen, onboardingScreen])

  const handleAccountCreate = useCallback(async (values) => {
    const result = await registerLocalAccount(values)
    if (result.account) setPendingAccount(result.account)
    return result
  }, [])

  const handleSignIn = useCallback(async ({ email, password }) => {
    const result = await signInLocalAccount(email, password)
    if (result.error) return result

    if (result.needsOnboarding) {
      setPendingAccount(result.account)
      return result
    }

    setAccount(result.account)
    setPendingAccount(null)
    setProducts(loadProducts(result.account.id))
    setEvents(loadActivity(result.account.id))
    const redirect = window.sessionStorage.getItem(REDIRECT_KEY) || '#/dashboard'
    window.sessionStorage.removeItem(REDIRECT_KEY)
    return { ...result, redirect }
  }, [])

  const handleOnboardingStep = useCallback((step, values) => {
    const id = pendingAccount?.id || account?.id
    if (!id) throw new Error('Create an account or sign in before continuing setup.')
    const updated = saveOnboardingStep(id, step, values)
    if (account) setAccount(updated)
    else setPendingAccount(updated)
  }, [account, pendingAccount])

  const handleOnboardingComplete = useCallback((values) => {
    const id = pendingAccount?.id || account?.id
    if (!id) throw new Error('Create an account or sign in before completing setup.')

    if (values.intake_mode === 'import' && !Array.isArray(values.importedProducts)) {
      throw new Error('Choose a CSV catalog file before completing setup.')
    }

    const initialProducts = values.intake_mode === 'sample'
      ? createDemoProducts()
      : values.intake_mode === 'import'
        ? values.importedProducts.map((product) => ({ ...product, id: window.crypto.randomUUID() }))
        : []
    const productSkus = initialProducts.map((product) => product.sku.toUpperCase())
    if (new Set(productSkus).size !== productSkus.length) {
      throw new Error('The imported catalog contains duplicate SKUs. Correct the CSV and try again.')
    }

    const completedAccount = completeOnboarding(id, values)
    saveProducts(id, initialProducts)
    if (initialProducts.length) {
      recordActivity(id, {
        action: values.intake_mode === 'sample' ? 'Sample catalog added' : 'Catalog imported',
        productName: `${initialProducts.length} products`,
        sku: '',
        delta: `+${initialProducts.length} items`,
        user: completedAccount.name,
        reason: values.intake_mode === 'sample'
          ? 'User selected the sample catalog during onboarding'
          : 'User imported a CSV catalog during onboarding',
      })
    }

    setAccount(completedAccount)
    setPendingAccount(null)
    setProducts(initialProducts)
    setEvents(loadActivity(id))
  }, [account, pendingAccount])

  const handleSignOut = useCallback(() => {
    signOutLocalAccount()
    setAccount(null)
    setProducts([])
    setEvents([])
    window.location.hash = '#/sign-in'
  }, [])

  const handleAddProduct = useCallback((values) => {
    const sku = values.sku.trim().toUpperCase()
    if (products.some((product) => product.sku.toUpperCase() === sku)) {
      return { error: 'That SKU already exists. Choose a unique SKU before saving.' }
    }

    try {
      const product = { ...values, sku, id: window.crypto.randomUUID() }
      const next = [product, ...products]
      saveProducts(account.id, next)
      recordActivity(account.id, {
        action: 'Item created',
        productName: product.name,
        sku: product.sku,
        delta: `+${product.quantity}`,
        user: account.name,
        reason: 'Inventory item added',
      })
      setProducts(next)
      setEvents(loadActivity(account.id))
      return { product }
    } catch (error) {
      setAppError(error.message)
      return { error: 'The item could not be saved to this browser. Check local storage access and try again.' }
    }
  }, [account, products])

  const handleImportProducts = useCallback((rows) => {
    const currentSkus = new Set(products.map((product) => product.sku.toUpperCase()))
    const importedSkus = new Set()
    for (const row of rows) {
      const sku = row.sku.trim().toUpperCase()
      if (currentSkus.has(sku) || importedSkus.has(sku)) {
        return { error: `SKU "${row.sku}" already exists. No rows were imported.` }
      }
      importedSkus.add(sku)
    }

    try {
      const imported = rows.map((row) => ({ ...row, sku: row.sku.trim().toUpperCase(), id: window.crypto.randomUUID() }))
      const next = [...imported, ...products]
      saveProducts(account.id, next)
      recordActivity(account.id, {
        action: 'CSV import',
        productName: `${imported.length} inventory items`,
        sku: '',
        delta: `+${imported.length}`,
        user: account.name,
        reason: 'User imported a CSV catalog',
      })
      setProducts(next)
      setEvents(loadActivity(account.id))
      return { count: imported.length }
    } catch (error) {
      setAppError(error.message)
      return { error: 'The inventory could not be saved. No import was completed.' }
    }
  }, [account, products])

  const handleUpdateProduct = useCallback((id, updates) => {
    try {
      const current = products.find((product) => product.id === id)
      if (!current) throw new Error('This item is no longer in the inventory.')
      const next = products.map((product) => product.id === id ? { ...product, ...updates } : product)
      saveProducts(account.id, next)
      recordActivity(account.id, {
        action: 'Item updated',
        productName: updates.name || current.name,
        sku: current.sku,
        delta: '—',
        user: account.name,
        reason: 'Inventory item details edited',
      })
      setProducts(next)
      setEvents(loadActivity(account.id))
    } catch (error) {
      setAppError(error.message)
    }
  }, [account, products])

  const handleDeleteProduct = useCallback((id) => {
    try {
      const product = products.find((item) => item.id === id)
      if (!product) throw new Error('This item is no longer in the inventory.')
      const next = products.filter((item) => item.id !== id)
      saveProducts(account.id, next)
      recordActivity(account.id, {
        action: 'Item deleted',
        productName: product.name,
        sku: product.sku,
        delta: `-${product.quantity}`,
        user: account.name,
        reason: 'Inventory item removed',
      })
      setProducts(next)
      setEvents(loadActivity(account.id))
    } catch (error) {
      setAppError(error.message)
    }
  }, [account, products])

  const handleAdjustProduct = useCallback((id, amount, mode) => {
    try {
      const product = products.find((item) => item.id === id)
      if (!product) throw new Error('This item is no longer in the inventory.')
      const quantity = mode === 'inbound'
        ? Number(product.quantity) + amount
        : mode === 'outbound'
          ? Number(product.quantity) - amount
          : amount
      if (quantity < 0) throw new Error('Stock cannot be adjusted below zero.')

      const delta = quantity - Number(product.quantity)
      const next = products.map((item) => item.id === id ? { ...item, quantity } : item)
      saveProducts(account.id, next)
      recordActivity(account.id, {
        action: 'Stock adjusted',
        productName: product.name,
        sku: product.sku,
        delta: `${delta > 0 ? '+' : ''}${delta}`,
        user: account.name,
        reason: `${mode} stock adjustment`,
      })
      setProducts(next)
      setEvents(loadActivity(account.id))
      return { ok: true }
    } catch (error) {
      setAppError(error.message)
      return { error: error.message }
    }
  }, [account, products])

  const handleUpdateProfile = useCallback((updates) => {
    try {
      const updated = updateLocalAccount(account.id, updates)
      setAccount(updated)
    } catch (error) {
      setAppError(error.message)
    }
  }, [account])

  const onboardingCallbacks = {
    onAccountCreate: handleAccountCreate,
    onSignIn: handleSignIn,
    onStepComplete: handleOnboardingStep,
    onOnboardingComplete: handleOnboardingComplete,
  }

  return (
    <>
      {appError && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-lg rounded-lg border border-status-error bg-white px-4 py-3 text-sm text-status-error shadow-lg" role="alert">
          {appError}
          <button className="ml-3 font-semibold underline" onClick={() => setAppError('')} type="button">Dismiss</button>
        </div>
      )}
      {dashboardScreen && account ? (
        <DashboardFlow
          account={account}
          events={events}
          onAddProduct={handleAddProduct}
          onAdjustProduct={handleAdjustProduct}
          onDeleteProduct={handleDeleteProduct}
          onImportProducts={handleImportProducts}
          onSignOut={handleSignOut}
          onUpdateProduct={handleUpdateProduct}
          onUpdateProfile={handleUpdateProfile}
          products={products}
          screen={dashboardScreen}
        />
      ) : onboardingScreen ? (
        <OnboardingFlow screen={onboardingScreen} {...onboardingCallbacks} />
      ) : (
        <LandingPage />
      )}
    </>
  )
}

export default App
