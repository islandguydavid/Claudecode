import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-600">FreelanceKit</div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span>Powered by Claude AI</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Generate Professional
          <br />
          <span className="text-blue-600">Proposals, Contracts &amp; Invoices</span>
          <br />
          in Minutes
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          AI-powered document generation built for Canadian freelancers. Fill out a short form,
          get professionally written documents — ready to send to clients in under 5 minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Get Started Free
          </Link>
          <Link
            href="#pricing"
            className="text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to get paid
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Writing',
              desc: 'Claude AI generates polished, professional documents from your project details.',
            },
            {
              icon: '⚖️',
              title: 'Canadian Law',
              desc: 'Contracts reference your province\'s specific small claims courts and governing law.',
            },
            {
              icon: '💳',
              title: 'Stripe Payments',
              desc: 'Clients can pay invoices directly from the shared link with Stripe Checkout.',
            },
            {
              icon: '🎨',
              title: 'White-Label Branding',
              desc: 'Apply your logo, colors, and fonts to every document for a professional look.',
            },
            {
              icon: '📄',
              title: 'PDF Export',
              desc: 'Download pixel-perfect PDFs for proposals, contracts, and invoices.',
            },
            {
              icon: '📧',
              title: 'Email Delivery',
              desc: 'Send branded emails to clients with a single click via Resend.',
            },
            {
              icon: '🔗',
              title: 'Client Share Links',
              desc: 'Share a secure link where clients can review and pay without signing up.',
            },
            {
              icon: '📊',
              title: 'Revenue Dashboard',
              desc: 'Track your proposals, paid invoices, and total revenue in one place.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            From idea to invoice in 3 steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Fill out the form',
                desc: '6 quick steps covering your details, the project, fees, and timeline.',
              },
              {
                step: '2',
                title: 'AI generates documents',
                desc: 'Claude writes a polished proposal, airtight contract, and clean invoice — all at once.',
              },
              {
                step: '3',
                title: 'Send & get paid',
                desc: 'Share a link with your client. They review, sign, and pay — all in one place.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple pricing</h2>
        <p className="text-center text-gray-500 mb-12">No subscription required to try it.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-2xl p-6">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Free</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
            <p className="text-gray-500 text-sm mb-6">Get started, generate documents</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {['Unlimited proposals', 'AI document generation', 'Share links', 'Dashboard access'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Free
            </Link>
          </div>

          <div className="border-2 border-blue-600 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Per Proposal</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">$9</div>
            <p className="text-gray-500 text-sm mb-6">One-time per proposal</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {['Everything in Free', 'PDF downloads', 'Client payment links', 'Email delivery'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Unlimited</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">$19<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <p className="text-gray-500 text-sm mb-6">Unlimited everything</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {['Everything in Per Proposal', 'Unlimited PDFs', 'White-label branding', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop losing deals to unprofessional documents
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join Canadian freelancers who generate polished documents in minutes.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 FreelanceKit. Built for Canadian freelancers.</p>
      </footer>
    </div>
  );
}
