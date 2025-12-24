"use client"

import { ArrowLeft, User, Bell, Volume2, Accessibility, HelpCircle, FileText, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"
import { useState, useEffect } from "react"
import { signOut } from "@/lib/auth"
import { usePlayer, clearPlayerCache } from "@/hooks/use-player"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const router = useRouter()
  const { player, loading: playerLoading } = usePlayer()
  const [userEmail, setUserEmail] = useState<string>("")
  const [loadingEmail, setLoadingEmail] = useState(true)
  
  // Load settings from localStorage
  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings_musicVolume')
      return saved ? [parseInt(saved)] : [75]
    }
    return [75]
  })
  const [sfxVolume, setSfxVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings_sfxVolume')
      return saved ? [parseInt(saved)] : [80]
    }
    return [80]
  })
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings_notifications')
      return saved ? JSON.parse(saved) : {
        chargeFull: true,
        outpostIncome: true,
        dailyMissions: false,
        crewInvites: true,
      }
    }
    return {
      chargeFull: true,
      outpostIncome: true,
      dailyMissions: false,
      crewInvites: true,
    }
  })
  const [accessibility, setAccessibility] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings_accessibility')
      return saved ? JSON.parse(saved) : {
        reduceMotion: false,
        haptics: true,
      }
    }
    return {
      reduceMotion: false,
      haptics: true,
    }
  })

  // Fetch user email
  useEffect(() => {
    async function fetchUserEmail() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      } catch (error) {
        console.error('[Settings] Error fetching user email:', error)
      } finally {
        setLoadingEmail(false)
      }
    }
    fetchUserEmail()
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings_musicVolume', musicVolume[0].toString())
    }
  }, [musicVolume])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings_sfxVolume', sfxVolume[0].toString())
    }
  }, [sfxVolume])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings_notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings_accessibility', JSON.stringify(accessibility))
    }
  }, [accessibility])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground uppercase tracking-wider font-mono">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Account Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-neon-cyan" />
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Account</h2>
          </div>
          <Card className="bg-card border-border">
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-mono">Player Handle</label>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {playerLoading ? "Loading..." : player?.handle || "N/A"}
                </div>
              </div>
              <Separator className="bg-border" />
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-mono">Email</label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {loadingEmail ? "Loading..." : userEmail || "Not available"}
                </div>
              </div>
              <Separator className="bg-border" />
              <Button
                variant="destructive"
                className="w-full"
                onClick={async () => {
                  clearPlayerCache() // Clear player cache before signing out
                  await signOut()
                  router.push("/auth/signin")
                  router.refresh()
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>

        {/* Notifications Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-neon-cyan" />
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Notifications</h2>
          </div>
          <Card className="bg-card border-border">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Charge Full</div>
                  <div className="text-xs text-muted-foreground">Notify when energy is recharged</div>
                </div>
                <Switch
                  checked={notifications.chargeFull}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, chargeFull: checked })}
                />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Outpost Income Ready</div>
                  <div className="text-xs text-muted-foreground">Alert when income can be collected</div>
                </div>
                <Switch
                  checked={notifications.outpostIncome}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, outpostIncome: checked })}
                />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Daily Missions Reset</div>
                  <div className="text-xs text-muted-foreground">Notify when new missions are available</div>
                </div>
                <Switch
                  checked={notifications.dailyMissions}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, dailyMissions: checked })}
                />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Crew Invites</div>
                  <div className="text-xs text-muted-foreground">Alert for incoming crew requests</div>
                </div>
                <Switch
                  checked={notifications.crewInvites}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, crewInvites: checked })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Audio Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-neon-cyan" />
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Audio</h2>
          </div>
          <Card className="bg-card border-border">
            <div className="p-4 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-foreground">Music</div>
                  <div className="text-xs text-neon-cyan font-mono">{musicVolume[0]}%</div>
                </div>
                <Slider value={musicVolume} onValueChange={setMusicVolume} max={100} step={1} className="w-full" />
              </div>
              <Separator className="bg-border" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-foreground">Sound Effects</div>
                  <div className="text-xs text-neon-cyan font-mono">{sfxVolume[0]}%</div>
                </div>
                <Slider value={sfxVolume} onValueChange={setSfxVolume} max={100} step={1} className="w-full" />
              </div>
            </div>
          </Card>
        </div>

        {/* Accessibility Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Accessibility className="w-4 h-4 text-neon-cyan" />
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Accessibility</h2>
          </div>
          <Card className="bg-card border-border">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Reduce Motion</div>
                  <div className="text-xs text-muted-foreground">Minimize animations and effects</div>
                </div>
                <Switch
                  checked={accessibility.reduceMotion}
                  onCheckedChange={(checked) => setAccessibility({ ...accessibility, reduceMotion: checked })}
                />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Haptics</div>
                  <div className="text-xs text-muted-foreground">Vibration feedback for actions</div>
                </div>
                <Switch
                  checked={accessibility.haptics}
                  onCheckedChange={(checked) => setAccessibility({ ...accessibility, haptics: checked })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Support Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-neon-cyan" />
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Support</h2>
          </div>
          <Card className="bg-card border-border">
            <div className="p-4 space-y-3">
              <button
                onClick={() => console.log("[v0] Report issue clicked")}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/20 rounded transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Report Issue</span>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </button>
              <Separator className="bg-border" />
              <button
                onClick={() => console.log("[v0] About clicked")}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/20 rounded transition-colors"
              >
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">About</div>
                  <div className="text-xs text-muted-foreground font-mono">v2.4.8 (build 10452)</div>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </button>
            </div>
          </Card>
        </div>

        {/* Legal Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-neon-cyan" />
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Legal</h2>
          </div>
          <Card className="bg-card border-border">
            <div className="p-4 space-y-3">
              <button
                onClick={() => console.log("[v0] Terms clicked")}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/20 rounded transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Terms of Service</span>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </button>
              <Separator className="bg-border" />
              <button
                onClick={() => console.log("[v0] Privacy clicked")}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/20 rounded transition-colors"
              >
                <span className="text-sm font-medium text-foreground">Privacy Policy</span>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onTabChange={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)} />
    </div>
  )
}
