import { useEffect } from 'react'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing & Plans', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

const featureCards = [
  {
    icon: 'table_view',
    title: 'Real-Time Stock Registry',
    description:
      'Instant visibility into quantities, lot codes, storage bays, and valuation across all locations with intuitive visual filtering.',
  },
  {
    icon: 'warning_amber',
    title: 'Proactive Low-Stock Triggers',
    description:
      'Automated safety floor alerts and runway projections before you run out. Never lose sales to unexpected shelf shortages.',
  },
  {
    icon: 'receipt_long',
    title: 'Audit-Grade Ledger Movements',
    description:
      'Tamper-evident recording of every inbound delivery, scrap loss, and cycle count reconciliation tied directly to team operators.',
  },
  {
    icon: 'shopping_cart_checkout',
    title: 'One-Click PO & Replenishment',
    description:
      'Batch supplier orders and triage depleted items in seconds. Turn low-stock alerts straight into clean purchasing logs.',
  },
]

const serviceItems = [
  {
    icon: 'storefront',
    title: 'Boutique Retail & Specialty Stores',
    description:
      'Fast handheld scanning, printable shelf labels, and low-friction restock logs directly from iPads and mobile handhelds.',
  },
  {
    icon: 'biotech',
    title: 'D2C Brands & Formulators',
    description:
      'Lot and batch traceability, expiry alerts, and strict ingredient compliance logs without messy spreadsheet formulas.',
  },
  {
    icon: 'warehouse',
    title: 'Small Warehouses & Fulfillment Hubs',
    description:
      'Multi-bay bin mapping, continuous cycle audits, and real-time ledger sync across active team shifts.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Add Your Items',
    description:
      'Quick bulk import via CSV/Excel or add SKUs one by one with auto-generated barcodes and designated bin locations.',
    note: '1-click spreadsheet importer included',
    icon: 'upload_file',
  },
  {
    number: '02',
    title: 'Track Daily Movements',
    description:
      'Log receipts, scrap, or counts with mobile camera or handheld scan in two clicks from desktop or mobile with tamper-proof timestamps.',
    note: 'Mobile camera & barcode scan support',
    icon: 'qr_code_scanner',
  },
  {
    number: '03',
    title: 'Act Before You Run Out',
    description:
      'Receive smart low-stock warnings with calculated runway days and reorder with confidence directly to trusted supplier emails.',
    note: 'Pre-filled vendor replenishment POs',
    icon: 'forward_to_inbox',
  },
]

const plans = [
  {
    name: 'Starter',
    heading: 'For single shops',
    description: 'Essential live tracking for neat stockrooms.',
    price: '₦18,500',
    features: [
      'Up to 500 SKUs',
      '2 team members',
      '1 physical location',
      'Basic low-stock alerts',
      'CSV bulk import & export',
    ],
    highlight: 'Basic Stockora Intelligence restock alerts',
    highlightIcon: 'smart_toy',
    buttonClass: 'bg-brand-canvas hover:bg-brand-border/60 text-brand-ink border border-brand-border',
    accent: 'text-brand-ink',
  },
  {
    name: 'Growth',
    heading: 'For scaling brands',
    description: 'Complete accuracy and multi-user workflow.',
    price: '₦48,000',
    features: [
      'Up to 5,000 SKUs',
      '5 team members with roles',
      '3 physical locations',
      'Real-time runway radar',
      'Mobile camera & barcode scanner',
      'Audit-grade movements ledger',
    ],
    highlight: 'Stockora Intelligence AI assistant (automated reorder & velocity analysis)',
    highlightIcon: 'auto_awesome',
    buttonClass: 'bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm',
    accent: 'text-brand-orange',
    popular: true,
  },
  {
    name: 'Scale / Pro',
    heading: 'For multi-bay hubs',
    description: 'Full operational control and integrations.',
    price: '₦92,000',
    features: [
      'Unlimited SKUs',
      'Unlimited team operators',
      'Multi-bay warehouse tracking',
      'Priority sub-second sync',
      'REST API access & webhooks',
      'Dedicated onboarding concierge',
    ],
    highlight: 'Full Stockora Intelligence AI suite (predictive forecasting, multi-warehouse AI triage & priority copilot)',
    highlightIcon: 'psychology',
    buttonClass: 'bg-brand-canvas hover:bg-brand-border/60 text-brand-ink border border-brand-border',
    accent: 'text-brand-orange',
  },
]

