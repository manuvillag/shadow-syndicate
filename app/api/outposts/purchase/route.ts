import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player to check credits and level
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits, level')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get all outpost templates
    const { data: templates, error: templatesError } = await supabase
      .from('outpost_templates')
      .select('*')

    if (templatesError) {
      console.error('[API] Templates fetch error:', templatesError)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Get outposts the player already owns (by template_id)
    const { data: ownedOutposts, error: ownedError } = await supabase
      .from('outposts')
      .select('outpost_template_id')
      .eq('player_id', player.id)
      .not('outpost_template_id', 'is', null)

    if (ownedError) {
      console.error('[API] Owned outposts fetch error:', ownedError)
    }

    const ownedTemplateIds = new Set(
      (ownedOutposts || [])
        .map((o) => o.outpost_template_id)
        .filter((id): id is string => id !== null)
    )

    // Filter out owned templates, calculate locked status, and sort by level requirement first, then price
    const marketplaceOutposts = (templates || [])
      .filter((template) => !ownedTemplateIds.has(template.id))
      .map((template) => {
        const canAfford = player.credits >= template.base_price
        const meetsLevel = player.level >= template.level_requirement
        const locked = !canAfford || !meetsLevel

        return {
          id: template.id,
          name: template.name,
          type: template.type,
          incomeRate: template.base_income_rate,
          price: template.base_price,
          level: template.level_requirement,
          imageUrl: template.image_url ?? null,
          locked,
          requirements: locked 
            ? (!meetsLevel ? `Level ${template.level_requirement} required` : 'Insufficient credits')
            : undefined,
        }
      })
      .sort((a, b) => {
        // First sort by level requirement
        if (a.level !== b.level) {
          return a.level - b.level
        }
        // Then sort by price
        return a.price - b.price
      })

    return NextResponse.json({ outposts: marketplaceOutposts })
  } catch (error) {
    console.error('[API] Marketplace fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { marketplaceId } = body

    if (!marketplaceId) {
      return NextResponse.json({ error: 'Marketplace ID is required' }, { status: 400 })
    }

    // Get the outpost template
    const { data: template, error: templateError } = await supabase
      .from('outpost_templates')
      .select('*')
      .eq('id', marketplaceId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Outpost template not found' }, { status: 404 })
    }

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, credits, level')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if player already owns this outpost template
    const { data: existingOutpost } = await supabase
      .from('outposts')
      .select('id')
      .eq('player_id', player.id)
      .eq('outpost_template_id', template.id)
      .single()

    if (existingOutpost) {
      return NextResponse.json({ error: 'You already own this outpost' }, { status: 400 })
    }

    // Check if player can afford it
    if (player.credits < template.base_price) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    // Check level requirement
    if (player.level < template.level_requirement) {
      return NextResponse.json({ error: `Level ${template.level_requirement} required` }, { status: 400 })
    }

    // Create outpost and deduct credits
    const { data: newOutpost, error: createError } = await supabase
      .from('outposts')
      .insert({
        player_id: player.id,
        outpost_template_id: template.id,
        name: template.name,
        type: template.type,
        level: 1,
        income_rate: template.base_income_rate,
        last_collected_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('[API] Outpost creation error:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('players')
      .update({ credits: player.credits - template.base_price })
      .eq('id', player.id)

    if (updateError) {
      console.error('[API] Credits deduction error:', updateError)
      // Try to delete the outpost we just created
      await supabase.from('outposts').delete().eq('id', newOutpost.id)
      return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      outpost: {
        id: newOutpost.id,
        name: newOutpost.name,
        type: newOutpost.type,
        level: newOutpost.level,
        incomeRate: newOutpost.income_rate,
      },
      newCredits: player.credits - template.base_price 
    })
  } catch (error) {
    console.error('[API] Purchase outpost error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


