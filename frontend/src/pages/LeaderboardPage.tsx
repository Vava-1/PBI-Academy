import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { Trophy, Flame, Crown, Medal } from 'lucide-react'

export function LeaderboardPage() {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await api.get('/gamification/leaderboard')
      return res.data
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other learners</p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {leaderboard?.entries?.slice(0, 3).map((entry: any, idx: number) => (
          <div 
            key={entry.user_id} 
            className={`card p-6 text-center ${
              idx === 0 ? 'order-2 scale-110 z-10' : idx === 1 ? 'order-1' : 'order-3'
            }`}
          >
            <div className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-gray-100' : 'bg-orange-100'
            }`}>
              {idx === 0 ? <Crown className="h-8 w-8 text-yellow-600" /> :
               idx === 1 ? <Medal className="h-8 w-8 text-gray-600" /> :
               <Medal className="h-8 w-8 text-orange-600" />}
            </div>
            <div className="text-2xl font-bold mb-1">#{entry.rank}</div>
            <div className="font-semibold">{entry.display_name}</div>
            <div className="text-sm text-gray-500">{entry.total_points.toLocaleString()} pts</div>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Level</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Streak</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leaderboard?.entries?.map((entry: any) => (
              <tr key={entry.user_id} className={entry.is_current_user ? 'bg-primary-50' : ''}>
                <td className="px-6 py-4">#{entry.rank}</td>
                <td className="px-6 py-4 font-medium">{entry.display_name}</td>
                <td className="px-6 py-4">{entry.level}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-orange-600">
                    <Flame className="h-4 w-4" />
                    {entry.current_streak}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold">
                  {entry.total_points.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
