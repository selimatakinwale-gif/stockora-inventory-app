import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { parseInventoryCsv } from '../../lib/inventoryCsv.js'

const templates = {
  overview: () => import('./screens/overview.html?raw').then((module) => module.default),
  'inventory-empty': () => import('./screens/inventory-empty.html?raw').then((module) => module.default),
  'add-item': () => import('./screens/add-item.html?raw').then((module) => module.default),
  'edit-item': () => import('./screens/edit-item.html?raw').then((module) => module.default),
  'adjust-stock': () => import('./screens/adjust-stock.html?raw').then((module) => module.default),
  inventory: () => import('./screens/inventory.html?raw').then((module) => module.default),
  categories: () => import('./screens/categories.html?raw').then((module) => module.default),
  intelligence: () => import('./screens/intelligence.html?raw').then((module) => module.default),
  analytics: () => import('./screens/analytics.html?raw').then((module) => module.default),
  activity: () => import('./screens/activity.html?raw').then((module) => module.default),
  settings: () => import('./screens/settings.html?raw').then((module) => module.default),
}

const routeByPath = {
  dashboard: 'overview',
  intelligence: 'intelligence',
  inventory: 'inventory',
  'stockora--inventory-empty-state---new-user': 'inventory',
  categories: 'categories',
  analytics: 'analytics',
  'activity-history': 'activity',
  settings: 'settings',
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function showNotice(root, message, role = 'status') {
  let notice = root.querySelector('[data-dashboard-notice]')
  if (!notice) {
    notice = document.createElement('p')
    notice.dataset.dashboardNotice = 'true'
    notice.className =
      'mx-6 my-3 rounded-lg border border-border-divider bg-surface-container-low px-4 py-3 text-body-md text-on-surface'
    notice.setAttribute('role', role)
    root.querySelector('main')?.prepend(notice)
  }
  notice.textContent = message
}

function currentProductId() {
  return new URLSearchParams(window.location.hash.split('?')[1] || '').get('id')
}

function getStatus(product) {
  if (Number(product.quantity) <= 0) return 'Out of Stock'
  if (Number(product.quantity) <= Number(product.threshold)) return 'Low Stock'
  return 'Optimal'
}

function productRow(product) {
  const status = getStatus(product)
  const color =
    status === 'Out of Stock'
      ? 'text-status-error'
      : status === 'Low Stock'
        ? 'text-status-warning'
        : 'text-status-success'
  return `<tr data-product-row="${escapeHtml(product.id)}" data-status="${escapeHtml(status)}" class="border-b border-border-divider hover:bg-surface-container-low/60">
    <td class="py-4 pl-6 pr-3 text-center"><input aria-label="Select ${escapeHtml(product.name)}" class="w-4 h-4 accent-primary" type="checkbox"></td>
    <td class="py-4 px-4"><div class="flex flex-col min-w-0"><span class="font-body-semibold text-body-semibold text-on-surface truncate">${escapeHtml(product.name)}</span><span class="font-label-sm text-label-sm text-text-secondary font-mono">${escapeHtml(product.sku)}</span></div></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm text-on-surface">${escapeHtml(product.category)}</span></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm text-on-surface">${escapeHtml(product.location || 'Main Warehouse')}</span></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm text-on-surface">${escapeHtml(product.bin || 'Unassigned')}</span></td>
    <td class="py-4 px-4"><span class="font-headline-sm text-headline-sm ${color}">${escapeHtml(product.quantity)}</span><span class="font-label-sm text-label-sm text-text-secondary"> / ${escapeHtml(product.threshold)}</span></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm text-on-surface">${escapeHtml(product.threshold)} ${escapeHtml(product.unit || 'units')}</span></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm text-on-surface">${Number(product.cost || 0).toFixed(2)}</span></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm text-on-surface">${Number(product.price || 0).toFixed(2)}</span></td>
    <td class="py-4 px-4"><span class="font-label-sm text-label-sm font-semibold ${color}">${status}</span></td>
    <td class="py-4 px-4"><div class="flex items-center gap-2"><button type="button" data-product-action="adjust" data-product-id="${escapeHtml(product.id)}" aria-label="Adjust stock for ${escapeHtml(product.name)}" class="rounded p-1 text-on-surface-variant hover:bg-surface-container"><span class="material-symbols-outlined">tune</span></button><button type="button" data-product-action="edit" data-product-id="${escapeHtml(product.id)}" aria-label="Edit ${escapeHtml(product.name)}" class="rounded p-1 text-on-surface-variant hover:bg-surface-container"><span class="material-symbols-outlined">edit</span></button><button type="button" data-product-action="delete" data-product-id="${escapeHtml(product.id)}" aria-label="Delete ${escapeHtml(product.name)}" class="rounded p-1 text-status-error hover:bg-error-container/40"><span class="material-symbols-outlined">delete</span></button></div></td>
  </tr>`
}

function overviewRow(product) {
  return `<tr class="border-b border-border-divider" data-product-row="${escapeHtml(product.id)}">
    <td class="px-4 py-3"><span class="font-body-semibold text-body-semibold">${escapeHtml(product.name)}</span><span class="block text-label-sm text-text-secondary">${escapeHtml(product.sku)}</span></td>
    <td class="px-4 py-3">${escapeHtml(product.category)}</td>
    <td class="px-4 py-3">${escapeHtml(product.quantity)}</td>
    <td class="px-4 py-3">${escapeHtml(product.threshold)}</td>
    <td class="px-4 py-3">${getStatus(product)}</td>
    <td class="px-4 py-3"><button type="button" data-product-action="adjust" data-product-id="${escapeHtml(product.id)}" class="text-primary hover:underline">Adjust</button></td>
  </tr>`
}

function categoryRow(product) {
  const status = getStatus(product)
  const color =
    status === 'Out of Stock'
      ? 'text-status-error'
      : status === 'Low Stock'
        ? 'text-status-warning'
        : 'text-status-success'
  return `<tr data-product-row="${escapeHtml(product.id)}" data-status="${escapeHtml(status)}" class="border-b border-border-divider hover:bg-surface-container-low/60">
    <td class="px-4 py-3"><span class="font-body-semibold text-body-semibold">${escapeHtml(product.name)}</span><span class="block text-label-sm text-text-secondary">${escapeHtml(product.sku)}</span></td>
    <td class="px-4 py-3">${escapeHtml(product.category)}</td>
    <td class="px-4 py-3">${escapeHtml(product.quantity)} ${escapeHtml(product.unit || 'units')}</td>
    <td class="px-4 py-3">${escapeHtml(product.threshold)}</td>
    <td class="px-4 py-3">${Number(product.cost || 0).toFixed(2)}</td>
    <td class="px-4 py-3">${Number(product.price || 0).toFixed(2)}</td>
    <td class="px-4 py-3">—</td>
    <td class="px-4 py-3"><span class="font-label-sm text-label-sm font-semibold ${color}">${status}</span></td>
    <td class="px-4 py-3"><button type="button" data-product-action="edit" data-product-id="${escapeHtml(product.id)}" class="text-primary hover:underline">Edit</button></td>
  </tr>`
}

function intelligenceRow(product) {
  const status = getStatus(product)
  const amount = Math.max(0, Number(product.threshold) * 2 - Number(product.quantity))
  return `<tr data-product-row="${escapeHtml(product.id)}" data-status="${escapeHtml(status)}" class="border-b border-border-divider">
    <td class="px-4 py-3"><input aria-label="Select ${escapeHtml(product.name)}" type="checkbox" class="accent-primary"></td>
    <td class="px-4 py-3"><span class="font-body-semibold text-body-semibold">${escapeHtml(product.name)}</span><span class="block text-label-sm text-text-secondary">${escapeHtml(product.sku)}</span></td>
    <td class="px-4 py-3">${escapeHtml(product.quantity)} ${escapeHtml(product.unit || 'units')}</td>
    <td class="px-4 py-3">${escapeHtml(product.threshold)}</td>
    <td class="px-4 py-3">Not configured</td>
    <td class="px-4 py-3">Unavailable</td>
    <td class="px-4 py-3">${amount} ${escapeHtml(product.unit || 'units')}</td>
    <td class="px-4 py-3">Not configured</td>
    <td class="px-4 py-3">${(amount * Number(product.cost || 0)).toFixed(2)}</td>
    <td class="px-4 py-3"><button type="button" data-product-action="adjust" data-product-id="${escapeHtml(product.id)}" class="text-primary hover:underline">Adjust stock</button></td>
  </tr>`
}

function getAttentionProducts(products) {
  return products
    .filter((product) => Number(product.quantity) <= Number(product.threshold))
    .sort((left, right) => {
      const urgency = Number(left.quantity) - Number(left.threshold) - (Number(right.quantity) - Number(right.threshold))
      return urgency || left.name.localeCompare(right.name)
    })
}

function getIntelligenceAnswer(query, products, events) {
  const normalized = query.toLowerCase()
  const attention = getAttentionProducts(products)

  if (/(sales|sold|revenue|highest recorded)/.test(normalized)) {
    return {
      summary: 'Sales and revenue history is not stored in this prototype, so I cannot identify top-selling products.',
      products: [],
    }
  }

  if (/(purchase order|supplier|vendor|shipment)/.test(normalized)) {
    return {
      summary: 'Supplier, shipment, and purchase-order services are not connected. No order has been drafted or sent.',
      products: [],
    }
  }

  if (/(discrepanc|cycle count|stock count)/.test(normalized)) {
    const counts = events.filter((entry) => /cycle count|count discrepancy/i.test(`${entry.action} ${entry.reason}`))
    return {
      summary: counts.length
        ? `${counts.length} saved activity record${counts.length === 1 ? '' : 's'} mention a cycle count or discrepancy.`
        : 'There are no cycle-count or discrepancy records in the activity saved on this device.',
      products: [],
    }
  }

  if (/(movement|activity|adjustment|departures|this week)/.test(normalized)) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentEvents = events.filter((entry) => new Date(entry.createdAt).getTime() >= weekAgo)
    return {
      summary: recentEvents.length
        ? `${recentEvents.length} inventory change${recentEvents.length === 1 ? '' : 's'} are recorded in the last seven days.`
        : 'No inventory changes are recorded for the last seven days.',
      events: recentEvents.slice(0, 5),
    }
  }

  if (/(low|attention|threshold|reorder|urgent|running out)/.test(normalized)) {
    return {
      summary: attention.length
        ? `${attention.length} of ${products.length} saved item${products.length === 1 ? '' : 's'} ${attention.length === 1 ? 'is' : 'are'} at or below its minimum stock threshold. This is a local inventory calculation, not an AI recommendation.`
        : products.length
          ? `None of your ${products.length} saved items are at or below their minimum stock thresholds.`
          : 'Your local inventory is empty. Add items to see stock-level insights here.',
      products: attention.slice(0, 5),
    }
  }

  return {
    summary: `This browser has ${products.length} saved inventory item${products.length === 1 ? '' : 's'}, including ${attention.length} at or below their minimum thresholds. The AI service is not connected, so I can only show these direct local inventory calculations.`,
    products: [],
  }
}