const faqs = [
  {
    question: 'How hard is it to migrate from our existing Excel spreadsheets?',
    answer:
      'It takes under 3 minutes. Simply upload your current .csv or .xlsx file; our smart column mapper automatically recognizes your SKU codes, item titles, current counts, and unit costs. You can test your ledger with zero risk.',
    open: true,
  },
  {
    question: 'Do I need dedicated barcode scanner hardware?',
    answer:
      'No! STOCKORA turns any standard iPhone, iPad, or Android camera into a responsive, high-speed barcode and QR reader. If you already own Bluetooth or USB physical scanners, they work instantly plug-and-play.',
  },
  {
    question: 'What happens when an item reaches low-stock threshold?',
    answer:
      'STOCKORA triggers instant visual dashboard alerts and calculates your projected days of runway based on recent sales velocity. You can instantly draft a pre-formatted replenishment purchase order to your preferred supplier with one click.',
  },
  {
    question: 'Can I add team members with restricted permissions?',
    answer:
      'Yes. Granular roles let store clerks scan items and perform cycle counts without seeing cost margins or financial totals, while warehouse leads and owners maintain full configuration rights.',
  },
  {
    question: 'Can I cancel or switch plans at any time?',
    answer:
      'Yes, absolutely. There are no lock-in contracts or penalty fees. You can upgrade, downgrade, or cancel directly from your account settings at any moment, and your historical audit logs remain exportable.',
  },
]

