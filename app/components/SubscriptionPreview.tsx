'use client'

import { Check, Crown, Zap, Shield, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'

interface PricingTier {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  icon: React.ComponentType<any>
  badge?: string
}

export default function SubscriptionPreview() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly')

  const pricingTiers: PricingTier[] = [
    {
      name: 'Starter',
      price: billingPeriod === 'monthly' ? 29 : 290,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Perfect for casual bettors and NFL fans',
      icon: Users,
      features: [
        '5 game predictions per week',
        'Basic confidence ratings',
        'Weekly performance reports',
        'Email support',
        'Mobile-friendly interface'
      ]
    },
    {
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 79 : 790,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'For serious bettors who need edge detection',
      icon: TrendingUp,
      highlighted: true,
      badge: 'Most Popular',
      features: [
        'Unlimited game predictions',
        'Player props analysis',
        'Market inefficiency detection',
        'Advanced confidence intervals',
        'Real-time odds tracking',
        'Historical performance analytics',
        'Priority support',
        'Custom alerts & notifications'
      ]
    },
    {
      name: 'Elite',
      price: billingPeriod === 'monthly' ? 149 : 1490,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Maximum edge for professional bettors',
      icon: Crown,
      features: [
        'Everything in Professional',
        'Live game updates',
        'Custom model weights',
        'API access for automation',
        'Injury impact modeling',
        'Weather correlation analysis',
        'Portfolio optimization',
        '1-on-1 strategy sessions',
        'White-label options'
      ]
    }
  ]

  const platformStats = {
    accuracy: '75.8%',
    subscribers: '2,400+',
    predictions: '15,000+',
    edge: '+12.4%'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Platform Preview
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Professional NFL analytics with industry-leading accuracy
        </p>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(platformStats).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{value}</div>
              <div className="text-sm text-gray-600 capitalize">
                {key === 'edge' ? 'Avg. Edge' : key}
              </div>
            </div>
          ))}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'annually' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingPeriod === 'annually' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Annual
          </span>
          {billingPeriod === 'annually' && (
            <span className="text-sm text-green-600 font-medium">Save 17%</span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier, index) => {
          const Icon = tier.icon
          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 shadow-lg'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                  tier.highlighted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                  <span className="text-gray-600 ml-1">{tier.period}</span>
                </div>
                
                {billingPeriod === 'annually' && (
                  <div className="text-sm text-gray-500 mt-1">
                    ${Math.round(tier.price / 12)}/month billed annually
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm ml-3">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Choose {tier.name}
              </button>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What makes our platform different?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Industry-Leading Accuracy</h4>
              <p className="text-sm text-gray-600 mt-1">
                75.8% prediction accuracy with advanced statistical models
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-lg p-2">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Transparent Trust Metrics</h4>
              <p className="text-sm text-gray-600 mt-1">
                Real-time performance tracking and quality validation
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Edge Detection</h4>
              <p className="text-sm text-gray-600 mt-1">
                Automated market inefficiency identification
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Timeline */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Crown className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Early Access Program</h4>
            <p className="text-sm text-blue-700 mt-1">
              Platform is currently in development. Subscribe to be notified when we launch 
              with exclusive early-bird pricing for the first 100 subscribers.
            </p>
            <div className="mt-4 space-y-2 text-sm text-blue-700">
              <div>• Q2 2024: Beta testing with select users</div>
              <div>• Q3 2024: Full platform launch</div>
              <div>• Q4 2024: Mobile app release</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 