function intelligenceResponseHtml(query, products, events, time) {
  const result = getIntelligenceAnswer(query, products, events)
  const itemCards = (result.products || []).map((product) => {
    const outOfStock = Number(product.quantity) <= 0
    const status = outOfStock ? 'Out of Stock' : 'Low Stock'
    const statusClass = outOfStock ? 'text-status-error' : 'text-status-warning'
    const stockText = `${product.quantity} ${product.unit || 'units'}`
    return `<article class="p-space-md rounded-lg bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div class="flex items-start gap-space-md min-w-0">
        <div class="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-text-secondary shrink-0"><span class="material-symbols-outlined text-[22px]">${outOfStock ? 'error' : 'warning'}</span></div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-space-sm flex-wrap"><span class="font-body-semibold text-body-semibold text-on-surface">${escapeHtml(product.name)}</span><span class="font-label-sm text-label-sm ${statusClass}">${status}</span></div>
          <span class="font-label-sm text-label-sm text-text-secondary">SKU: ${escapeHtml(product.sku)} · ${escapeHtml(product.category || 'Uncategorized')}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between md:justify-end gap-space-md">
        <div class="flex flex-col md:text-right"><span class="font-data-metric text-data-metric ${statusClass}">${escapeHtml(stockText)}</span><span class="font-label-sm text-label-sm text-text-secondary">Minimum: ${escapeHtml(product.threshold)} ${escapeHtml(product.unit || 'units')}</span></div>
        <div class="flex items-center gap-space-xs"><button class="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface font-body-semibold text-body-semibold transition-colors" type="button" data-product-action="adjust" data-product-id="${escapeHtml(product.id)}">Adjust stock</button><button class="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface font-body-semibold text-body-semibold transition-colors" type="button" data-product-action="edit" data-product-id="${escapeHtml(product.id)}">View item</button></div>
      </div>
    </article>`
  }).join('')
  const eventRows = (result.events || []).map((entry) => `<li class="rounded-lg bg-surface-container-low px-space-md py-space-sm"><span class="font-body-semibold">${escapeHtml(entry.action)} · ${escapeHtml(entry.productName)}</span><span class="block text-label-sm text-text-secondary">${escapeHtml(entry.delta || '—')} · ${escapeHtml(new Date(entry.createdAt).toLocaleString())}</span></li>`).join('')

  return `<div class="flex justify-end items-start gap-space-sm pl-12">
      <div class="bg-inverse-surface px-space-lg py-space-md rounded-2xl rounded-tr-sm shadow-sm max-w-xl"><p class="font-body-md text-body-md font-medium text-white">${escapeHtml(query)}</p><span class="block text-right font-label-sm text-[11px] text-surface-container-highest mt-1">${escapeHtml(time)}</span></div>
      <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-1 shadow-sm"><span class="material-symbols-outlined text-[20px] text-secondary">person</span></div>
    </div>
    <div class="flex items-start gap-space-md pr-4">
      <div class="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5"><span class="material-symbols-outlined text-[20px]">psychology</span></div>
      <div class="flex flex-col gap-space-md flex-1 min-w-0">
        <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div class="flex flex-wrap items-center justify-between gap-space-sm"><span class="font-body-semibold text-body-semibold text-on-surface">Stockora local inventory preview</span><span class="font-label-sm text-label-sm text-text-secondary">${escapeHtml(time)} · ${products.length} saved SKUs</span></div>
          <p class="font-body-md text-body-md text-on-surface leading-relaxed">${escapeHtml(result.summary)}</p>
          ${itemCards ? `<div class="grid grid-cols-1 gap-space-sm">${itemCards}</div>` : ''}
          ${eventRows ? `<ul class="flex flex-col gap-space-xs">${eventRows}</ul>` : ''}
          <div class="flex items-start gap-space-xs p-space-sm rounded bg-surface-container text-text-secondary text-[12px]"><span class="material-symbols-outlined text-[16px] text-secondary">info</span><span>AI answers, sales history, supplier feeds, and purchase orders are not connected. No inventory changes are made by this preview.</span></div>
        </div>
      </div>
    </div>`
}

