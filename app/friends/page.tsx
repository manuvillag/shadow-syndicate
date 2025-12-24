"use client"

import { useState, useEffect } from "react"
import { GameLayout } from "@/components/game-layout"
import { ArrowLeft, Search, UserPlus, Check, X, Users, UsersRound } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { usePlayer } from "@/hooks/use-player"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  handle: string
  level: number
  rank: string
  friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked'
}

interface FriendRequest {
  id: string
  status: string
  created_at: string
  requester: {
    id: string
    handle: string
    level: number
    rank: string
  }
  recipient: {
    id: string
    handle: string
    level: number
    rank: string
  }
}

export default function FriendsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { player: currentPlayer } = usePlayer()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [searching, setSearching] = useState(false)
  const [friends, setFriends] = useState<Player[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [syndicateMembers, setSyndicateMembers] = useState<Player[]>([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingSyndicate, setLoadingSyndicate] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  // Fetch friends list
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("/api/friends/list")
        if (res.ok) {
          const data = await res.json()
          setFriends(data.friends || [])
        }
      } catch (error) {
        console.error("[Friends] Error fetching friends:", error)
      } finally {
        setLoadingFriends(false)
      }
    }

    fetchFriends()
  }, [])

  // Fetch friend requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/friends/requests?type=all")
        if (res.ok) {
          const data = await res.json()
          setFriendRequests(data.requests || [])
        }
      } catch (error) {
        console.error("[Friends] Error fetching requests:", error)
      } finally {
        setLoadingRequests(false)
      }
    }

    fetchRequests()
  }, [])

  // Fetch syndicate members
  useEffect(() => {
    async function fetchSyndicateMembers() {
      try {
        const res = await fetch("/api/friends/syndicate-members")
        if (res.ok) {
          const data = await res.json()
          setSyndicateMembers(data.members || [])
        }
      } catch (error) {
        console.error("[Friends] Error fetching syndicate members:", error)
      } finally {
        setLoadingSyndicate(false)
      }
    }

    fetchSyndicateMembers()
  }, [])

  // Search players
  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.players || [])
      }
    } catch (error) {
      console.error("[Friends] Search error:", error)
      toast({
        title: "Error",
        description: "Failed to search players",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  // Send friend request
  const handleSendRequest = async (playerId: string) => {
    if (actioning) return

    setActioning(playerId)
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: playerId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send request")
      }

      toast({
        title: "Request sent",
        description: "Friend request sent successfully",
      })

      // Update search results
      setSearchResults(prev => prev.map(p => 
        p.id === playerId ? { ...p, friendStatus: 'pending_sent' as const } : p
      ))

      // Update syndicate members
      setSyndicateMembers(prev => prev.map(p => 
        p.id === playerId ? { ...p, friendStatus: 'pending_sent' as const } : p
      ))

      // Refresh requests
      const reqRes = await fetch("/api/friends/requests?type=all")
      if (reqRes.ok) {
        const reqData = await reqRes.json()
        setFriendRequests(reqData.requests || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      })
    } finally {
      setActioning(null)
    }
  }

  // Accept/decline request
  const handleRequestAction = async (requestId: string, action: "accept" | "decline") => {
    if (actioning) return

    setActioning(requestId)
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update request")
      }

      toast({
        title: action === "accept" ? "Request accepted" : "Request declined",
        description: action === "accept" ? "You are now friends!" : "Request declined",
      })

      // Refresh requests and friends
      const [reqRes, friendsRes] = await Promise.all([
        fetch("/api/friends/requests?type=all"),
        fetch("/api/friends/list"),
      ])

      if (reqRes.ok) {
        const reqData = await reqRes.json()
        setFriendRequests(reqData.requests || [])
      }

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json()
        setFriends(friendsData.friends || [])
      }

      // Refresh syndicate members
      const syndRes = await fetch("/api/friends/syndicate-members")
      if (syndRes.ok) {
        const syndData = await syndRes.json()
        setSyndicateMembers(syndData.members || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive",
      })
    } finally {
      setActioning(null)
    }
  }

  // Cancel request
  const handleCancelRequest = async (requestId: string) => {
    if (actioning) return

    setActioning(requestId)
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to cancel request")
      }

      toast({
        title: "Request cancelled",
        description: "Friend request cancelled",
      })

      // Refresh requests and syndicate members
      const [reqRes, syndRes] = await Promise.all([
        fetch("/api/friends/requests?type=all"),
        fetch("/api/friends/syndicate-members"),
      ])

      if (reqRes.ok) {
        const reqData = await reqRes.json()
        setFriendRequests(reqData.requests || [])
      }

      if (syndRes.ok) {
        const syndData = await syndRes.json()
        setSyndicateMembers(syndData.members || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel request",
        variant: "destructive",
      })
    } finally {
      setActioning(null)
    }
  }

  // Filter requests correctly: received = where current player is recipient, sent = where current player is requester
  const receivedRequests = friendRequests.filter(r => 
    r.status === 'pending' && 
    r.recipient?.id === currentPlayer?.id
  )
  const sentRequests = friendRequests.filter(r => 
    r.status === 'pending' && 
    r.requester?.id === currentPlayer?.id
  )

  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Friends</h1>
            <p className="text-sm text-muted-foreground">Connect with other operators</p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching || searchQuery.length < 2}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{player.handle}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>LVL {player.level}</span>
                        <span>•</span>
                        <span>{player.rank}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {player.friendStatus === 'none' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(player.id)}
                        disabled={actioning === player.id}
                        className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                    {player.friendStatus === 'pending_sent' && (
                      <Badge variant="secondary" className="text-xs">
                        Request Sent
                      </Badge>
                    )}
                    {player.friendStatus === 'accepted' && (
                      <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                        Friends
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Syndicate Members Section */}
        {syndicateMembers.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <UsersRound className="w-5 h-5 text-neon-purple" />
              <h2 className="text-lg font-bold text-foreground">Syndicate Members</h2>
            </div>
            <div className="space-y-2">
              {loadingSyndicate ? (
                <div className="text-center py-4 text-muted-foreground text-xs">Loading members...</div>
              ) : (
                syndicateMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center">
                        <UsersRound className="w-5 h-5 text-neon-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{member.handle}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>LVL {member.level}</span>
                          <span>•</span>
                          <span>{member.rank}</span>
                          {'role' in member && member.role && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{member.role}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {member.friendStatus === 'none' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(member.id)}
                          disabled={actioning === member.id}
                          className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/50"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                      {member.friendStatus === 'pending_sent' && (
                        <Badge variant="secondary" className="text-xs">
                          Request Sent
                        </Badge>
                      )}
                      {member.friendStatus === 'pending_received' && (
                        <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                          Wants to be friends
                        </Badge>
                      )}
                      {member.friendStatus === 'accepted' && (
                        <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                          Friends
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Tabs: Friends | Requests */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
            <TabsTrigger
              value="friends"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
            >
              Requests ({receivedRequests.length + sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-3 mt-4">
            {loadingFriends ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Loading friends...</div>
            ) : friends.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No friends yet</p>
                <p className="text-xs text-muted-foreground">Search for players and send friend requests</p>
              </Card>
            ) : (
              friends.map((friend) => (
                <Card key={friend.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{friend.handle}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>LVL {friend.level}</span>
                          <span>•</span>
                          <span>{friend.rank}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                      Friends
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3 mt-4">
            {loadingRequests ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Loading requests...</div>
            ) : receivedRequests.length === 0 && sentRequests.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No requests</p>
                <p className="text-xs text-muted-foreground">Search for players to send friend requests</p>
              </Card>
            ) : (
              <>
                {receivedRequests.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">Received</h3>
                    {receivedRequests.map((request) => (
                      <Card key={request.id} className="p-3 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center">
                              <Users className="w-5 h-5 text-neon-purple" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{request.requester?.handle || 'Unknown'}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>LVL {request.requester?.level || 1}</span>
                                <span>•</span>
                                <span>{request.requester?.rank || 'Initiate'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestAction(request.id, "accept")}
                              disabled={actioning === request.id}
                              className="bg-success/20 hover:bg-success/30 text-success border border-success/50 h-7"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRequestAction(request.id, "decline")}
                              disabled={actioning === request.id}
                              className="h-7"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {sentRequests.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">Sent</h3>
                    {sentRequests.map((request) => (
                      <Card key={request.id} className="p-3 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted/20 border border-border flex items-center justify-center">
                              <Users className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{request.recipient?.handle || 'Unknown'}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>LVL {request.recipient?.level || 1}</span>
                                <span>•</span>
                                <span>{request.recipient?.rank || 'Initiate'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={actioning === request.id}
                              className="h-7"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GameLayout>
  )
}

