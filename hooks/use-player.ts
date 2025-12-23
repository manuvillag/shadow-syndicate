'use client'

import { useEffect, useState } from 'react'

interface PlayerData {
  id: string
  user_id: string
  handle: string
  rank: string
  syndicate: string
  credits: number
  alloy: number
  level: number
  xp_current: number
  xp_max: number
  charge: number
  charge_max: number
  adrenal: number
  adrenal_max: number
  health: number
  health_max: number
  crew_size: number
  crew_max: number
  created_at: string
  updated_at: string
  last_charge_regen: string
  last_adrenal_regen: string
  last_health_regen: string
}

export function usePlayer() {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/player')
      
      if (response.status === 401) {
        setError('Unauthorized')
        setPlayer(null)
        setLoading(false)
        return
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setPlayer(null)
      } else {
        setPlayer(data.player)
      }
    } catch (err) {
      setError('Failed to fetch player data')
      console.error('[usePlayer] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayer()
  }, [])

  return { player, loading, error, refetch: fetchPlayer }
}

