import { RabotkaBaseController } from "./base-controller";

export type MessageStatus = "CLEAN" | "REDACTED" | "HELD";

export type RedactionCategory =
  | "PHONE"
  | "EMAIL"
  | "MESSAGING_HANDLE"
  | "URL"
  | "OBFUSCATED_DIGITS";

/**
 * One withheld fragment, as OFFSETS INTO `body`.
 *
 * Only ever present on a message this profile SENT. The server strips them for
 * the other side, because positions would say exactly where to ask "what did
 * you write there?".
 *
 * Nothing here reconstructs a body from these. `body` already holds whatever
 * this reader is entitled to see — the server built both views. These offsets
 * are for HIGHLIGHTING the author's own text, and that is all.
 */
export type Redaction = {
  start: number;
  end: number;
  category: RedactionCategory;
};

export type DiscussionMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  /** Sent by this profile. Drives the bubble side and whether redactions exist. */
  mine: boolean;
  /** Already redacted by the server when this profile is not the author. */
  body: string;
  /** Widened: a status added server-side must still render. */
  status: MessageStatus | (string & {});
  redactions: Redaction[];
  createdAt: string;
  readAt: string | null;
};

export type Discussion = {
  id: string;
  counterpartId: string;
  counterpartName: string;
  jobTitle: string | null;
  applicationId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  closed: boolean;
  /** Both parties have paid; the thread stops masking from here on. */
  contactsUnlocked: boolean;
};

export type Page<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

class DiscussionsController extends RabotkaBaseController {
  list(page = 1, limit = 20): Promise<Page<Discussion>> {
    return this.get<Page<Discussion>>(
      `/profile/discussions?page=${page}&limit=${limit}`,
    );
  }

  messages(id: string, page = 1, limit = 50): Promise<Page<DiscussionMessage>> {
    return this.get<Page<DiscussionMessage>>(
      `/profile/discussions/${id}/messages?page=${page}&limit=${limit}`,
    );
  }

  /**
   * Idempotent server-side — a unique index on the application makes a second
   * call return the first result — so the screen may call it on every entry
   * without guarding.
   */
  open(applicationId: string): Promise<{ conversation: { id: string } }> {
    return this.post<{ conversation: { id: string } }>(
      `/profile/discussions/applications/${applicationId}`,
    );
  }

  send(id: string, body: string): Promise<{ message: DiscussionMessage }> {
    return this.post<{ message: DiscussionMessage }>(
      `/profile/discussions/${id}/messages`,
      { body },
    );
  }

  markRead(id: string): Promise<{ ok: boolean; count: number }> {
    return this.post<{ ok: boolean; count: number }>(
      `/profile/discussions/${id}/read`,
    );
  }

  /** « Ce n'était pas un numéro » — only the author of a message may say it. */
  report(messageId: string, note?: string): Promise<{ ok: boolean }> {
    return this.post<{ ok: boolean }>(
      `/profile/discussions/messages/${messageId}/report`,
      note ? { note } : {},
    );
  }
}

const controller = new DiscussionsController();
export const listDiscussions = controller.list.bind(controller);
export const listDiscussionMessages = controller.messages.bind(controller);
export const openDiscussion = controller.open.bind(controller);
export const sendDiscussionMessage = controller.send.bind(controller);
export const markDiscussionRead = controller.markRead.bind(controller);
export const reportRedaction = controller.report.bind(controller);
