import { RabotkaBaseController } from "./base-controller";

export type AppNotificationType =
  | "PROFILE_VIEW"
  | "JOB_RECOMMENDATION"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "HIRE_CANCELLED"
  | "MISSION_RATED"
  | "NEW_APPLICATION"
  | "APPLICATION_CANCELLED"
  | "MISSION_COMPLETED"
  | "CONTACT_UNLOCKED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "CLAIM_COMMENTED"
  | "CLAIM_STATUS_CHANGED";

/**
 * One row of the bell's feed. The actor only ever appears as a photo — a
 * profile view is anonymised on purpose (see the backend's ProfileNotification
 * model), so there is no actor id or name to show.
 */
export type AppNotification = {
  id: string;
  /** Widened: a type added server-side must still render, with the fallback icon. */
  type: AppNotificationType | (string & {});
  title: string;
  body: string;
  /** In-app path to open on tap, or null. */
  link: string | null;
  metadata: Record<string, unknown> | null;
  /** Photo of whoever caused it, when there is one. Never paired with a name. */
  actorAvatarUrl: string | null;
  createdAt: string;
  readAt: string | null;
};

export type NotificationsPage = {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
};

class NotificationController extends RabotkaBaseController {
  list(page = 1, limit = 20): Promise<NotificationsPage> {
    return this.get<NotificationsPage>(
      `/profile/notifications?page=${page}&limit=${limit}`,
    );
  }

  unreadCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>("/profile/notifications/unread-count");
  }

  markRead(id: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>(
      `/profile/notifications/${id}/read`,
    );
  }

  markAllRead(): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>("/profile/notifications/read-all");
  }

  /** Hides one notification from the feed (swipe to delete). */
  dismiss(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/profile/notifications/${id}`);
  }

  /** « Tout effacer ». */
  clear(): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>("/profile/notifications/clear");
  }
}

const controller = new NotificationController();
export const listNotifications = controller.list.bind(controller);
export const getUnreadNotificationsCount =
  controller.unreadCount.bind(controller);
export const markNotificationRead = controller.markRead.bind(controller);
export const markAllNotificationsRead =
  controller.markAllRead.bind(controller);
export const dismissNotification = controller.dismiss.bind(controller);
export const clearNotifications = controller.clear.bind(controller);