function renderIntelligence(root, products, events, account) {
  const firstName = account.name.trim().split(/\s+/)[0] || 'there'
  const greeting = root.querySelector('h2')
  if (greeting) greeting.textContent = `Hello ${firstName}.`
  greeting?.parentElement?.classList.add('flex-wrap')
  const breadcrumb = [...root.querySelectorAll('main nav')].find((item) =>
    item.textContent.includes('Console') && item.textContent.includes('Stockora Intelligence'),
  )
  breadcrumb?.classList.add('flex-wrap')
  const modelBadge = [...root.querySelectorAll('span')].find((item) => item.textContent.trim() === 'Deterministic Ledger v4.2')
  if (modelBadge) modelBadge.textContent = 'Browser-only demo'

  const workspacePill = [...root.querySelectorAll('span')].find((item) => item.textContent.includes('(142 SKUs, 6 Categories)'))
  if (workspacePill) {
    workspacePill.innerHTML = `${escapeHtml(account.workspaceName || account.name)} <span class="text-text-secondary">(${products.length} SKUs, ${new Set(products.map((product) => product.category).filter(Boolean)).size} Categories)</span>`
  }

  const userName = [...root.querySelectorAll('span')].find((item) => item.textContent.trim() === 'Selimat Akinwale')
  if (userName) userName.textContent = account.name
  const workspaceNames = [...root.querySelectorAll('span, p')].filter((item) => item.textContent.trim() === 'Bloom & Craft')
  workspaceNames.forEach((item) => { item.textContent = account.workspaceName || account.name })

  const intro = [...root.querySelectorAll('p')].find((item) => item.textContent.includes('encrypted local inventory state'))
  if (intro) intro.textContent = 'This preview can calculate stock thresholds and summarize activity saved in this browser. AI, backend sync, sales, and supplier data are not connected.'
  const subtitle = [...root.querySelectorAll('p')].find((item) => item.textContent.includes('Natural-language queries grounded in live stock records'))
  if (subtitle) subtitle.textContent = 'Review stock thresholds and recorded movements from the inventory saved in this browser.'
  const queryInput = root.querySelector('#userQueryInput')
  if (queryInput) {
    queryInput.placeholder = 'Ask about stock levels or recorded inventory changes...'
    queryInput.classList.add('min-w-0')
  }
  const queryForm = root.querySelector('#assistantQueryForm')
  const queryRow = queryForm?.querySelector(':scope > div.flex.items-center')
  queryRow?.classList.add('min-w-0')
  queryForm?.querySelectorAll('button[title="Voice dictation"], button[title="Attach item or batch SKU"]').forEach((button) => {
    button.classList.remove('w-10', 'h-10')
    button.classList.add('w-8', 'h-8', 'sm:w-10', 'sm:h-10')
  })
  const sendButton = queryForm?.querySelector('button[type="submit"]')
  if (sendButton) {
    sendButton.classList.remove('px-space-lg')
    sendButton.classList.add('px-2', 'sm:px-space-lg')
  }

  const syncLabel = [...root.querySelectorAll('span')].find((item) => item.textContent.trim() === 'Live ledger sync')
  if (syncLabel) syncLabel.textContent = 'Data source'
  const ledgerHeading = [...root.querySelectorAll('h3')].find((item) => item.textContent.trim() === 'Ledger & Audit Integrity')
  if (ledgerHeading) ledgerHeading.textContent = 'Browser Data & Limits'
  const groundingNote = [...root.querySelectorAll('span')].find((item) => item.textContent.includes('Grounded exclusively in your verified workspace ledger'))
  if (groundingNote) groundingNote.textContent = 'Calculations use inventory and activity saved in this browser.'
  const warehouseLabel = [...root.querySelectorAll('span')].find((item) => item.textContent.trim() === 'Active Warehouse Replica')
  if (warehouseLabel) warehouseLabel.textContent = 'Data location'
  const accessibilityNote = [...root.querySelectorAll('span')].find((item) => item.textContent.includes('Target WCAG 2.2 AA compliant'))
  if (accessibilityNote) accessibilityNote.textContent = 'Press Esc to clear'

  root.querySelectorAll('span').forEach((item) => {
    if (item.textContent.trim() === '100% Ledger Grounded') item.textContent = 'Local inventory preview'
    if (item.textContent.trim() === '142 SKUs') item.textContent = `${products.length} SKUs`
    if (item.textContent.trim() === '12 mins ago') item.textContent = 'This device'
    if (item.textContent.trim() === 'Node-LON-04 #verified') item.textContent = 'Browser-local data'
  })

  const liveDot = root.querySelector('.animate-pulse.bg-status-success')
  if (liveDot) liveDot.classList.remove('animate-pulse', 'bg-status-success')

  const stream = root.querySelector('#conversationStream')
  if (stream) {
    stream.setAttribute('aria-live', 'polite')
    stream.innerHTML = intelligenceResponseHtml(
      'Which products are running low and need my attention today?',
      products,
      events,
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    )
  }
}

