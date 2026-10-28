import { useEffect, useRef } from 'react'
import { parseInventoryCsv } from '../../lib/inventoryCsv.js'

function showNotice(root, message) {
  let notice = root.querySelector('[data-onboarding-notice]')

  if (!notice) {
    notice = document.createElement('p')
    notice.dataset.onboardingNotice = 'true'
    notice.className =
      'mt-4 rounded-lg border border-brand-border bg-brand-canvas px-4 py-3 text-sm text-brand-muted'
    notice.setAttribute('role', 'status')
    root.querySelector('main')?.append(notice)
  }

  notice.textContent = message
}

function updateRule(root, ruleId, iconId, isValid) {
  const rule = root.querySelector(`#${ruleId}`)
  const icon = iconId ? root.querySelector(`#${iconId}`) : rule?.querySelector('span')
  if (!rule || !icon) return

  icon.textContent = isValid ? 'check_circle' : 'radio_button_unchecked'
  icon.classList.toggle('text-status-success', isValid)
  icon.classList.toggle('text-text-secondary', !isValid)
}

function updatePasswordFeedback(root, screen) {
  if (screen === 'create-account') {
    const password = root.querySelector('#accountPassword')?.value || ''
    const rules = [
      ['rule-length', 'icon-length', password.length >= 8],
      ['rule-upper', 'icon-upper', /[A-Z]/.test(password)],
      ['rule-symbol', 'icon-symbol', /[\d\W]/.test(password)],
    ]

    rules.forEach(([ruleId, iconId, valid]) => updateRule(root, ruleId, iconId, valid))
    return
  }

  if (screen !== 'reset-password') return

  const password = root.querySelector('#new-password')?.value || ''
  const confirmation = root.querySelector('#confirm-password')?.value || ''
  const rules = [
    ['rule-length', password.length >= 8],
    ['rule-case', /[a-z]/.test(password) && /[A-Z]/.test(password)],
    ['rule-number', /\d/.test(password)],
    ['rule-symbol', /[!@#$%^&*]/.test(password)],
  ]

  rules.forEach(([ruleId, valid]) => updateRule(root, ruleId, null, valid))

  const score = rules.filter(([, valid]) => valid).length
  const label = root.querySelector('#strength-label')
  if (label) {
    label.textContent = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][score]
    label.classList.toggle('text-status-error', score < 2)
    label.classList.toggle('text-status-warning', score >= 2 && score < 4)
    label.classList.toggle('text-status-success', score === 4)
  }

  for (let index = 1; index <= 4; index += 1) {
    const bar = root.querySelector(`#bar-${index}`)
    if (!bar) continue
    const active = index <= score
    bar.classList.toggle('bg-status-success', active && score >= 3)
    bar.classList.toggle('bg-status-warning', active && score === 2)
    bar.classList.toggle('bg-status-error', active && score < 2)
    bar.classList.toggle('bg-surface-container-high', !active)
  }

  const badge = root.querySelector('#match-badge')
  if (badge) {
    const matches = Boolean(password && confirmation && password === confirmation)
    const icon = badge.querySelector('span:first-child')
    badge.classList.toggle('text-status-success', matches)
    badge.classList.toggle('text-status-error', !matches)
    if (icon) icon.textContent = matches ? 'check' : password && confirmation ? 'close' : 'info'
    const message = badge.querySelector('span:last-child')
    if (message) {
      message.textContent = !password || !confirmation
        ? 'Enter matching passwords'
        : matches
          ? 'Passwords match'
          : 'Passwords do not match'
    }
  }
}

function OnboardingScreen({
  html,
  screen,
  onAccountCreate,
  onSignIn,
  onStepComplete,
  onOnboardingComplete,
}) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const openCatalogFilePicker = () => {
      let fileInput = root.querySelector('#catalog-csv-upload')
      if (!fileInput) {
        fileInput = document.createElement('input')
        fileInput.id = 'catalog-csv-upload'
        fileInput.type = 'file'
        fileInput.accept = '.csv,text/csv'
        fileInput.hidden = true
        root.append(fileInput)
      }
      fileInput.click()
    }

    const onClick = async (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a')
      if (link) {
        const label = link.textContent.trim()

        if (screen === 'sign-in' && label.includes('Forgot password?')) {
          event.preventDefault()
          window.location.hash = '#/forgot-password'
          return
        }

        if (screen === 'sign-in' && label.includes('Single Sign-On')) {
          event.preventDefault()
          showNotice(root, 'External sign-in is not connected yet.')
          return
        }

        if (screen === 'create-account' && link.getAttribute('href') === '#calibration') {
          event.preventDefault()
          window.location.hash = '#/workspace-setup'
          return
        }

        if (screen === 'inventory-profile' && label.includes('Back to Step 1')) {
          event.preventDefault()
          window.location.hash = '#/workspace-setup'
          return
        }
      }

      const button = target.closest('button')
      if (!button) return

      if (screen === 'create-account' && button.textContent.includes('Remove')) {
        const fileInput = root.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''
      }

      const passwordToggles = {
        togglePassword: screen === 'create-account' ? '#accountPassword' : '#password',
        'toggle-pass-btn': '#new-password',
        'toggle-confirm-btn': '#confirm-password',
      }
      const inputSelector = passwordToggles[button.id]
      if (inputSelector) {
        const input = root.querySelector(inputSelector)
        const icon = button.querySelector('span')
        if (input && icon) {
          input.type = input.type === 'password' ? 'text' : 'password'
          icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off'
        }
      }

      if (button.id === 'btn-decrement' || button.id === 'btn-increment') {
        const input = root.querySelector('#threshold-input')
        if (input) {
          const current = Number.parseInt(input.value, 10) || 1
          const next = button.id === 'btn-increment' ? current + 1 : current - 1
          input.value = String(Math.max(1, Math.min(999, next)))
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      if (screen === 'workspace-setup' && button.textContent.includes('Save & Exit')) {
        const form = root.querySelector('#onboardingForm')
        try {
          await onStepComplete?.('workspace', Object.fromEntries(new FormData(form)))
          window.location.hash = ''
        } catch (error) {
          showNotice(root, error.message || 'Workspace settings could not be saved.')
        }
      }

      if (
        screen === 'workspace-setup' &&
        button.textContent.includes('Skip & load demo catalog')
      ) {
        const form = root.querySelector('#onboardingForm')
        const values = Object.fromEntries(new FormData(form))
        values.intake_mode = 'sample'
        try {
          await onStepComplete?.('workspace', values)
          window.location.hash = '#/catalog-setup'
        } catch (error) {
          showNotice(root, error.message || 'Workspace settings could not be saved.')
        }
      }

      if (screen === 'catalog-setup' && button.textContent.includes('Back to Step 2')) {
        window.location.hash = '#/inventory-profile'
      }

      if (screen === 'catalog-setup' && button.textContent.includes('Complete Setup')) {
        const intakeMode = root.querySelector('input[name="intake_mode"]:checked')?.value
        if (intakeMode === 'import') {
          event.preventDefault()
          openCatalogFilePicker()
          return
        }
        if (!intakeMode) {
          showNotice(root, 'Choose Sample Catalog or Start Blank to continue.')
          return
        }
        try {
          await onOnboardingComplete?.({ intake_mode: intakeMode })
          window.location.hash = '#/dashboard'
        } catch (error) {
          showNotice(root, error.message || 'Setup could not be completed.')
        }
      }

      if (
        (screen === 'sign-in' && button.textContent.includes('Google Workspace')) ||
        (screen === 'create-account' && /Continue with Google|Continue with Apple/.test(button.textContent))
      ) {
        showNotice(root, 'External sign-in is not connected yet.')
      }
    }

    const onChange = async (event) => {
      const input = event.target
      if (!(input instanceof HTMLInputElement)) return

      if (screen === 'catalog-setup' && input.id === 'catalog-csv-upload') {
        const file = input.files?.[0]
        if (!file) return
        if (!file.name.toLowerCase().endsWith('.csv')) {
          showNotice(root, 'Choose a CSV file. Excel files are not supported in this local prototype.')
          input.value = ''
          return
        }
        try {
          const importedProducts = parseInventoryCsv(await file.text())
          await onOnboardingComplete?.({ intake_mode: 'import', importedProducts })
          window.location.hash = '#/dashboard'
        } catch (error) {
          showNotice(root, error.message || 'The catalog could not be imported.')
          input.value = ''
        }
        return
      }

      if (input.type !== 'radio') return

      const group = input.closest('#categoryPillGroup')
      if (!group) return

      group.querySelectorAll('.category-card').forEach((card) => {
        const selected = card.querySelector('input')?.checked
        card.classList.toggle('bg-primary-fixed/30', selected)
        card.classList.toggle('shadow-sm', selected)
        card.classList.toggle('bg-surface-container-low', !selected)

        const indicator = card.querySelector('.check-indicator')
        indicator?.classList.toggle('text-primary', selected)
        indicator?.classList.toggle('text-secondary', !selected)
        indicator?.classList.toggle('opacity-0', !selected)
      })
    }

    const onInput = () => updatePasswordFeedback(root, screen)

    const onSubmit = async (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return

      event.preventDefault()
      const values = Object.fromEntries(new FormData(form))

      if (screen === 'create-account') {
        const password = root.querySelector('#accountPassword')?.value || ''
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[\d\W]/.test(password)) {
          showNotice(root, 'Choose a password with at least 8 characters, an uppercase letter, and a number or symbol.')
          return
        }
        try {
          const result = await onAccountCreate?.({
            name: root.querySelector('#fullName')?.value || '',
            email: root.querySelector('#workEmail')?.value || '',
            password,
            workspaceName: root.querySelector('#workspaceName')?.value || '',
            role: root.querySelector('#userRole')?.value || '',
          })
          if (result?.error) {
            showNotice(root, result.error)
            return
          }
          window.location.hash = '#/workspace-setup'
        } catch (error) {
          showNotice(root, error.message || 'Account creation failed. Please try again.')
        }
      } else if (screen === 'workspace-setup') {
        if (!values.workspaceName?.trim() || !values.business_category || !values.team_scale || !values.current_tracker) {
          showNotice(root, 'Enter a workspace name and choose a business type, team size, and current tracking method.')
          return
        }
        try {
          await onStepComplete?.('workspace', values)
          window.location.hash = '#/inventory-profile'
        } catch (error) {
          showNotice(root, error.message || 'Workspace settings could not be saved.')
        }
      } else if (screen === 'inventory-profile') {
        const threshold = Number(root.querySelector('#threshold-input')?.value)
        if (!Number.isInteger(threshold) || threshold < 1 || threshold > 999) {
          showNotice(root, 'Set a minimum stock threshold between 1 and 999.')
          return
        }
        try {
          await onStepComplete?.('inventory', { ...values, threshold })
          window.location.hash = '#/catalog-setup'
        } catch (error) {
          showNotice(root, error.message || 'Inventory preferences could not be saved.')
        }
      } else if (screen === 'forgot-password') {
        showNotice(
          root,
          'Password recovery is a visual prototype; no email is sent because the backend is not connected.',
        )
      } else if (screen === 'sign-in') {
        try {
          const result = await onSignIn?.({
            email: values.email || '',
            password: values.password || '',
          })
          if (result?.error) {
            showNotice(root, result.error)
            return
          }
          if (result?.needsOnboarding) window.location.hash = '#/workspace-setup'
          else if (result?.account) window.location.hash = result.redirect || '#/dashboard'
        } catch (error) {
          showNotice(root, error.message || 'Sign-in failed. Please try again.')
        }
      } else if (screen === 'catalog-setup') {
        if (!values.intake_mode) {
          showNotice(root, 'Choose a catalog setup option to continue.')
          return
        }
        try {
          await onOnboardingComplete?.(values)
          window.location.hash = '#/dashboard'
        } catch (error) {
          showNotice(root, error.message || 'Setup could not be completed.')
        }
      } else if (screen === 'reset-password') {
        const password = root.querySelector('#new-password')?.value || ''
        const confirmation = root.querySelector('#confirm-password')?.value || ''
        const meetsRequirements =
          password.length >= 8 &&
          /[a-z]/.test(password) &&
          /[A-Z]/.test(password) &&
          /\d/.test(password) &&
          /[!@#$%^&*]/.test(password)

        if (!meetsRequirements) {
          showNotice(root, 'The password must meet all four security requirements.')
          return
        }
        if (password !== confirmation) {
          showNotice(root, 'The passwords do not match.')
          return
        }
        showNotice(root, 'Password updates require a connected authentication service.')
      }
    }

    updatePasswordFeedback(root, screen)
    if (screen === 'sign-in' || screen === 'create-account') {
      showNotice(
        root,
        'Demo mode: account data is stored in this browser only. There is no authentication server; this is not secure for real accounts.',
      )
    }
    root.addEventListener('click', onClick)
    root.addEventListener('change', onChange)
    root.addEventListener('input', onInput)
    root.addEventListener('submit', onSubmit)

    return () => {
      root.removeEventListener('click', onClick)
      root.removeEventListener('change', onChange)
      root.removeEventListener('input', onInput)
      root.removeEventListener('submit', onSubmit)
    }
  }, [screen, onAccountCreate, onSignIn, onStepComplete, onOnboardingComplete])

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />
}

export default OnboardingScreen
