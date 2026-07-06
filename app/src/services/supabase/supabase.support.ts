// Support tickets on Supabase. A guided intake form creates a ticket row AND
// posts a formatted summary into the support DM, so the user still lands in a
// live chat with the support account while every request is also logged.

import { supabase, currentUserId } from './client';
import { findOrCreateDirectConversation, sendChatMessage } from './supabase.chat';

export type SupportTicketInput = {
  category: string;
  subject: string;
  description: string;
};

export type SupportTicketResult = {
  ticketId: string;
  // Empty when the support conversation couldn't be opened (e.g. the support
  // profile isn't seeded). The ticket is still logged; the screen shows a
  // confirmation instead of navigating to chat.
  conversationId: string;
};

const shortId = (id: string) => id.replace(/-/g, '').slice(0, 8).toUpperCase();

/**
 * Create a support ticket and open the support conversation.
 *
 * 1. insert the ticket row (RLS: user_id forced to the caller)
 * 2. find/create the DM with the support account
 * 3. post a formatted opening message so the agent has full context
 * 4. link the conversation back onto the ticket row
 *
 * Returns the ticket id + the support conversation id (for navigation).
 */
export async function createSupportTicket(
  supportProfileId: string,
  input: SupportTicketInput,
): Promise<SupportTicketResult> {
  const me = await currentUserId();
  if (!me) throw new Error('Not authenticated');

  const category = (input.category || 'Other').trim().slice(0, 60);
  const subject = input.subject.trim().slice(0, 200);
  const description = input.description.trim().slice(0, 4000);
  if (!subject) throw new Error('Please add a subject');
  if (!description) throw new Error('Please describe your issue');

  // 1) log the ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .insert({ user_id: me, category, subject, description })
    .select('id')
    .single();
  if (ticketErr) throw ticketErr;
  const ticketId = ticket.id as string;

  // 2) open the support conversation. If this fails (e.g. the support profile
  // isn't seeded), the ticket is ALREADY logged — degrade to a confirmation
  // rather than losing the request.
  let conversationId = '';
  try {
    conversationId = await findOrCreateDirectConversation(supportProfileId);
  } catch (e) {
    if (__DEV__) console.warn('support conversation open failed', e);
    return { ticketId, conversationId: '' };
  }

  // 3) post the formatted summary (best-effort — the ticket is already logged)
  const summary =
    `🎫 New support ticket #${shortId(ticketId)}\n` +
    `Category: ${category}\n` +
    `Subject: ${subject}\n\n` +
    `${description}`;
  try {
    await sendChatMessage(conversationId, summary);
  } catch (e) {
    if (__DEV__) console.warn('support summary post failed', e);
  }

  // 4) link the conversation to the ticket (best-effort)
  try {
    await supabase
      .from('support_tickets')
      .update({ conversation_id: conversationId })
      .eq('id', ticketId);
  } catch (e) {
    if (__DEV__) console.warn('support ticket link failed', e);
  }

  return { ticketId, conversationId };
}

// Fixed intake categories (kept in sync with the ticket screen).
export const SUPPORT_CATEGORIES = [
  'Account',
  'Billing / Donations',
  'Technical issue',
  'Report a user',
  'Feedback',
  'Other',
] as const;
