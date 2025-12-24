"use client"

import { useState, useEffect, useCallback } from "react"
import { GameLayout } from "@/components/game-layout"
import { ArrowLeft, Plus, Users, Crown, Shield, User, Search, UserPlus, LogOut, Trash2, Settings, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Syndicate {
  id: string
  name: string
  description: string | null
  created_at: string
  leader: {
    id: string
    handle: string
    level: number
    rank: string
  }
  memberCount: number
}

interface SyndicateMember {
  id: string
  role: 'leader' | 'officer' | 'member'
  joined_at: string
  player: {
    id: string
    handle: string
    level: number
    rank: string
  }
}

interface SyndicateInvitation {
  id: string
  status: string
  created_at: string
  syndicate: {
    id: string
    name: string
    description: string | null
    leader: {
      id: string
      handle: string
      level: number
      rank: string
    }
  }
  inviter: {
    id: string
    handle: string
    level: number
    rank: string
  }
}

export default function SyndicatePage() {
  const router = useRouter()
  const { player, refetch: refetchPlayer } = usePlayer()
  const { toast } = useToast()
  const [mySyndicate, setMySyndicate] = useState<Syndicate | null>(null)
  const [members, setMembers] = useState<SyndicateMember[]>([])
  const [currentMember, setCurrentMember] = useState<{ role: string; joinedAt: string } | null>(null)
  const [loadingSyndicate, setLoadingSyndicate] = useState(true)
  const [syndicates, setSyndicates] = useState<Syndicate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [invitations, setInvitations] = useState<SyndicateInvitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [creating, setCreating] = useState(false)

  // Function to fetch syndicate data (memoized to avoid infinite loops)
  const fetchMySyndicate = useCallback(async () => {
    if (!player?.syndicate_id) {
      setLoadingSyndicate(false)
      return
    }

    try {
      setLoadingSyndicate(true)
      // Add cache-busting query parameter to ensure fresh data
      const res = await fetch(`/api/syndicates/${player.syndicate_id}?t=${Date.now()}`)
      if (res.ok) {
        const data = await res.json()
        setMySyndicate(data.syndicate)
        setMembers(data.members || [])
        setCurrentMember(data.currentMember)
      }
    } catch (error) {
      console.error("[Syndicate] Error fetching syndicate:", error)
    } finally {
      setLoadingSyndicate(false)
    }
  }, [player?.syndicate_id])

  // Fetch player's syndicate on mount and when player stats change
  useEffect(() => {
    if (player?.syndicate_id) {
      fetchMySyndicate()
    } else {
      setLoadingSyndicate(false)
    }
  }, [player?.syndicate_id, player?.level, player?.rank, fetchMySyndicate]) // Refresh when key stats change

  // Refresh syndicate data when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && player?.syndicate_id) {
        fetchMySyndicate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [player?.syndicate_id, fetchMySyndicate])

  // Fetch invitations
  useEffect(() => {
    async function fetchInvitations() {
      try {
        const res = await fetch("/api/syndicates/invitations?type=received")
        if (res.ok) {
          const data = await res.json()
          setInvitations(data.invitations || [])
        }
      } catch (error) {
        console.error("[Syndicate] Error fetching invitations:", error)
      } finally {
        setLoadingInvitations(false)
      }
    }

    fetchInvitations()
  }, [])

  // Search syndicates
  const handleSearch = async () => {
    setLoadingSearch(true)
    try {
      const url = searchQuery 
        ? `/api/syndicates?search=${encodeURIComponent(searchQuery)}`
        : "/api/syndicates"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setSyndicates(data.syndicates || [])
      }
    } catch (error) {
      console.error("[Syndicate] Search error:", error)
      toast({
        title: "Error",
        description: "Failed to search syndicates",
        variant: "destructive",
      })
    } finally {
      setLoadingSearch(false)
    }
  }

  // Create syndicate
  const handleCreate = async () => {
    if (!createName.trim() || creating) return

    setCreating(true)
    try {
      const res = await fetch("/api/syndicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const errorMessage = data.error || `Failed to create syndicate (${res.status})`
        console.error("[Syndicate] Create error:", data)
        throw new Error(errorMessage)
      }

      toast({
        title: "Syndicate created!",
        description: `${createName} has been created`,
      })

      setCreateDialogOpen(false)
      setCreateName("")
      setCreateDescription("")
      refetchPlayer()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create syndicate",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  // Join syndicate
  const handleJoin = async (syndicateId: string) => {
    if (actioning) return

    setActioning(syndicateId)
    try {
      const res = await fetch(`/api/syndicates/${syndicateId}/join`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to join syndicate")
      }

      toast({
        title: "Joined!",
        description: "You have joined the syndicate",
      })

      refetchPlayer()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join syndicate",
        variant: "destructive",
      })
    } finally {
      setActioning(null)
    }
  }

  // Leave syndicate
  const handleLeave = async () => {
    if (!mySyndicate || actioning) return

    if (!confirm("Are you sure you want to leave this syndicate?")) return

    setActioning("leave")
    try {
      const res = await fetch(`/api/syndicates/${mySyndicate.id}/leave`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to leave syndicate")
      }

      toast({
        title: "Left syndicate",
        description: "You have left the syndicate",
      })

      setMySyndicate(null)
      setMembers([])
      setCurrentMember(null)
      refetchPlayer()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave syndicate",
        variant: "destructive",
      })
    } finally {
      setActioning(null)
    }
  }

  // Accept/decline invitation
  const handleInvitationAction = async (invitationId: string, action: "accept" | "decline") => {
    if (actioning) return

    setActioning(invitationId)
    try {
      const res = await fetch(`/api/syndicates/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update invitation")
      }

      toast({
        title: action === "accept" ? "Invitation accepted" : "Invitation declined",
        description: action === "accept" ? "You have joined the syndicate!" : "Invitation declined",
      })

      // Refresh
      refetchPlayer()
      const invRes = await fetch("/api/syndicates/invitations?type=received")
      if (invRes.ok) {
        const invData = await invRes.json()
        setInvitations(invData.invitations || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update invitation",
        variant: "destructive",
      })
    } finally {
      setActioning(null)
    }
  }

  const isLeader = currentMember?.role === 'leader'
  const isOfficer = currentMember?.role === 'officer' || isLeader

  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Syndicate</h1>
              <p className="text-sm text-muted-foreground">Create or join a group</p>
            </div>
          </div>
          {mySyndicate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await Promise.all([fetchMySyndicate(), refetchPlayer()])
                toast({
                  title: "Refreshed",
                  description: "Syndicate data updated",
                })
              }}
              disabled={loadingSyndicate}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSyndicate ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        {/* My Syndicate */}
        {loadingSyndicate ? (
          <div className="text-center py-8 text-muted-foreground text-xs">Loading...</div>
        ) : mySyndicate ? (
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-foreground">{mySyndicate.name}</h2>
                  {isLeader && (
                    <Badge variant="secondary" className="text-xs bg-neon-orange/20 text-neon-orange border-neon-orange/50">
                      <Crown className="w-3 h-3 mr-1" />
                      Leader
                    </Badge>
                  )}
                  {currentMember?.role === 'officer' && (
                    <Badge variant="secondary" className="text-xs bg-neon-purple/20 text-neon-purple border-neon-purple/50">
                      <Shield className="w-3 h-3 mr-1" />
                      Officer
                    </Badge>
                  )}
                </div>
                {mySyndicate.description && (
                  <p className="text-sm text-muted-foreground mb-2">{mySyndicate.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{members.length} members</span>
                  </div>
                  <span>Created by {mySyndicate.leader?.handle || 'Unknown'}</span>
                </div>
              </div>
              {!isLeader && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLeave}
                  disabled={actioning === "leave"}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Leave
                </Button>
              )}
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">Members</h3>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-background/50 rounded border border-border">
                  <div className="flex items-center gap-2">
                    {member.role === 'leader' && <Crown className="w-4 h-4 text-neon-orange" />}
                    {member.role === 'officer' && <Shield className="w-4 h-4 text-neon-purple" />}
                    {member.role === 'member' && <User className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-bold text-foreground">{member.player?.handle || 'Unknown'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>LVL {member.player?.level || 1}</span>
                        <span>•</span>
                        <span>{member.player?.rank || 'Initiate'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Not in a syndicate</p>
            <p className="text-xs text-muted-foreground mb-4">Create or join a syndicate to team up with friends</p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Syndicate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Syndicate</DialogTitle>
                  <DialogDescription>
                    Create a new syndicate to team up with friends
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2 block">
                      Name
                    </label>
                    <Input
                      placeholder="Syndicate name (3-30 characters)"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2 block">
                      Description (optional)
                    </label>
                    <Textarea
                      placeholder="Describe your syndicate..."
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={creating || createName.trim().length < 3}
                    className="w-full bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50"
                  >
                    {creating ? "Creating..." : "Create Syndicate"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        )}

        {/* Tabs: Browse | Invitations */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Browse
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
            >
              Invitations ({invitations.filter(i => i.status === 'pending').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-3 mt-4">
            {/* Search */}
            <Card className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search syndicates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loadingSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Syndicates List */}
            {loadingSearch ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Searching...</div>
            ) : syndicates.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No syndicates found</p>
                <p className="text-xs text-muted-foreground">Try a different search or create your own</p>
              </Card>
            ) : (
              syndicates.map((syndicate) => (
                <Card key={syndicate.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-foreground mb-1">{syndicate.name}</h3>
                      {syndicate.description && (
                        <p className="text-xs text-muted-foreground mb-2">{syndicate.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{syndicate.memberCount} members</span>
                        </div>
                        <span>Leader: {syndicate.leader?.handle || 'Unknown'}</span>
                      </div>
                    </div>
                    {!mySyndicate && (
                      <Button
                        size="sm"
                        onClick={() => handleJoin(syndicate.id)}
                        disabled={actioning === syndicate.id}
                        className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50"
                      >
                        {actioning === syndicate.id ? "Joining..." : "Join"}
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-3 mt-4">
            {loadingInvitations ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Loading invitations...</div>
            ) : invitations.filter(i => i.status === 'pending').length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No invitations</p>
                <p className="text-xs text-muted-foreground">You have no pending syndicate invitations</p>
              </Card>
            ) : (
              invitations
                .filter(i => i.status === 'pending')
                .map((invitation) => (
                  <Card key={invitation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-foreground mb-1">{invitation.syndicate.name}</h3>
                        {invitation.syndicate.description && (
                          <p className="text-xs text-muted-foreground mb-2">{invitation.syndicate.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Invited by {invitation.inviter?.handle || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleInvitationAction(invitation.id, "accept")}
                          disabled={actioning === invitation.id}
                          className="bg-success/20 hover:bg-success/30 text-success border border-success/50 h-7"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInvitationAction(invitation.id, "decline")}
                          disabled={actioning === invitation.id}
                          className="h-7"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GameLayout>
  )
}

