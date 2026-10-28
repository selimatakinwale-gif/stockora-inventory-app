const USERS_KEY = 'stockora.users.v1'
const SESSION_KEY = 'stockora.session.v1'
const PENDING_ACCOUNT_KEY = 'stockora.pending-account.v1'

function readStorage(key, fallback) {
  const value = window.localStorage.getItem(key)
  if (value === null) return fallback

  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(`Saved Stockora data for "${key}" is invalid. Clear this app's local storage to continue.`, {
      cause: error,
    })
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function userStorageKey(userId, suffix) {
  return `stockora.${userId}.${suffix}.v1`
}

function loadUsers() {
  const users = readStorage(USERS_KEY, [])
  if (!Array.isArray(users)) throw new Error('Saved Stockora accounts are invalid.')
  return users
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error('Password hashing is unavailable in this browser context. Open Stockora on localhost or HTTPS.')
  }

  const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210000 },
    key,
    256,
  )

  return toHex(bits)
}

function randomSalt() {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return toHex(bytes)
}

function fromHex(value) {
  return new Uint8Array(value.match(/.{2}/g).map((part) => Number.parseInt(part, 16)))
}

export async function registerLocalAccount({ name, email, password, workspaceName, role }) {
  const users = loadUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email === normalizedEmail)) {
    return { error: 'An account with this email already exists. Sign in or use a different email.' }
  }

  const salt = randomSalt()
  const account = {
    id: window.crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    role: role.trim(),
    workspaceName: workspaceName.trim(),
    passwordSalt: salt,
    passwordHash: await hashPassword(password, fromHex(salt)),
    onboardingComplete: false,
    onboarding: {},
    createdAt: new Date().toISOString(),
  }

  users.push(account)
  writeStorage(USERS_KEY, users)
  window.localStorage.setItem(PENDING_ACCOUNT_KEY, account.id)
  return { account }
}

export async function signInLocalAccount(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const account = loadUsers().find((user) => user.email === normalizedEmail)

  if (!account) return { error: 'Email or password is incorrect.' }

  const candidate = await hashPassword(password, fromHex(account.passwordSalt))
  if (candidate !== account.passwordHash) return { error: 'Email or password is incorrect.' }

  if (!account.onboardingComplete) {
    window.localStorage.setItem(PENDING_ACCOUNT_KEY, account.id)
    return { account, needsOnboarding: true }
  }

  window.localStorage.setItem(SESSION_KEY, account.id)
  return { account, needsOnboarding: false }
}

export function getCurrentAccount() {
  const id = window.localStorage.getItem(SESSION_KEY)
  if (!id) return null
  return loadUsers().find((user) => user.id === id && user.onboardingComplete) || null
}

export function getPendingAccount() {
  const id = window.localStorage.getItem(PENDING_ACCOUNT_KEY)
  if (!id) return null
  return loadUsers().find((user) => user.id === id) || null
}

export function saveOnboardingStep(accountId, step, values) {
  const users = loadUsers()
  const index = users.findIndex((user) => user.id === accountId)
  if (index < 0) throw new Error('Your account could not be found. Sign in again to continue setup.')

  users[index] = {
    ...users[index],
    onboarding: { ...users[index].onboarding, [step]: values },
  }
  writeStorage(USERS_KEY, users)
  return users[index]
}

export function completeOnboarding(accountId, values) {
  const users = loadUsers()
  const index = users.findIndex((user) => user.id === accountId)
  if (index < 0) throw new Error('Your account could not be found. Sign in again to complete setup.')

  users[index] = {
    ...users[index],
    onboarding: { ...users[index].onboarding, catalog: values },
    onboardingComplete: true,
    workspaceName: users[index].onboarding.workspace?.workspaceName || users[index].workspaceName,
  }
  writeStorage(USERS_KEY, users)
  window.localStorage.setItem(SESSION_KEY, accountId)
  window.localStorage.removeItem(PENDING_ACCOUNT_KEY)
  return users[index]
}

export function signOutLocalAccount() {
  window.localStorage.removeItem(SESSION_KEY)
}

export function updateLocalAccount(accountId, updates) {
  const users = loadUsers()
  const index = users.findIndex((user) => user.id === accountId)
  if (index < 0) throw new Error('Your account could not be found.')

  users[index] = { ...users[index], ...updates }
  writeStorage(USERS_KEY, users)
  return users[index]
}

export function loadProducts(accountId) {
  const products = readStorage(userStorageKey(accountId, 'products'), [])
  if (!Array.isArray(products)) throw new Error('Saved inventory data is invalid.')
  return products
}

export function saveProducts(accountId, products) {
  writeStorage(userStorageKey(accountId, 'products'), products)
}

export function loadActivity(accountId) {
  const activity = readStorage(userStorageKey(accountId, 'activity'), [])
  if (!Array.isArray(activity)) throw new Error('Saved activity data is invalid.')
  return activity
}

export function recordActivity(accountId, entry) {
  const activity = loadActivity(accountId)
  activity.unshift({ ...entry, id: window.crypto.randomUUID(), createdAt: new Date().toISOString() })
  writeStorage(userStorageKey(accountId, 'activity'), activity.slice(0, 500))
}

export function createDemoProducts() {
  return [
    {
      id: window.crypto.randomUUID(),
      name: 'Chamomile Calming Mist 100ml',
      sku: 'SKN-CHM-100',
      category: 'Skincare & Botanicals',
      location: 'WH-East',
      bin: 'A-12',
      quantity: 24,
      threshold: 12,
      cost: 8.5,
      price: 18,
      unit: 'bottles',
    },
    {
      id: window.crypto.randomUUID(),
      name: 'Organic Rosehip Seed Oil',
      sku: 'OIL-RHP-050',
      category: 'Essential & Carrier Oils',
      location: 'WH-East',
      bin: 'B-04',
      quantity: 58,
      threshold: 20,
      cost: 12,
      price: 25,
      unit: 'bottles',
    },
    {
      id: window.crypto.randomUUID(),
      name: 'Amber Glass Dropper Bottle',
      sku: 'PKG-AMB-030',
      category: 'Packaging & Glass',
      location: 'WH-East',
      bin: 'C-02',
      quantity: 120,
      threshold: 40,
      cost: 1.25,
      price: 3.5,
      unit: 'units',
    },
    {
      id: window.crypto.randomUUID(),
      name: 'Aloe Vera Soothing Gel 200ml',
      sku: 'SKN-ALOE-200',
      category: 'Skincare & Botanicals',
      location: 'WH-East',
      bin: 'A-18',
      quantity: 36,
      threshold: 14,
      cost: 5.75,
      price: 14,
      unit: 'jars',
    },
    {
      id: window.crypto.randomUUID(),
      name: 'Lavender Essential Oil 30ml',
      sku: 'OIL-LAV-030',
      category: 'Essential & Carrier Oils',
      location: 'WH-East',
      bin: 'B-10',
      quantity: 18,
      threshold: 10,
      cost: 7.25,
      price: 16,
      unit: 'bottles',
    },
  ]
}