function configureIntelligenceNavigation(root) {
  const shell = root.querySelector(':scope > div.pl-64')
  const sidebar = root.querySelector('aside.fixed')
  const header = root.querySelector('header')
  const main = root.querySelector('main')
  if (!shell || !sidebar || !header || !main) return

  shell.classList.remove('pl-64')
  shell.classList.add('pl-0', 'lg:pl-64')
  sidebar.classList.add('hidden', 'lg:flex')
  header.classList.remove('left-64')
  header.classList.add('left-0', 'lg:left-64')
  main.classList.remove('pt-16')
  main.classList.add('pt-28', 'lg:pt-16')

  const desktopNav = header.querySelector('div > div.flex.items-center.gap-space-lg')
  desktopNav?.classList.add('hidden', 'lg:flex')
  const searchLabel = [...header.querySelectorAll('span')].find((item) => item.textContent.includes('Quick Search (⌘K)'))
  const search = searchLabel?.closest('div')
  search?.classList.add('hidden', 'sm:flex')

  if (!root.querySelector('#intelligence-mobile-nav')) {
    const nav = document.createElement('nav')
    nav.id = 'intelligence-mobile-nav'
    nav.dataset.activeClasses = 'text-primary font-body-semibold'
    nav.className = 'fixed top-16 left-0 right-0 z-30 flex items-center gap-1 overflow-x-auto bg-surface-container-low px-3 py-2 shadow-sm lg:hidden'
    const links = [
      ['dashboard', 'Overview'],
      ['intelligence', 'Intelligence'],
      ['inventory', 'Inventory'],
      ['categories', 'Categories'],
      ['analytics', 'Reports'],
      ['activity-history', 'Activity'],
      ['settings', 'Settings'],
    ]
    links.forEach(([path, label]) => {
      const link = document.createElement('a')
      link.href = '#'
      link.dataset.path = path
      link.className = 'shrink-0 rounded-lg px-3 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-high'
      link.textContent = label
      nav.append(link)
    })
    header.after(nav)
  }
}

function renderIntelligenceHistory(root, history, showAll) {
  const heading = [...root.querySelectorAll('h3')].find((item) => item.textContent.trim() === 'Recent Intelligence Queries')
  const titleRow = heading?.closest('div.flex.items-center.justify-between')
  const list = titleRow?.nextElementSibling
  if (!list) return

  list.replaceChildren()
  list.classList.toggle('max-h-72', showAll)
  list.classList.toggle('overflow-y-auto', showAll)
  const toggleButton = titleRow.querySelector('button')
  if (toggleButton) toggleButton.textContent = showAll ? 'Show Recent' : 'View All'
  if (!history.length) {
    const empty = document.createElement('p')
    empty.className = 'text-label-sm text-text-secondary'
    empty.textContent = 'Questions asked during this visit will appear here.'
    list.append(empty)
    return
  }

  history.slice(0, showAll ? history.length : 5).forEach(({ query, time }) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.intelligenceQuery = query
    button.className = 'w-full text-left p-space-sm rounded-lg hover:bg-surface-container transition-colors'
    const question = document.createElement('span')
    question.className = 'block font-body-semibold text-body-semibold text-on-surface text-[13px]'
    question.textContent = query
    const timestamp = document.createElement('span')
    timestamp.className = 'block text-[11px] text-text-secondary font-label-sm'
    timestamp.textContent = `This visit, ${time} · local preview`
    button.append(question, timestamp)
    list.append(button)
  })
}

function analyticsRow(product) {
  return `<tr data-product-row="${escapeHtml(product.id)}" data-status="${escapeHtml(getStatus(product))}" class="border-b border-border-divider">
    <td class="px-4 py-3"><span class="font-body-semibold text-body-semibold">${escapeHtml(product.name)}</span><span class="block text-label-sm text-text-secondary">${escapeHtml(product.sku)}</span></td>
    <td class="px-4 py-3">${escapeHtml(product.location || 'Main Warehouse')}</td>
    <td class="px-4 py-3">${escapeHtml(product.quantity)}</td>
    <td class="px-4 py-3">Not configured</td>
    <td class="px-4 py-3">Unavailable</td>
    <td class="px-4 py-3">Not configured</td>
    <td class="px-4 py-3"><button type="button" data-product-action="adjust" data-product-id="${escapeHtml(product.id)}" class="text-primary hover:underline">Adjust</button></td>
  </tr>`
}

