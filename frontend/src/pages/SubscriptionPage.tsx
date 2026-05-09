import { Check, Crown, Star, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with basic features',
    features: [
      '5 AI evaluations/month',
      'Access to free courses',
      'Basic progress tracking',
      'Community forums'
    ],
    icon: Star,
    popular: false
  },
  {
    name: 'Pro',
    price: 19,
    description: 'Unlock more AI power',
    features: [
      '50 AI evaluations/month',
      'Offline access to courses',
      '1 mentoring session/month',
      'Priority support',
      'Certificates of completion'
    ],
    icon: Zap,
    popular: true
  },
  {
    name: 'Premium',
    price: 39,
    description: 'Unlimited learning potential',
    features: [
      'Unlimited AI evaluations',
      'Offline access',
      '4 mentoring sessions/month',
      'Premium certificates',
      '1-on-1 priority support',
      'Early access to new features'
    ],
    icon: Crown,
    popular: false
  }
]

export function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600">Upgrade to unlock premium features and AI capabilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`card p-6 flex flex-col ${plan.popular ? 'ring-2 ring-primary-500 relative' : ''}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-100 mb-4">
                <plan.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
              {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
