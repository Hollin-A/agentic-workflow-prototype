import Anthropic from '@anthropic-ai/sdk'
import { inngest } from '@/inngest/client'
import { supabase } from '@/lib/supabase'
import { ModerationResultSchema } from '@/lib/schemas'

// ---------------------------------------------------------------------------
// NOTE: This file is transitional — Phase 15/16 stubs.
// The generate-patch, validate-patch, and create-pr steps reference the old
// content model (hero.json, overrides, UpdateContentTool, etc.) which has been
// removed. Those steps throw until Phase 17 rewires them to UpdateSectionsTool.
// Kill switch, moderation, and reject flow are fully functional.
// ---------------------------------------------------------------------------

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const processComment = inngest.createFunction(
  {
    id: 'process-comment',
    retries: 2,
    triggers: [{ event: 'comment/submitted' }],
    onFailure: async ({ event, step }: { event: { data: { event: { data: { comment_id: string } }; error: { message: string } } }; step: any }) => {
      const commentId = event.data.event.data.comment_id
      await step.run('mark-failed', async () => {
        await supabase
          .from('comments')
          .update({ status: 'failed', reasoning: `Pipeline failed: ${event.data.error.message}` })
          .eq('id', commentId)
      })
    },
  },
  async ({ event, step }: { event: { data: { comment_id: string } }; step: any }) => {
    const commentId = event.data.comment_id

    // Step 1: Load comment
    const comment = await step.run('load-comment', async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single()
      if (error) throw new Error(`Failed to load comment: ${error.message}`)
      return data
    })

    // Step 1b: Kill switch check — halt before any API spend
    await step.run('check-kill-switch', async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'kill_switch')
        .single()
      if (data?.value === 'true') {
        await supabase
          .from('comments')
          .update({ status: 'failed', reasoning: 'Pipeline halted by kill switch.' })
          .eq('id', commentId)
        throw new Error('Kill switch is active — pipeline halted.')
      }
    })

    // Step 2: Moderation — cheap pass with Haiku
    const moderation = await step.run('moderate', async () => {
      await supabase.from('comments').update({ status: 'moderating' }).eq('id', commentId)

      const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system:
          'You moderate suggestions for a crowd-edited marketing site. ' +
          "Classify each suggestion as 'safe' (a reasonable design or copy change), " +
          "'unsafe' (slurs, threats, personal attacks, spam), or " +
          "'off-topic' (unrelated to the site content or appearance). " +
          'Respond with JSON only: {"verdict": "...", "reason": "..."}',
        messages: [{ role: 'user', content: comment.text }],
      })

      const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      return ModerationResultSchema.parse(JSON.parse(cleaned))
    })

    if (moderation.verdict !== 'safe') {
      await step.run('mark-rejected', async () => {
        await supabase
          .from('comments')
          .update({ status: 'rejected', reasoning: moderation.reason })
          .eq('id', commentId)
      })
      return { rejected: true, reason: moderation.reason }
    }

    // Steps 3–6: generate-patch, validate-patch, create-pr, mark-merged
    // TODO Phase 17: rewire to UpdateSectionsTool + content/sections.json
    await step.run('generate-patch', async () => {
      throw new Error(
        'Phase 17 pending: generate-patch not yet wired to UpdateSectionsTool. ' +
        'Pipeline stops here until the pipeline rewire phase is complete.'
      )
    })
  }
)
