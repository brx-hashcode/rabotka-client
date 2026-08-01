import { RabotkaBaseController } from "./base-controller";

/** An advertisement dispatched on the IN_APP channel, waiting to be shown. */
export type InAppAd = {
  deliveryId: string;
  advertisementId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  callToAction: string | null;
  ctaUrl: string | null;
  tags: string[];
};

class AdInboxController extends RabotkaBaseController {
  list(): Promise<InAppAd[]> {
    return this.get<InAppAd[]>("/ads/inbox");
  }

  /** Dismissal — the ad is not shown again for this delivery. */
  markSeen(deliveryId: string): Promise<void> {
    return this.post<void>(`/ads/inbox/${deliveryId}/seen`);
  }
}

const controller = new AdInboxController();
export const getAdInbox = controller.list.bind(controller);
export const markAdSeen = controller.markSeen.bind(controller);