function LandingPage() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealEls = document.querySelectorAll('.reveal')

    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18 },
    )

    revealEls.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-shell">
      <header id="top" className="sticky top-0 z-50 w-full border-b border-brand-border bg-[#F7F5F0]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-6 sm:py-0 lg:flex-nowrap lg:px-10">
          <a className="group order-1 flex shrink-0 items-center gap-2.5 focus:outline-none" href="#top">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-2xl font-bold">inventory_2</span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-brand-ink sm:text-2xl lg:text-xl 2xl:text-2xl">
              STOCKORA
            </span>
          </a>
          <div className="order-2 flex shrink-0 items-center gap-1 sm:gap-4 lg:order-3 lg:gap-2">
            <a
              className="hidden px-3 py-2 text-[15px] font-medium text-brand-muted transition-colors hover:text-brand-ink lg:inline-flex lg:px-2 lg:text-xs xl:text-sm 2xl:px-3 2xl:text-[15px]"
              href="#/sign-in"
            >
              Sign In
            </a>
            <a
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-brand-orange px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-orangeHover hover:shadow active:scale-[0.98] sm:px-5 sm:text-[15px] lg:px-3 lg:text-xs xl:px-4 xl:text-sm 2xl:px-5 2xl:text-[15px]"
              href="#/create-account"
            >
              Get Started Free
            </a>
          </div>
          <nav
            aria-label="Main navigation"
            className="order-3 -mx-4 flex w-[calc(100%+2rem)] items-center gap-5 overflow-x-auto px-4 pb-1 text-xs font-medium text-brand-muted sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:order-2 lg:mx-2 lg:w-auto lg:shrink-0 lg:gap-2 lg:overflow-visible lg:p-0 lg:text-xs xl:gap-5 xl:text-sm 2xl:mx-4 2xl:gap-8 2xl:text-[15px]"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                className="shrink-0 whitespace-nowrap transition-colors hover:text-brand-orange"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full">
        <section className="relative overflow-hidden pb-20 pt-12 lg:pb-32 lg:pt-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
              <div className="flex min-w-0 flex-col items-start lg:col-span-6">
                <div className="hero-animate inline-flex max-w-full items-center gap-2 rounded-full border border-brand-border bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-orange shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
                  Calm Inventory Management • for growing brands
                </div>

                <h1 className="hero-animate mt-6 font-display text-4xl font-bold tracking-tight text-brand-ink leading-[1.12] sm:text-5xl lg:text-[54px]">
                  Know your stock.
                  <br />
                  <span className="text-brand-orange">Stay in control.</span>
                </h1>

                <p className="hero-animate mt-6 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg">
                  Track physical items in real-time, catch low stock before it halts operations,
                  and eliminate messy spreadsheet chaos with effortless clarity.
                </p>

                <div className="hero-animate mt-9 flex w-full flex-wrap items-center gap-4 sm:w-auto">
                  <a
                    className="inline-flex items-center justify-center rounded-xl bg-brand-orange px-7 py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:bg-brand-orangeHover active:scale-[0.98]"
                    href="#/create-account"
                  >
                    Start Free Trial
                    <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
                  </a>
                  <a
                    className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white px-6 py-3.5 text-base font-semibold text-brand-ink transition-all hover:bg-[#F2EFE9]"
                    href="#services"
                  >
                    <span className="material-symbols-outlined mr-2 text-xl text-brand-orange">
                      play_circle
                    </span>
                    See Live Demo
                  </a>
                </div>

                <div className="hero-animate mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-brand-muted sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-emerald-600">
                      check_circle
                    </span>
                    <span>No credit card required</span>
                  </div>
                  <span className="hidden text-brand-border sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-emerald-600">
                      timer
                    </span>
                    <span>3-minute setup</span>
                  </div>
                  <span className="hidden text-brand-border sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-emerald-600">
                      verified_user
                    </span>
                    <span>SOC-2 verified ledger</span>
                  </div>
                </div>
              </div>

              <div className="relative min-w-0 lg:col-span-6">
                <div className="reveal group relative mx-auto overflow-hidden rounded-2xl border border-brand-border bg-white shadow-soft">
                  <img
                    alt="Inspiring Black woman entrepreneur smiling proudly in her boutique retail botanical skincare shop"
                    className="h-[420px] w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 sm:h-[490px]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuArpv_klUgejuD0uN3EKNGBmq0EbrG76CTh0Vo7b6Xnxn4_NsyY3lliJGDVvVjBAZE88RKn9os9buUXhbRczB1obO9LYcKc8KWl7zDd-BhcUTxMaI4Ygv0W43ayCJ76VMuVaiQayET7vYayqAh89SnZORFO9tNbOJ-TtVWB29yCQ3LXO2swuAM2BCHQiyFmgA0R2Zw8-lJr0-exp3mR4CQpyv01bKADtxbe-ke9eFMboffn1TRX-liPiA"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-ink/40 via-transparent to-transparent" />

                  <div className="floating-panel absolute left-5 top-5 flex max-w-[270px] items-center gap-3 rounded-xl border border-brand-border bg-white/95 p-3.5 shadow-soft backdrop-blur-md">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <span className="material-symbols-outlined text-xl">sync</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
                        Live Warehouse Sync
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <div className="mt-0.5 text-[11px] text-brand-muted">
                        99.4% Buffer Health Rate
                      </div>
                    </div>
                  </div>

                  <div className="hero-alert-panel floating-panel absolute bottom-5 right-5 max-w-[280px] rounded-xl border border-brand-border bg-white/95 p-4 shadow-soft backdrop-blur-md">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                        <span className="material-symbols-outlined text-sm">notifications_active</span>
                        Low Stock Alert
                      </span>
                      <span className="text-[10px] text-brand-subtle">Just now</span>
                    </div>
                    <div className="text-xs font-semibold text-brand-ink">
                      Amber Dropper 50ml (SKU-88)
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-brand-muted">
                      <span>
                        Remaining: <strong className="font-semibold text-brand-ink">12 units</strong>
                      </span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Reordered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-brand-border bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="reveal mx-auto max-w-3xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-canvas px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                Core Architecture
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                Everything you need to run clean, accurate shelf counts
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-muted sm:text-lg">
                Eliminate inventory guessing games, avoid costly deadstock, and run seamless audits
                without the weight of bloated enterprise ERPs.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="reveal group flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-canvas p-7 transition-all hover:border-brand-orange/50 hover:shadow-card"
                >
                  <div>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-orange transition-transform group-hover:scale-110">
                      <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                    </div>
                    <h3 className="mb-2 font-display text-lg font-bold text-brand-ink">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-brand-muted">{card.description}</p>
                  </div>
                  <div className="mt-6 flex items-center border-t border-brand-border/60 pt-6 text-xs font-semibold text-brand-orange">
                    <span>Explore registry tools</span>
                    <span className="material-symbols-outlined ml-1 text-sm transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="bg-brand-canvas py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="relative min-w-0 lg:col-span-6">
                <div className="reveal group relative overflow-hidden rounded-2xl border border-brand-border bg-white shadow-soft">
                  <img
                    alt="Two Black colleagues collaborating happily in a modern airy stockroom over inventory management"
                    className="h-[480px] w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 sm:h-[540px]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeUwbosntca4UzWWMi4mE4-8mmLECdT_pcgdO_dEBbKmJwxHcZ3ONw1PFJ3tXOzMITsfLAGcpo_SJPfnpP2vpLSjIVlrEw6egWrUSoJswOXixAK-6uwVU89I9jOZQu6GKJOHE9L3Pn_PluRRNltit8sGFrHaRVq_ZyL5sgXLI5JezQiWNtceYZgVVtEnw3uGmkJ0GBrngD8hhpIk_RbmKV90xabI00_K7LBE2gcw-HX2VjVHvtPZzV6g"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl border border-brand-border bg-white/95 p-5 shadow-sm backdrop-blur-md">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                        Spotlight
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-brand-ink">
                        Boutique & Specialized Logistics
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      99.8% Order Accuracy
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start lg:col-span-6">
                <div className="reveal inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                  Tailored For Your Scale
                </div>
                <h2 className="reveal mt-4 font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                  Built for operators who value precision and calm
                </h2>
                <p className="reveal mt-4 max-w-xl text-base leading-relaxed text-brand-muted">
                  Whether you run an artisanal brand, multi-channel storefront, or fulfillment bay,
                  STOCKORA conforms to how you naturally stock physical items.
                </p>

                <div className="mt-8 w-full space-y-4 sm:space-y-5">
                  {serviceItems.map((item) => (
                    <div
                      key={item.title}
                      className="reveal flex items-start gap-4 rounded-xl border border-brand-border bg-white p-4 shadow-sm transition-colors hover:border-brand-orange/40"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-brand-orange">
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-base font-bold text-brand-ink">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-sm leading-normal text-brand-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="reveal mt-8 inline-flex max-w-full items-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink shadow-sm sm:rounded-full">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange" />
                  </span>
                  Used by over 1,200+ growing small businesses worldwide
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-brand-border bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="reveal mx-auto max-w-2xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-canvas px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                Effortless Workflow
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                Simple inventory in 3 straightforward steps
              </h2>
              <p className="mt-3 text-base text-brand-muted">
                Transition your physical stock room into a dependable, self-auditing operation within
                an afternoon.
              </p>
            </div>

            <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="reveal flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-canvas p-8 transition-all hover:shadow-card"
                >
                  <div>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-border bg-white font-display text-xl font-bold text-brand-orange shadow-sm">
                      {step.number}
                    </div>
                    <h3 className="mb-3 font-display text-xl font-bold text-brand-ink">
                      {step.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-brand-muted sm:text-base">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 border-t border-brand-border/60 pt-4 text-xs font-medium text-brand-ink">
                    <span className="material-symbols-outlined text-base text-brand-orange">
                      {step.icon}
                    </span>
                    <span className="min-w-0">{step.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-brand-border bg-brand-canvas py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="reveal mx-auto max-w-3xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                Transparent Pricing
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                Simple, predictable plans for every stage
              </h2>
              <p className="mt-3 text-base text-brand-muted sm:text-lg">
                Start with a 14-day free trial. No credit card required. Upgrade or cancel anytime.
              </p>
              <div className="mt-8 inline-flex items-center rounded-full border border-brand-border bg-white p-1.5 shadow-sm">
                <span className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold text-brand-muted hover:text-brand-ink">
                  Monthly billing
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                  <span>Annual billing</span>
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">Save 20%</span>
                </span>
              </div>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`reveal flex flex-col justify-between rounded-2xl border bg-white p-8 ${
                    plan.popular ? 'border-2 border-brand-orange shadow-elevated' : 'border-brand-border'
                  } ${plan.popular ? 'relative' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <div
                      className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                        plan.popular ? 'text-brand-orange' : 'text-brand-muted'
                      }`}
                    >
                      {plan.name}
                    </div>
                    <h3 className="mb-1 font-display text-2xl font-bold text-brand-ink">
                      {plan.heading}
                    </h3>
                    <p className="mb-6 text-sm text-brand-muted">{plan.description}</p>
                    <div className="mb-6 flex flex-wrap items-baseline gap-x-1 gap-y-1 border-b border-brand-border pb-6">
                      <span className="font-display text-4xl font-bold text-brand-ink">{plan.price}</span>
                      <span className="text-xs text-brand-muted">/ month billed annually</span>
                    </div>
                    <ul className="mb-8 space-y-3.5 text-sm text-brand-ink">
                      {plan.features.map((feature, index) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <span
                            className={`material-symbols-outlined shrink-0 text-lg ${
                              plan.popular ? 'text-brand-orange' : 'text-emerald-600'
                            }`}
                          >
                            check
                          </span>
                          <span className={`min-w-0 ${index === 0 && plan.popular ? 'font-medium' : ''}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                      <li className={`flex items-start gap-2.5 font-medium ${plan.accent}`}>
                        <span className="material-symbols-outlined shrink-0 text-lg text-brand-orange">
                          {plan.highlightIcon}
                        </span>
                        <span className="min-w-0">{plan.highlight}</span>
                      </li>
                    </ul>
                  </div>
                  <a
                    className={`inline-flex w-full items-center justify-center rounded-xl py-3.5 px-4 text-sm font-semibold transition-all ${plan.buttonClass}`}
                    href="#/create-account"
                  >
                    Start 14-Day Free Trial
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-brand-border bg-white py-24">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="reveal mx-auto max-w-2xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-canvas px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                Frequently Asked Questions
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                Got questions? We&apos;ve got answers.
              </h2>
              <p className="mt-3 text-base text-brand-muted">
                Everything you need to know about switching your workflow to STOCKORA.
              </p>
            </div>

            <div className="mt-16 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="reveal group overflow-hidden rounded-xl border border-brand-border bg-brand-canvas transition-all open:border-brand-orange/40"
                  open={faq.open}
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 font-display text-base font-bold text-brand-ink select-none sm:items-center sm:p-6 sm:text-lg">
                    <span className="min-w-0 flex-1">{faq.question}</span>
                    <span className="material-symbols-outlined shrink-0 text-brand-muted transition-transform group-open:rotate-180 group-open:text-brand-orange">
                      expand_more
                    </span>
                  </summary>
                  <div className="border-t border-brand-border/60 px-6 pb-6 pt-4 text-sm leading-relaxed text-brand-muted sm:text-base">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="signup" className="bg-brand-canvas py-24">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="reveal relative overflow-hidden rounded-3xl bg-brand-ink p-10 text-center shadow-soft sm:p-14 lg:p-20">
              <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />
              <div className="relative z-10 mx-auto max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
                  Start in under 3 minutes
                </div>
                <h2 className="mb-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Make stock checks less stressful today.
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                  Join store managers and warehouse leads who replaced chaotic spreadsheets with calm,
                  dependable stock control.
                </p>
                <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a
                    className="inline-flex w-full items-center justify-center rounded-xl bg-brand-orange px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-brand-orangeHover active:scale-[0.98] sm:w-auto"
                    href="#pricing"
                  >
                    Create Your Free Account
                    <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
                  </a>
                  <a
                    className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/15 sm:w-auto"
                    href="#how-it-works"
                  >
                    Book a Walkthrough
                  </a>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70 sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-brand-orange">check</span>
                    Free 14-day trial
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-brand-orange">check</span>
                    Instant access
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-brand-orange">check</span>
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-brand-border bg-white pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col items-start pr-0 lg:col-span-2 lg:pr-8">
              <a className="mb-4 flex items-center gap-2.5" href="#top">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-white">
                  <span className="material-symbols-outlined text-xl font-bold">inventory_2</span>
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-brand-ink">
                  STOCKORA
                </span>
              </a>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-brand-muted">
                Know your stock. Stay in control. Modern inventory clarity built for retail storefronts,
                small fulfillment bays, and growing product creators.
              </p>
              <div className="text-xs text-brand-subtle">
                Headquartered in San Francisco, CA &amp; London, UK
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-brand-ink">
                Product
              </h4>
              <ul className="space-y-3 text-sm text-brand-muted">
                <li><a className="transition-colors hover:text-brand-orange" href="#features">Features</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#services">Services</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#pricing">Pricing &amp; Plans</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#features">Inventory Registry</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#how-it-works">Releases &amp; Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-brand-ink">
                Resources
              </h4>
              <ul className="space-y-3 text-sm text-brand-muted">
                <li><a className="transition-colors hover:text-brand-orange" href="#how-it-works">Documentation</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#features">Audit Guides</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#faq">FAQ</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#features">API Reference</a></li>
                <li>
                  <a className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100" href="#status">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    All Systems Operational
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-brand-ink">
                Company &amp; Legal
              </h4>
              <ul className="space-y-3 text-sm text-brand-muted">
                <li><a className="transition-colors hover:text-brand-orange" href="#features">About</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#privacy">Privacy Policy</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#terms">Terms of Service</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#security">Security &amp; SOC-2</a></li>
                <li><a className="transition-colors hover:text-brand-orange" href="#faq">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-brand-border pt-8 text-center text-xs text-brand-subtle sm:flex-row sm:text-left">
            <p>© 2026 STOCKORA Systems Inc. Built for operational calm.</p>
            <div className="flex items-center gap-6">
              <a className="transition-colors hover:text-brand-ink" href="#privacy">Privacy</a>
              <a className="transition-colors hover:text-brand-ink" href="#terms">Terms</a>
              <a className="transition-colors hover:text-brand-ink" href="#security">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
