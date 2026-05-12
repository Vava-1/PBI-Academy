import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Star, Crown, Gem, Target, TrendingUp,
  Gift, Users, Calendar, Award, Zap, Shield,
  ChevronRight, ArrowRight, CheckCircle
} from 'lucide-react'
import { api } from '../lib/api'

interface LoyaltyProfile {
  user: {
    id: string
    name: string
    email: string
    loyaltyTier: string
    points: number
    totalSpent: number
    lifetimeValue: number
    referralCode: string
    streak: number
    level: number
    lastActiveAt: string
    subscriptionEnd: string
  }
  tierBenefits: {
    discount: number
    pointsMultiplier: number
    features: string[]
  }
  pointsHistory: Array<{
    id: string
    points: number
    source: string
    description: string
    createdAt: string
  }>
  nextTier?: string
  progress: number
}

interface Reward {
  id: string
  title: string
  description: string
  pointsCost: number
  type: string
  value: string
  tier: string
}

interface Referral {
  id: string
  referredId: string
  status: string
  rewardAmount: number
  completedAt?: string
  createdAt: string
}

export default function LoyaltyDashboard() {
  const [loyaltyProfile, setLoyaltyProfile] = useState<LoyaltyProfile | null>(null)
  const [rewards, setRewards] = useState<{ available: Reward[], claimed: any[] }>({ available: [], claimed: [] })
  const [referrals, setReferrals] = useState<{ referrals: Referral[], stats: any }>({ referrals: [], stats: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/loyalty/profile'),
      api.get('/loyalty/rewards'),
      api.get('/loyalty/referrals')
    ]).then(([profileData, rewardsData, referralsData]) => {
      setLoyaltyProfile(profileData)
      setRewards(rewardsData)
      setReferrals(referralsData)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return <Trophy className="w-6 h-6 text-amber-600" />
      case 'SILVER': return <Star className="w-6 h-6 text-gray-400" />
      case 'GOLD': return <Crown className="w-6 h-6 text-yellow-500" />
      case 'PLATINUM': return <Gem className="w-6 h-6 text-purple-500" />
      case 'DIAMOND': return <Shield className="w-6 h-6 text-blue-500" />
      default: return <Trophy className="w-6 h-6 text-gray-400" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'SILVER': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'GOLD': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'PLATINUM': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'DIAMOND': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!loyaltyProfile) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">Unable to load loyalty data</h2>
          <Link to="/dashboard" className="text-purple hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white border-b border-gray-line">
        <div className="container-pbi py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl text-navy">Loyalty Program</h1>
              <p className="text-text-muted">Your journey to excellence and exclusive rewards</p>
            </div>
            <Link to="/dashboard" className="text-purple hover:underline flex items-center gap-1">
              Back to Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container-pbi py-8">
        {/* Tier Status Card */}
        <div className="bg-gradient-to-r from-purple to-violet-light rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getTierIcon(loyaltyProfile.user.loyaltyTier)}
              <div>
                <h2 className="font-display font-bold text-2xl">{loyaltyProfile.user.loyaltyTier} Member</h2>
                <p className="text-white/80">Level {loyaltyProfile.user.level} • {loyaltyProfile.user.points.toLocaleString()} points</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80 mb-1">Lifetime Value</div>
              <div className="text-2xl font-bold">${loyaltyProfile.user.lifetimeValue.toFixed(2)}</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {loyaltyProfile.nextTier && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Progress to {loyaltyProfile.nextTier}</span>
                <span className="text-sm font-semibold">{Math.round(loyaltyProfile.progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${loyaltyProfile.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Tier Benefits */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">{loyaltyProfile.tierBenefits.discount}% Discount</span>
              </div>
              <p className="text-sm text-white/80">On all course purchases</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">{loyaltyProfile.tierBenefits.pointsMultiplier}x Points</span>
              </div>
              <p className="text-sm text-white/80">Accelerated earning rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">{loyaltyProfile.tierBenefits.features.length} Features</span>
              </div>
              <p className="text-sm text-white/80">Exclusive access & perks</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-purple" />
              <span className="text-2xl font-bold text-navy">{loyaltyProfile.user.points.toLocaleString()}</span>
            </div>
            <h3 className="font-semibold text-navy">Available Points</h3>
            <p className="text-sm text-text-muted">Redeem for rewards</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-navy">{loyaltyProfile.user.streak}</span>
            </div>
            <h3 className="font-semibold text-navy">Day Streak</h3>
            <p className="text-sm text-text-muted">Keep it going!</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-navy">{referrals.stats.completed || 0}</span>
            </div>
            <h3 className="font-semibold text-navy">Successful Referrals</h3>
            <p className="text-sm text-text-muted">${(referrals.stats.totalRewards || 0).toFixed(2)} earned</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-navy">{rewards.claimed.length}</span>
            </div>
            <h3 className="font-semibold text-navy">Rewards Claimed</h3>
            <p className="text-sm text-text-muted">Your achievements</p>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-navy">Available Rewards</h2>
            <span className="text-sm text-text-muted">{rewards.available.length} rewards available</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.available.slice(0, 6).map((reward) => (
              <div key={reward.id} className="border border-gray-line rounded-xl p-4 hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-navy">{reward.title}</h3>
                    <p className="text-sm text-text-muted">{reward.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTierColor(reward.tier)}`}>
                    {reward.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-purple" />
                    <span className="font-semibold text-purple">{reward.pointsCost.toLocaleString()} points</span>
                  </div>
                  <button className="text-purple hover:text-purple/90 text-sm font-semibold">
                    Claim <ArrowRight className="w-3 h-3 inline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Points History */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="font-display font-bold text-xl text-navy mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {loyaltyProfile.pointsHistory.slice(0, 5).map((point) => (
                <div key={point.id} className="flex items-center justify-between py-2 border-b border-gray-line last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${point.points > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {point.points > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <Trophy className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-navy text-sm">{point.description}</p>
                      <p className="text-xs text-text-muted">{new Date(point.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${point.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {point.points > 0 ? '+' : ''}{point.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-navy">Referral Program</h2>
              <button className="text-purple hover:text-purple/90 text-sm font-semibold">
                Invite Friends <Users className="w-3 h-3 inline" />
              </button>
            </div>
            <div className="bg-purple/5 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-navy">Your Referral Code</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-1 rounded text-navy font-mono text-sm flex-1">
                  {loyaltyProfile.user.referralCode}
                </code>
                <button className="text-purple hover:text-purple/90 text-sm font-semibold">
                  Copy
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-navy">{referrals.stats.total || 0}</div>
                <div className="text-xs text-text-muted">Total Referrals</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{referrals.stats.completed || 0}</div>
                <div className="text-xs text-text-muted">Successful</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple">${(referrals.stats.totalRewards || 0).toFixed(2)}</div>
                <div className="text-xs text-text-muted">Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