function activityRow(entry) {
  const date = new Date(entry.createdAt)
  const formattedDate = Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
  return `<tr class="border-b border-border-divider">
    <td class="px-4 py-3"><span>${escapeHtml(formattedDate)}</span><span class="block text-label-sm text-text-secondary">${escapeHtml(entry.id.slice(0, 8))}</span></td>
    <td class="px-4 py-3">${escapeHtml(entry.productName)}<span class="block text-label-sm text-text-secondary">${escapeHtml(entry.sku || '')}</span></td>
    <td class="px-4 py-3">${escapeHtml(entry.action)}</td>
    <td class="px-4 py-3">${escapeHtml(entry.delta ?? '—')}</td>
    <td class="px-4 py-3">${escapeHtml(entry.reason || 'User action')}</td>
    <td class="px-4 py-3">${escapeHtml(entry.user || 'You')}</td>
    <td class="px-4 py-3">Local log</td>
  </tr>`
}

function renderRows(root, screen, products, events, account) {
  if (['inventory', 'overview', 'categories', 'intelligence', 'analytics'].includes(screen)) {
    const body = root.querySelector('tbody')
    if (!body) return
    const renderRow = {
      inventory: productRow,
      overview: overviewRow,
      categories: categoryRow,
      intelligence: intelligenceRow,
      analytics: analyticsRow,
    }[screen]
    const rows = products.map(renderRow)
    body.innerHTML = rows.length
      ? rows.join('')
      : `<tr><td class="px-4 py-6 text-center text-text-secondary" colspan="${{ inventory: 11, overview: 6, categories: 9, intelligence: 10, analytics: 7 }[screen]}">No inventory items yet. Add an item to start tracking stock.</td></tr>`
  }

  if (screen === 'activity') {
    const body = root.querySelector('tbody')
    if (!body) return
    body.innerHTML = events.length
      ? events.map(activityRow).join('')
      : '<tr><td class="px-4 py-6 text-center text-text-secondary" colspan="7">No activity has been recorded yet.</td></tr>'
  }

  if (screen === 'overview') {
    const counts = {
      total: products.length,
      inStock: products.filter((product) => Number(product.quantity) > 0).length,
      low: products.filter((product) => Number(product.quantity) > 0 && Number(product.quantity) <= Number(product.threshold)).length,
      out: products.filter((product) => Number(product.quantity) <= 0).length,
    }
    const categoriesCount = new Set(products.map((product) => product.category)).size
    const updateMetric = (label, value, suffix) => {
      const labelElement = [...root.querySelectorAll('span')].find((item) => item.textContent.trim() === label)
      const card = labelElement?.closest('.bg-surface-white')
      const number = card?.querySelector('.font-headline-lg')
      const textNode = [...(number?.childNodes || [])].find((node) => node.nodeType === Node.TEXT_NODE)
      if (textNode) textNode.textContent = `${value}${suffix ? ' ' : ''}`
      if (suffix && number) {
        const unit = number.querySelector('span')
        if (unit) unit.textContent = suffix
      }
    }
    updateMetric('Total Items', counts.total, 'SKUs')
    updateMetric('In Stock', counts.inStock)
    updateMetric('Low Stock Alert', counts.low, 'items')
    updateMetric('Out of Stock', counts.out, 'items')

    const totalCard = [...root.querySelectorAll('span')].find((item) => item.textContent.trim() === 'Total Items')?.closest('.bg-surface-white')
    const categoryCaption = [...(totalCard?.querySelectorAll('p') || [])].find((item) => item.textContent.includes('Active inventory'))
    if (categoryCaption) categoryCaption.textContent = `Active inventory across ${categoriesCount} categories`

    const auditText = [...root.querySelectorAll('span, p')].find((item) => item.textContent.includes('Last ledger audit:'))
    if (auditText) auditText.textContent = events.length
      ? `Last ledger activity: ${new Date(events[0].createdAt).toLocaleString()}`
      : 'No stock movements have been logged yet'

    const queueText = [...root.querySelectorAll('span')].find((item) => item.textContent.includes('Reorder queue:'))
    if (queueText) queueText.textContent = 'Purchase orders are not connected'

    const syncText = [...root.querySelectorAll('*')].find((item) => item.childElementCount === 0 && item.textContent.trim() === 'Live System Sync')
    if (syncText) syncText.textContent = 'Browser-only demo'

    const workspaceText = [...root.querySelectorAll('*')].find((item) => item.childElementCount === 0 && item.textContent.startsWith('Real-time visibility for '))
    if (workspaceText) workspaceText.textContent = `Inventory for ${account.workspaceName || account.name}`
  }
}

