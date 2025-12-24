"use client"

import { useState, useEffect } from "react"
import { GameLayout } from "@/components/game-layout"
import { ItemCard } from "@/components/item-card"
import { ItemMarketplaceCard } from "@/components/item-marketplace-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sword, Shield, Zap, Package, X, Store } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/hooks/use-player"
import { mapPlayerToHudData, formatPlayerId } from "@/lib/player-utils"
import { useToast } from "@/hooks/use-toast"
import { ItemCardSkeleton } from "@/components/loading-skeletons"
import { ErrorPage } from "@/components/error-display"
import { Skeleton } from "@/components/ui/skeleton"

interface InventoryItem {
  id: string
  quantity: number
  equipped: boolean
  slot: string | null
  item: {
    id: string
    name: string
    rarity: "common" | "rare" | "epic" | "legendary"
    type: "weapon" | "armor" | "gadget" | "consumable"
    attack_boost?: number | null
    defense_boost?: number | null
    special_boost?: string | null
  }
}

export default function LoadoutPage() {
  const router = useRouter()
  const { player, loading: playerLoading, error: playerError, refetch: refetchPlayer } = usePlayer()
  const { toast } = useToast()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false) // Start false, only show when actually loading
  const [equipping, setEquipping] = useState<string | null>(null)
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([])
  const [loadingMarketplace, setLoadingMarketplace] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  // Fetch inventory
  useEffect(() => {
    async function fetchInventory() {
      if (!player) return
      
      setLoading(true)
      try {
        const res = await fetch('/api/inventory')
        if (!res.ok) {
          throw new Error('Failed to fetch inventory')
        }
        const data = await res.json()
        setInventory(data.items || [])
      } catch (error) {
        console.error('[Loadout] Error fetching inventory:', error)
        toast({
          title: "Error",
          description: "Failed to load inventory",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (player) {
      fetchInventory()
      // Also fetch marketplace on initial load
      fetchMarketplace()
    }
  }, [player, toast])

  // Fetch marketplace
  const fetchMarketplace = async () => {
    if (!player) return
    
    // Only show loading if we have no items yet
    if (marketplaceItems.length === 0) {
      setLoadingMarketplace(true)
    }
    
    try {
      const res = await fetch('/api/items/marketplace')
      if (!res.ok) {
        throw new Error('Failed to fetch marketplace')
      }
      const data = await res.json()
      setMarketplaceItems(data.items || [])
    } catch (error) {
      console.error('[Loadout] Error fetching marketplace:', error)
      toast({
        title: "Error",
        description: "Failed to load marketplace",
        variant: "destructive",
      })
    } finally {
      setLoadingMarketplace(false)
    }
  }

  // Handle purchase
  const handlePurchase = async (itemId: string) => {
    if (purchasing || !player) return

    setPurchasing(itemId)
    try {
      const res = await fetch('/api/items/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: itemId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to purchase item')
      }

      const data = await res.json()
      
      // Refresh inventory and marketplace
      const invRes = await fetch('/api/inventory')
      if (invRes.ok) {
        const invData = await invRes.json()
        setInventory(invData.items || [])
      }
      
      fetchMarketplace()
      
      // Refetch player to update credits
      refetchPlayer()

      toast({
        title: "Purchased!",
        description: data.message || "Item added to inventory",
      })
    } catch (error) {
      console.error('[Loadout] Purchase error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase item",
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  // Handle equip
  const handleEquip = async (inventoryItem: InventoryItem) => {
    if (equipping) return // Prevent double-clicks

    const slot = inventoryItem.item.type === 'consumable' ? null : inventoryItem.item.type
    if (!slot) {
      toast({
        title: "Cannot Equip",
        description: "Consumables cannot be equipped",
        variant: "destructive",
      })
      return
    }

    setEquipping(inventoryItem.id)
    try {
      const res = await fetch('/api/inventory/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: inventoryItem.id,
          slot,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to equip item')
      }

      // Refresh inventory
      const invRes = await fetch('/api/inventory')
      if (invRes.ok) {
        const invData = await invRes.json()
        setInventory(invData.items || [])
      }

      toast({
        title: "Equipped",
        description: `${inventoryItem.item.name} has been equipped`,
      })
    } catch (error) {
      console.error('[Loadout] Equip error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to equip item",
        variant: "destructive",
      })
    } finally {
      setEquipping(null)
    }
  }

  // Handle unequip
  const handleUnequip = async (inventoryItem: InventoryItem) => {
    if (equipping) return // Prevent double-clicks

    setEquipping(inventoryItem.id)
    try {
      const res = await fetch(`/api/inventory/equip?id=${inventoryItem.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to unequip item')
      }

      // Refresh inventory
      const invRes = await fetch('/api/inventory')
      if (invRes.ok) {
        const invData = await invRes.json()
        setInventory(invData.items || [])
      }

      toast({
        title: "Unequipped",
        description: `${inventoryItem.item.name} has been unequipped`,
      })
    } catch (error) {
      console.error('[Loadout] Unequip error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unequip item",
        variant: "destructive",
      })
    } finally {
      setEquipping(null)
    }
  }

  // Show error state (but still render if we have player data)
  if (playerError && !player) {
    return (
      <ErrorPage
        error={playerError || "Player not found"}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Format player ID for display
  const playerId = player?.id ? formatPlayerId(player.id) : undefined
  
  const playerStats = player ? mapPlayerToHudData(player) : {
    credits: 0,
    alloy: 0,
    xpCurrent: 0,
    xpMax: 1000,
    charge: 0,
    chargeMax: 100,
    adrenal: 0,
    adrenalMax: 50,
    health: 100,
    healthMax: 100,
  }

  // Filter inventory by type
  const weapons = inventory.filter((inv) => inv.item.type === 'weapon')
  const armor = inventory.filter((inv) => inv.item.type === 'armor')
  const gadgets = inventory.filter((inv) => inv.item.type === 'gadget')
  const consumables = inventory.filter((inv) => inv.item.type === 'consumable')

  // Find equipped items
  const equippedWeapon = weapons.find((w) => w.equipped && w.slot === 'weapon')
  const equippedArmor = armor.find((a) => a.equipped && a.slot === 'armor')
  const equippedGadget = gadgets.find((g) => g.equipped && g.slot === 'gadget')

  // Calculate total stats from equipped items
  const totalAttack = (equippedWeapon?.item.attack_boost || 0) + (equippedGadget?.item.attack_boost || 0)
  const totalDefense = (equippedArmor?.item.defense_boost || 0) + (equippedGadget?.item.defense_boost || 0)

  // Convert inventory item to ItemCard props
  const toItemCardProps = (inv: InventoryItem) => ({
    name: inv.item.name,
    rarity: inv.item.rarity,
    type: inv.item.type,
    attackBoost: inv.item.attack_boost ?? undefined,
    defenseBoost: inv.item.defense_boost ?? undefined,
    specialBoost: inv.item.special_boost ?? undefined,
    equipped: inv.equipped,
    onEquip: () => handleEquip(inv),
    quantity: inv.quantity,
  })

  return (
    <GameLayout>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loadout</h1>
            <p className="text-sm text-muted-foreground">Manage your equipment</p>
          </div>
        </div>

        {/* Equipped Section */}
        <Card className="p-4 bg-card/50 border-2 border-neon-cyan/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">Currently Equipped</h2>
            {(totalAttack > 0 || totalDefense > 0) && (
              <div className="flex items-center gap-3 text-xs font-mono">
                {totalAttack > 0 && (
                  <span className="text-destructive font-bold">+{totalAttack} ATK</span>
                )}
                {totalDefense > 0 && (
                  <span className="text-neon-cyan font-bold">+{totalDefense} DEF</span>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-background/50 rounded-lg p-3 border border-border relative">
              <div className="flex items-center gap-2 mb-2">
                <Sword className="w-4 h-4 text-destructive" />
                <span className="text-xs text-muted-foreground uppercase font-mono">Weapon</span>
              </div>
              {equippedWeapon ? (
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight pr-6">{equippedWeapon.item.name}</p>
                  {equippedWeapon.item.attack_boost && (
                    <p className="text-xs text-destructive font-mono mt-1">+{equippedWeapon.item.attack_boost} ATK</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleUnequip(equippedWeapon)}
                    disabled={equipping === equippedWeapon.id}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">None</p>
              )}
            </div>

            <div className="bg-background/50 rounded-lg p-3 border border-border relative">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-neon-cyan" />
                <span className="text-xs text-muted-foreground uppercase font-mono">Armor</span>
              </div>
              {equippedArmor ? (
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight pr-6">{equippedArmor.item.name}</p>
                  {equippedArmor.item.defense_boost && (
                    <p className="text-xs text-neon-cyan font-mono mt-1">+{equippedArmor.item.defense_boost} DEF</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-neon-cyan"
                    onClick={() => handleUnequip(equippedArmor)}
                    disabled={equipping === equippedArmor.id}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">None</p>
              )}
            </div>

            <div className="bg-background/50 rounded-lg p-3 border border-border relative">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-neon-purple" />
                <span className="text-xs text-muted-foreground uppercase font-mono">Gadget</span>
              </div>
              {equippedGadget ? (
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight pr-6">{equippedGadget.item.name}</p>
                  {equippedGadget.item.special_boost && (
                    <p className="text-xs text-neon-purple mt-1">{equippedGadget.item.special_boost}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-neon-purple"
                    onClick={() => handleUnequip(equippedGadget)}
                    disabled={equipping === equippedGadget.id}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">None</p>
              )}
            </div>
          </div>
        </Card>

        {/* Main Tabs: Shop | Inventory */}
        <Tabs 
          defaultValue="shop" 
          className="w-full"
          onValueChange={(value) => {
            if (value === 'shop') {
              fetchMarketplace()
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-4">
            <TabsTrigger
              value="shop"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              <Store className="w-4 h-4 mr-2" />
              Shop
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
            >
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
          </TabsList>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-3">
            <Tabs defaultValue="weapons" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border mb-4">
                <TabsTrigger
                  value="weapons"
                  className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive"
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Weapons
                </TabsTrigger>
                <TabsTrigger
                  value="armor"
                  className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Armor
                </TabsTrigger>
                <TabsTrigger
                  value="gadgets"
                  className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Gadgets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weapons" className="space-y-3">
                {loadingMarketplace && marketplaceItems.length === 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full opacity-40" />
                    ))}
                  </div>
                ) : marketplaceItems.filter(i => i.type === 'weapon').length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Sword className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground mb-1">No weapons available</p>
                    <p className="text-xs text-muted-foreground">Check back later for new items!</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {marketplaceItems.filter(i => i.type === 'weapon').map((item) => (
                      <ItemMarketplaceCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        rarity={item.rarity}
                        type={item.type}
                        attackBoost={item.attackBoost}
                        defenseBoost={item.defenseBoost}
                        specialBoost={item.specialBoost}
                        price={item.price}
                        levelRequirement={item.levelRequirement}
                        description={item.description}
                        playerLevel={player?.level || 1}
                        playerCredits={player?.credits || 0}
                        onPurchase={() => handlePurchase(item.id)}
                        purchasing={purchasing === item.id}
                        locked={item.locked}
                        isOwned={item.isOwned}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="armor" className="space-y-3">
                {loadingMarketplace && marketplaceItems.length === 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full opacity-40" />
                    ))}
                  </div>
                ) : marketplaceItems.filter(i => i.type === 'armor').length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground mb-1">No armor available</p>
                    <p className="text-xs text-muted-foreground">Check back later for new items!</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {marketplaceItems.filter(i => i.type === 'armor').map((item) => (
                      <ItemMarketplaceCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        rarity={item.rarity}
                        type={item.type}
                        attackBoost={item.attackBoost}
                        defenseBoost={item.defenseBoost}
                        specialBoost={item.specialBoost}
                        price={item.price}
                        levelRequirement={item.levelRequirement}
                        description={item.description}
                        playerLevel={player?.level || 1}
                        playerCredits={player?.credits || 0}
                        onPurchase={() => handlePurchase(item.id)}
                        purchasing={purchasing === item.id}
                        locked={item.locked}
                        isOwned={item.isOwned}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gadgets" className="space-y-3">
                {loadingMarketplace && marketplaceItems.length === 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full opacity-40" />
                    ))}
                  </div>
                ) : marketplaceItems.filter(i => i.type === 'gadget').length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground mb-1">No gadgets available</p>
                    <p className="text-xs text-muted-foreground">Check back later for new items!</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {marketplaceItems.filter(i => i.type === 'gadget').map((item) => (
                      <ItemMarketplaceCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        rarity={item.rarity}
                        type={item.type}
                        attackBoost={item.attackBoost}
                        defenseBoost={item.defenseBoost}
                        specialBoost={item.specialBoost}
                        price={item.price}
                        levelRequirement={item.levelRequirement}
                        description={item.description}
                        playerLevel={player?.level || 1}
                        playerCredits={player?.credits || 0}
                        onPurchase={() => handlePurchase(item.id)}
                        purchasing={purchasing === item.id}
                        locked={item.locked}
                        isOwned={item.isOwned}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-3">
            <Tabs defaultValue="weapons" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border mb-4">
                <TabsTrigger
                  value="weapons"
                  className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive"
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Weapons
                </TabsTrigger>
                <TabsTrigger
                  value="armor"
                  className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Armor
                </TabsTrigger>
                <TabsTrigger
                  value="gadgets"
                  className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Gadgets
                </TabsTrigger>
                <TabsTrigger
                  value="consumables"
                  className="data-[state=active]:bg-success/20 data-[state=active]:text-success"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Items
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weapons" className="space-y-3">
            {weapons.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Sword className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No weapons in inventory</p>
                <p className="text-xs text-muted-foreground">Win skirmishes or complete contracts to get loot!</p>
              </Card>
            ) : (
              weapons.map((weapon) => (
                <ItemCard
                  key={weapon.id}
                  {...toItemCardProps(weapon)}
                  onEquip={() => handleEquip(weapon)}
                />
              ))
            )}
          </TabsContent>

              <TabsContent value="armor" className="space-y-3">
            {loading && armor.length === 0 && inventory.length === 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2].map((i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            ) : armor.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No armor in inventory</p>
                <p className="text-xs text-muted-foreground">Win skirmishes or complete contracts to get loot!</p>
              </Card>
            ) : (
              armor.map((item) => (
                <ItemCard
                  key={item.id}
                  {...toItemCardProps(item)}
                  onEquip={() => handleEquip(item)}
                />
              ))
            )}
          </TabsContent>

              <TabsContent value="gadgets" className="space-y-3">
            {loading && gadgets.length === 0 && inventory.length === 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2].map((i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            ) : gadgets.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No gadgets in inventory</p>
                <p className="text-xs text-muted-foreground">Win skirmishes or complete contracts to get loot!</p>
              </Card>
            ) : (
              gadgets.map((gadget) => (
                <ItemCard
                  key={gadget.id}
                  {...toItemCardProps(gadget)}
                  onEquip={() => handleEquip(gadget)}
                />
              ))
            )}
          </TabsContent>

              <TabsContent value="consumables" className="space-y-3">
            {consumables.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">No consumables in inventory</p>
                <p className="text-xs text-muted-foreground">Win skirmishes or complete contracts to get loot!</p>
              </Card>
            ) : (
              <>
                <div className="mb-3 p-2 bg-muted/20 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    <span className="font-semibold text-foreground">Consumables</span> are loot items collected from combat and contracts. 
                    Use functionality coming soon!
                  </p>
                </div>
                {consumables.map((consumable) => (
                  <ItemCard
                    key={consumable.id}
                    {...toItemCardProps(consumable)}
                    equipped={false}
                    onEquip={() => {}}
                  />
                ))}
              </>
            )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

    </GameLayout>
  )
}
