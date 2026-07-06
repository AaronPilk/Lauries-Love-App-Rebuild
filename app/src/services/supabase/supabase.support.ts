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

// ---------------------------------------------------------------------------
// STAFF / AGENT SIDE (in-app support inbox — gated by support_staff RLS)
// ---------------------------------------------------------------------------

export type StaffMember = { id: string; name: string };

export type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  assignedTo: string | null;
  assigneeName: string | null;
  conversationId: string | null;
  createdAt: string;
  reporterId: string | null;
  reporterName: string;
  reporterEmail: string | null;
  reporterPhone: string | null;
};

const staffName = (p: any) =>
  p ? p.display_name || p.first_name || 'Member' : 'Member';

/** Is the current user a support agent? (RPC is SECURITY DEFINER, auth-only.) */
export async function getIsSupportStaff(): Promise<boolean> {
  const me = await currentUserId();
  if (!me) return false;
  const { data, error } = await supabase.rpc('is_support_staff');
  if (error) {
    if (__DEV__) console.warn('is_support_staff check failed', error);
    return false;
  }
  return data === true;
}

/** Staff list for the assignee picker (RLS returns rows only to staff). */
export async function listSupportStaff(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('support_staff')
    .select('profile_id, profiles(first_name, display_name)');
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    id: s.profile_id,
    name: staffName(s.profiles),
  }));
}

/** All tickets (staff-only via RLS), newest first, with reporter + assignee. */
export async function getSupportTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(TICKET_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTicket);
}

const TICKET_SELECT = `id, category, subject, description, status, assigned_to, conversation_id, created_at,
       reporter:profiles!support_tickets_user_id_fkey(id, first_name, display_name, profiles_private(email, phone_number)),
       assignee:profiles!support_tickets_assigned_to_fkey(first_name, display_name)`;

function mapTicket(t: any): SupportTicket {
  const priv = t.reporter?.profiles_private ?? null;
  return {
    id: t.id,
    category: t.category,
    subject: t.subject,
    description: t.description,
    status: t.status,
    assignedTo: t.assigned_to ?? null,
    assigneeName: t.assignee ? staffName(t.assignee) : null,
    conversationId: t.conversation_id ?? null,
    createdAt: t.created_at,
    reporterId: t.reporter?.id ?? null,
    reporterName: staffName(t.reporter),
    reporterEmail: priv?.email ?? null,
    reporterPhone: priv?.phone_number ?? null,
  };
}

/** One ticket by id (staff-only via RLS). */
export async function getSupportTicketById(
  ticketId: string,
): Promise<SupportTicket | null> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(TICKET_SELECT)
    .eq('id', ticketId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapTicket(data) : null;
}

/** Triage: update status and/or assignee (staff-only via RLS). */
export async function updateSupportTicketTriage(
  ticketId: string,
  patch: { status?: SupportTicket['status']; assignedTo?: string | null },
): Promise<void> {
  const row: Record<string, any> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.assignedTo !== undefined) row.assigned_to = patch.assignedTo;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase
    .from('support_tickets')
    .update(row)
    .eq('id', ticketId);
  if (error) throw error;
}