function setActiveNavigation(root, screen) {
  const activePath =
    screen.startsWith('inventory') || ['add-item', 'edit-item', 'adjust-stock'].includes(screen)
      ? 'inventory'
      : screen === 'overview'
        ? 'dashboard'
        : screen === 'activity'
          ? 'activity-history'
          : screen

  root.querySelectorAll('nav[data-active-classes] a[data-path]').forEach((link) => {
    const isActive = routeByPath[link.dataset.path] === activePath
    const activeBackground = screen === 'intelligence' ? 'bg-surface-container' : 'bg-primary-container'
    const activeText = screen === 'intelligence' ? 'text-on-surface' : 'text-on-primary'
    link.classList.toggle(activeBackground, isActive)
    link.classList.toggle(activeText, isActive)
    link.classList.toggle('font-semibold', isActive)
    if (screen !== 'intelligence') link.classList.toggle('shadow-sm', isActive)
    if (isActive) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
    if (isActive) {
      link.classList.remove(
        'bg-primary-container',
        'text-on-primary',
        'text-on-surface-variant',
        'hover:bg-surface-container',
        'hover:bg-surface-container-high',
        'hover:text-on-surface',
      )
    }
  })
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function getButtonLabel(button) {
  const copy = button.cloneNode(true)
  copy.querySelectorAll('.material-symbols-outlined, svg').forEach((icon) => icon.remove())
  return copy.textContent.replace(/\s+/g, ' ').trim().toLowerCase()
}

function DashboardFlow({
  screen,
  account,
  products,
  events,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustProduct,
  onImportProducts,
  onUpdateProfile,
  onSignOut,
}) {
  const rootRef = useRef(null)
  const templateName = screen === 'inventory' && products.length === 0 ? 'inventory-empty' : screen
  const loadTemplate = templates[templateName]
  const [loadedTemplate, setLoadedTemplate] = useState({ name: '', html: '', error: '' })
  const template = loadedTemplate.name === templateName ? loadedTemplate.html : ''

  useEffect(() => {
    let active = true
    if (loadTemplate) loadTemplate().then(
      (html) => {
        if (active) setLoadedTemplate({ name: templateName, html, error: '' })
      },
      (error) => {
        if (active) setLoadedTemplate({ name: templateName, html: '', error: error.message })
      },
    )
    return () => {
      active = false
    }
  }, [templateName, loadTemplate])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (loadedTemplate.name !== templateName || !template) return undefined
    if (!root) return undefined

    renderRows(root, screen, products, events, account)
    const queryHistory = []
    let showAllQueries = false
    let conversationCleared = false
    if (screen === 'analytics') {
      showNotice(root, 'The charts are part of the design preview; sales, vendor, and forecasting feeds are not connected. The item table uses your local inventory.')
    }
    if (screen === 'intelligence') {
      configureIntelligenceNavigation(root)
      renderIntelligence(root, products, events, account)
      renderIntelligenceHistory(root, queryHistory, showAllQueries)
      showNotice(root, 'Local preview only: AI, backend sync, sales history, and supplier services are not connected.')
    }
    setActiveNavigation(root, screen)
    if (screen === 'categories') {
      showNotice(root, 'Category item lists use your local inventory. Sales velocity and supplier analytics are not connected.')
    }

    const activeId = currentProductId()
    const selectedProduct = products.find((product) => product.id === activeId)
    if (screen === 'edit-item' && selectedProduct) {
      const fields = {
        itemName: selectedProduct.name,
        skuCode: selectedProduct.sku,
        category: selectedProduct.category,
        description: selectedProduct.description,
        uom: selectedProduct.unit,
        lowStockThreshold: selectedProduct.threshold,
        warehouseBin: selectedProduct.bin,
        costPrice: selectedProduct.cost,
        sellingPrice: selectedProduct.price,
        batchId: selectedProduct.batch,
      }
      Object.entries(fields).forEach(([id, value]) => {
        const field = root.querySelector(`#${id}`)
        if (!field || value === undefined) return
        if (field instanceof HTMLSelectElement) {
          const option = [...field.options].find((item) =>
            item.value === String(value) ||
            item.textContent.trim() === String(value) ||
            item.textContent.toLowerCase().includes(String(value).toLowerCase()),
          )
          field.value = option?.value || ''
        } else {
          field.value = value
        }
      })
    }

    if (screen === 'settings') {
      const workspace = root.querySelector('#ws-name')
      const email = root.querySelector('#email-address')
      if (workspace) workspace.value = account.workspaceName || account.name
      if (email) email.value = account.email
    }

    const filterRows = (query = '', filter = '') => {
      const normalizedQuery = query.trim().toLowerCase()
      root.querySelectorAll('[data-product-row]').forEach((row) => {
        const matchesText = row.textContent.toLowerCase().includes(normalizedQuery)
        const status = row.dataset.status || ''
        const matchesFilter =
          !filter ||
          filter === 'all' ||
          (filter.includes('low') && status === 'Low Stock') ||
          (filter.includes('out') && status === 'Out of Stock') ||
          (filter.includes('optimal') && status === 'Optimal') ||
          (filter === 'in stock' && status !== 'Out of Stock') ||
          (filter === 'needs attention' && status !== 'Optimal') ||
          row.textContent.toLowerCase().includes(filter)
        row.hidden = !matchesText || !matchesFilter
      })
    }

    let activeFilter = ''
    const onInput = (event) => {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || input.type !== 'text' || !input.placeholder.toLowerCase().includes('search')) return
      filterRows(input.value, activeFilter)
    }

    const onKeyDown = (event) => {
      if (screen === 'intelligence' && event.key === 'Escape' && event.target instanceof HTMLInputElement && event.target.id === 'userQueryInput') {
        event.target.value = ''
      }
    }

    const onChange = async (event) => {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || input.type !== 'file' || !input.files?.[0]) return
      const file = input.files[0]
      if (!/\.csv$/i.test(file.name)) {
        showNotice(root, 'Choose a .csv file. Excel workbooks are not supported by this browser-only import.', 'alert')
        input.remove()
        return
      }

      try {
        const content = await file.text()
        const parsed = parseInventoryCsv(content)
        const result = await onImportProducts(parsed)
        if (result?.error) showNotice(root, result.error, 'alert')
        else showNotice(root, `${result.count} inventory item${result.count === 1 ? '' : 's'} imported from ${file.name}.`)
      } catch (error) {
        showNotice(root, error.message || 'The CSV file could not be imported.', 'alert')
      } finally {
        input.remove()
      }
    }

    const onClick = async (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a')
      if (link?.dataset.path) {
        const nextScreen = routeByPath[link.dataset.path]
        if (nextScreen) {
          event.preventDefault()
          window.location.hash = `#/dashboard/${nextScreen === 'overview' ? '' : nextScreen}`.replace(/\/$/, '')
          return
        }
      }

      const button = target.closest('button')
      if (!button) return
      const label = getButtonLabel(button)
      const action = button.dataset.productAction
      const product = products.find((item) => item.id === button.dataset.productId)

      if (screen === 'intelligence') {
        if (button.id === 'clearChatBtn') {
          queryHistory.length = 0
          showAllQueries = false
          conversationCleared = true
          const stream = root.querySelector('#conversationStream')
          if (stream) {
            stream.innerHTML = '<div class="p-space-lg rounded-xl bg-surface-container-lowest text-center text-text-secondary shadow-sm"><span class="material-symbols-outlined text-[32px] mb-2 text-primary">chat_bubble_outline</span><p class="font-body-md text-body-md">Conversation cleared. Ask a question to view a local inventory calculation.</p></div>'
          }
          renderIntelligenceHistory(root, queryHistory, showAllQueries)
          return
        }

        if (button.dataset.intelligenceQuery) {
          const input = root.querySelector('#userQueryInput')
          if (input) {
            input.value = button.dataset.intelligenceQuery
            input.focus()
          }
          return
        }

        if (button.title === 'Voice dictation' || button.title === 'Attach item or batch SKU') {
          showNotice(root, 'Voice input and item attachment are not available in this local prototype.')
          return
        }

        if (button.title === 'Model & Ledger Permissions') {
          showNotice(root, 'No AI model or remote ledger service is connected. Inventory data is stored in this browser.')
          return
        }

        if (button.title === 'Export Q&A Transcript' || label.includes('export')) {
          const transcript = root.querySelector('#conversationStream')?.innerText.trim()
          if (!transcript) {
            showNotice(root, 'There is no conversation to export yet.')
            return
          }
          const url = URL.createObjectURL(new Blob([transcript], { type: 'text/plain;charset=utf-8' }))
          const link = document.createElement('a')
          link.href = url
          link.download = 'stockora-intelligence-transcript.txt'
          link.click()
          URL.revokeObjectURL(url)
          showNotice(root, 'Conversation transcript downloaded.')
          return
        }

        if (label === 'view all') {
          if (queryHistory.length > 5) {
            showAllQueries = true
            renderIntelligenceHistory(root, queryHistory, showAllQueries)
          } else {
            root.querySelector('#conversationStream')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          return
        }

        if (label === 'show recent') {
          showAllQueries = false
          renderIntelligenceHistory(root, queryHistory, showAllQueries)
          return
        }

        if (button.closest('#quickSuggestionsList') || button.classList.contains('follow-up-chip')) {
          const input = root.querySelector('#userQueryInput')
          if (input) {
            input.value = label
            input.focus()
          }
          return
        }

        if (/purchase order|supplier shipments|vendor terms/.test(label)) {
          showNotice(root, 'Supplier and purchase-order services are not connected. No order was created or sent.')
          return
        }
      }

      if (action && product) {
        if (action === 'edit') window.location.hash = `#/dashboard/edit-item?id=${encodeURIComponent(product.id)}`
        if (action === 'adjust') window.location.hash = `#/dashboard/adjust-stock?id=${encodeURIComponent(product.id)}`
        if (action === 'delete' && window.confirm(`Delete "${product.name}" from this inventory?`)) {
          onDeleteProduct(product.id)
        }
        return
      }

      if (/add (your first )?item|add new item|add sku to category/.test(label)) {
        window.location.hash = '#/dashboard/add-item'
        return
      }
      if (label.includes('import')) {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv,text/csv'
        input.hidden = true
        root.append(input)
        input.click()
        return
      }
      if (label === 'cancel' || label.startsWith('discard changes')) {
        window.location.hash = '#/dashboard/inventory'
        return
      }
      if (label.includes('auto-gen')) {
        const sku = root.querySelector('#sku-code')
        if (sku) sku.value = `STK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        return
      }
      if (label.includes('save draft') || label.includes('save as draft')) {
        showNotice(root, 'Draft saving is not configured. Complete the required fields and use Save & Add Item instead.')
        return
      }
      if (label.includes('archive')) {
        if (selectedProduct && window.confirm(`Delete "${selectedProduct.name}" from this inventory?`)) {
          onDeleteProduct(selectedProduct.id)
          window.location.hash = '#/dashboard/inventory'
        }
        return
      }
      if (label.includes('sign out')) {
        onSignOut()
        return
      }
      if (label.includes('export')) {
        if (screen === 'activity') {
          downloadCsv('stockora-activity.csv', [
            ['Date', 'Action', 'Item', 'SKU', 'Quantity change', 'Reason', 'Operator'],
            ...events.map((entry) => [entry.createdAt, entry.action, entry.productName, entry.sku, entry.delta, entry.reason, entry.user]),
          ])
        } else {
          const filename = screen === 'settings' ? 'stockora-workspace-inventory.csv' : 'stockora-inventory.csv'
          downloadCsv(filename, [
            ['Name', 'SKU', 'Category', 'Quantity', 'Threshold', 'Location', 'Bin'],
            ...products.map((item) => [item.name, item.sku, item.category, item.quantity, item.threshold, item.location, item.bin]),
          ])
        }
        return
      }
      if (label.includes('print')) {
        window.print()
        return
      }
      if (screen === 'adjust-stock' && (label.includes('confirm & apply adjustment') || label.includes('confirm & log adjustment'))) {
        if (!selectedProduct) {
          showNotice(root, 'Choose an inventory item before adjusting stock.', 'alert')
          return
        }
        const count = Number(root.querySelector('#physicalCountInput')?.value)
        const mode = root.querySelector('input[name="adjustment_mode"]:checked')?.value || 'cycle'
        if (!Number.isInteger(count) || count < 0) {
          showNotice(root, 'Enter a whole-number stock quantity of zero or more.', 'alert')
          return
        }
        const result = onAdjustProduct(selectedProduct.id, count, mode)
        if (result?.error) {
          showNotice(root, result.error, 'alert')
          return
        }
        window.location.hash = '#/dashboard/inventory'
        return
      }
      if (screen === 'adjust-stock' && (label === 'add' || label === 'remove')) {
        const input = root.querySelector('#physicalCountInput')
        if (input) input.value = String(Math.max(0, Number(input.value || 0) + (label === 'add' ? 1 : -1)))
        return
      }
      if (screen === 'settings' && label.includes('save changes')) {
        const workspaceName = root.querySelector('#ws-name')?.value.trim()
        const address = root.querySelector('#facility-address')?.value.trim()
        if (!workspaceName) {
          showNotice(root, 'Workspace name is required.', 'alert')
          return
        }
        onUpdateProfile({ workspaceName, facilityAddress: address })
        showNotice(root, 'Workspace profile saved on this device.')
        return
      }
      if (label.includes('ask stockora') || label.includes('which products') || label.includes('summarise stock') || label.includes('which items') || label.includes('which products have')) {
        showNotice(root, 'Stockora Intelligence is a design preview and has no AI service connected.')
        return
      }
      if (/restock|triage|review triage|configure threshold|configure polic|audit reconciliation/.test(label)) {
        window.location.hash = '#/dashboard/intelligence'
        return
      }
      if (label.includes('generate') && label.includes('po')) {
        showNotice(root, 'Purchase-order delivery is not connected. No order was created or sent.', 'alert')
        return
      }
      if (label.includes('view all') || label.includes('triage now') || label.includes('view all inventory depletions')) {
        window.location.hash = '#/dashboard/intelligence'
        return
      }
      if (label.includes('run simulation') || label.includes('simulate impact') || label.includes('deploy bundle')) {
        showNotice(root, 'Forecasting and promotion simulations are not connected to an inventory analytics service.')
        return
      }
      if (label.includes('save') && screen !== 'settings' && screen !== 'add-item' && screen !== 'edit-item') {
        showNotice(root, 'This screen has no editable settings to save.')
        return
      }

      if (/^(all\b|in stock|low stock|out(?: of stock)?|optimal|needs attention|high velocity|overstocked|skincare|packaging|essential|dry ingredients)/.test(label)) {
        activeFilter = label.startsWith('in stock')
          ? 'in stock'
          : label.startsWith('needs attention')
            ? 'needs attention'
            : label.startsWith('out')
              ? 'out of stock'
              : label.startsWith('low')
                ? 'low stock'
                : label.startsWith('optimal')
                  ? 'optimal'
                  : label.startsWith('all')
                    ? ''
                    : label.replace(/\s*\(\d+\).*/, '')
        if (activeFilter === 'high velocity' || activeFilter === 'overstocked') {
          showNotice(root, 'Velocity and overstock filters need sales-history data, which is not connected.')
          return
        }
        filterRows(root.querySelector('input[placeholder*="Search"]')?.value || '', activeFilter)
        const group = button.parentElement
        group?.querySelectorAll('button').forEach((sibling) => sibling.classList.toggle('bg-primary-fixed', sibling === button))
        return
      }

      if (button.id === 'loadDemoBtn') {
        showNotice(root, 'Demo catalog loading is available during account setup. Sign out and choose the sample catalog option to start fresh.')
        return
      }

      showNotice(root, `Action not implemented in the local prototype: ${label}. No data was changed.`, 'alert')
    }

    const onSubmit = async (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return
      event.preventDefault()

      if (screen === 'intelligence' && form.id === 'assistantQueryForm') {
        const input = root.querySelector('#userQueryInput')
        const query = input?.value.trim()
        if (!query) {
          showNotice(root, 'Enter a question or choose a suggested query.')
          input?.focus()
          return
        }
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const stream = root.querySelector('#conversationStream')
        if (!stream) {
          showNotice(root, 'The conversation panel is unavailable. Reload the page and try again.', 'alert')
          return
        }
        if (conversationCleared) {
          stream.replaceChildren()
          conversationCleared = false
        }
        stream.insertAdjacentHTML('beforeend', intelligenceResponseHtml(query, products, events, time))
        input.value = ''
        queryHistory.unshift({ query, time })
        if (queryHistory.length > 50) queryHistory.pop()
        renderIntelligenceHistory(root, queryHistory, showAllQueries)
        stream.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        return
      }

      if (screen === 'add-item') {
        const fieldValue = (id) => root.querySelector(`#${id}`)?.value || ''
        const name = fieldValue('item-name').trim()
        const category = fieldValue('category-select').trim()
        const quantity = Number(fieldValue('initial-qty'))
        const threshold = Number(fieldValue('warning-threshold'))
        if (!name || !category || !Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(threshold) || threshold < 1) {
          showNotice(root, 'Enter an item name and category, a whole-number quantity, and a minimum stock threshold of at least 1.', 'alert')
          return
        }
        const result = await onAddProduct({
          name,
          sku: fieldValue('sku-code').trim() || `STK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          category: root.querySelector('#category-select')?.selectedOptions[0]?.textContent.trim() || category,
          quantity,
          threshold,
          unit: fieldValue('uom-select') || 'units',
          location: 'Main Warehouse',
          bin: fieldValue('bin-location'),
          cost: Number(fieldValue('cost-price')) || 0,
          price: Number(fieldValue('sell-price')) || 0,
          description: fieldValue('item-desc'),
          batch: fieldValue('batch-num'),
        })
        if (result?.error) {
          showNotice(root, result.error, 'alert')
          return
        }
        window.location.hash = '#/dashboard/inventory'
        return
      }

      if (screen === 'edit-item') {
        if (!selectedProduct) {
          showNotice(root, 'Select a saved inventory item before editing.', 'alert')
          return
        }
        const name = root.querySelector('#itemName')?.value.trim()
        const category = root.querySelector('#category')?.value.trim()
        const threshold = Number(root.querySelector('#lowStockThreshold')?.value)
        if (!name || !category || !Number.isInteger(threshold) || threshold < 1) {
          showNotice(root, 'Enter an item name, category, and a minimum stock threshold of at least 1.', 'alert')
          return
        }
        onUpdateProduct(selectedProduct.id, {
          name,
          category: root.querySelector('#category')?.selectedOptions[0]?.textContent.trim() || category,
          threshold,
          unit: root.querySelector('#uom')?.value || selectedProduct.unit,
          bin: root.querySelector('#warehouseBin')?.value || '',
          cost: Number(root.querySelector('#costPrice')?.value) || 0,
          price: Number(root.querySelector('#sellingPrice')?.value) || 0,
          description: root.querySelector('#description')?.value || '',
          batch: root.querySelector('#batchId')?.value || '',
        })
        window.location.hash = '#/dashboard/inventory'
      }
    }

    root.addEventListener('click', onClick)
    root.addEventListener('input', onInput)
    root.addEventListener('keydown', onKeyDown)
    root.addEventListener('change', onChange)
    root.addEventListener('submit', onSubmit)
    return () => {
      root.removeEventListener('click', onClick)
      root.removeEventListener('input', onInput)
      root.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('change', onChange)
      root.removeEventListener('submit', onSubmit)
    }
  }, [
    screen,
    template,
    templateName,
    loadedTemplate.name,
    account,
    products,
    events,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onAdjustProduct,
    onImportProducts,
    onUpdateProfile,
    onSignOut,
  ])

  if (loadedTemplate.error && loadedTemplate.name === templateName) {
    return <p className="m-6 rounded-lg border border-status-error bg-white p-4 text-status-error" role="alert">{loadedTemplate.error}</p>
  }
  if (!loadTemplate) {
    return <p className="m-6 rounded-lg border border-status-error bg-white p-4 text-status-error" role="alert">This dashboard page is not available.</p>
  }
  if (!template) return <div className="min-h-screen bg-surface px-6 py-10" aria-live="polite">Loading Stockora…</div>

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: template }} />
}

export default DashboardFlow
