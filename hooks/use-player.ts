'use client'

import { useEffect, useState, useRef } from 'react'

interface PlayerData {
  id: string
  user_id: string
  handle: string
  rank: string
  syndicate: string
  syndicate_id?: string | null
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

// Global cache to share player data across all hook instances
let globalPlayerCache: PlayerData | null = null
let globalLoading = false
let globalError: string | null = null
let fetchPromise: Promise<void> | null = null
let cachedUserId: string | null = null // Track which user the cache belongs to

// Function to clear the cache (useful when user changes)
export function clearPlayerCache() {
  globalPlayerCache = null
  globalError = null
  cachedUserId = null
  fetchPromise = null
  console.log('[usePlayer] Cache cleared')
}

export function usePlayer() {
  const [player, setPlayer] = useState<PlayerData | null>(globalPlayerCache)
  const [loading, setLoading] = useState(!globalPlayerCache && !globalError)
  const [error, setError] = useState<string | null>(globalError)
  const [isInitialLoad, setIsInitialLoad] = useState(!globalPlayerCache)
  const hasFetched = useRef(false)

  const fetchPlayer = async (force = false, silent = false) => {
    // Check current user ID to detect user changes
    let currentUserId: string | null = null
    try {
      const userResponse = await fetch('/api/auth/user', { cache: 'no-store' })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        currentUserId = userData.user?.id || null
      }
    } catch (err) {
      // If we can't get user, clear cache to be safe
      currentUserId = null
    }

    // If user changed, clear cache
    if (cachedUserId && currentUserId && cachedUserId !== currentUserId) {
      console.log('[usePlayer] User changed, clearing cache')
      globalPlayerCache = null
      globalError = null
      cachedUserId = null
      setPlayer(null)
      setError(null)
    }

    // If already fetching, wait for that promise
    if (fetchPromise && !force && cachedUserId === currentUserId) {
      await fetchPromise
      setPlayer(globalPlayerCache)
      if (!silent) {
        setLoading(globalLoading)
      }
      setError(globalError)
      return
    }

    // If we have cached data for the same user and not forcing, use cache
    if (globalPlayerCache && !force && cachedUserId === currentUserId) {
      setPlayer(globalPlayerCache)
      if (!silent) {
        setLoading(false)
      }
      setError(null)
      return
    }

    // Create fetch promise
    fetchPromise = (async () => {
      try {
        if (!silent) {
          globalLoading = true
          setLoading(true)
        }
        globalError = null
        setError(null)
        
        const response = await fetch('/api/player', {
          cache: 'no-store', // Always get fresh data
        })
        
        if (response.status === 401) {
          globalError = 'Unauthorized'
          globalPlayerCache = null
          cachedUserId = null
          setError('Unauthorized')
          setPlayer(null)
          if (!silent) {
            setLoading(false)
            globalLoading = false
          }
          return
        }

        const data = await response.json()
        
        if (data.error) {
          globalError = data.error
          globalPlayerCache = null
          cachedUserId = null
          setError(data.error)
          setPlayer(null)
        } else {
          globalPlayerCache = data.player
          cachedUserId = currentUserId
          setPlayer(data.player)
        }
      } catch (err) {
        globalError = 'Failed to fetch player data'
        globalPlayerCache = null
        cachedUserId = null
        setError('Failed to fetch player data')
        setPlayer(null)
        console.error('[usePlayer] Error:', err)
      } finally {
        if (!silent) {
          setLoading(false)
          globalLoading = false
        }
        fetchPromise = null
      }
    })()

    await fetchPromise
  }

  useEffect(() => {
    // Only fetch once per mount, use cache if available
    if (!hasFetched.current) {
      hasFetched.current = true
      if (!globalPlayerCache) {
        fetchPlayer()
      } else {
        // Use cached data immediately
        setPlayer(globalPlayerCache)
        setLoading(false)
        setError(globalError)
        setIsInitialLoad(false)
      }
    }

    // Mark initial load as complete after first fetch
    if (globalPlayerCache) {
      setIsInitialLoad(false)
    }

    // Auto-refresh player data every 30 seconds (reduced from 10s) to keep XP bar and stats updated
    // Use silent mode to avoid showing loading state during polling
    const interval = setInterval(() => {
      // Only poll if page is visible (not in background tab)
      if (document.visibilityState === 'visible') {
        fetchPlayer(true, true) // Force refresh, but silent (no loading state)
      }
    }, 30000) // 30 seconds (reduced frequency)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mark initial load as complete when player data is loaded
  useEffect(() => {
    if (player && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [player, isInitialLoad])

  return { 
    player, 
    loading, 
    error,
    isInitialLoad,
    refetch: () => fetchPlayer(true) // Force refresh
  }
}


