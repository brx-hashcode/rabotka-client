import { RabotkaBaseController } from "./base-controller";
import { config } from "@/config";

/** Which CV goes with an application: the one Rabotka builds, or the worker's own. */
export type CvChoice = "RABOTKA" | "UPLOADED";

export type ProfileCv = {
  uploaded: {
    fileName: string;
    sizeBytes: number;
    mimeType: string;
    uploadedAt: string;
  } | null;
  /** Sent when nothing is chosen: from WhatsApp, through an agent. */
  preferred: CvChoice;
};

/** « Mon CV »: the worker's own CV on their profile. */
class ProfileCvController extends RabotkaBaseController {
  async getProfileCv(): Promise<ProfileCv> {
    try {
      return await this.get<ProfileCv>("/profile/cv");
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadProfileCv(file: File): Promise<ProfileCv> {
    try {
      const formData = new FormData();
      formData.append("cv", file);
      return await this.post<ProfileCv>("/profile/cv", formData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeProfileCv(): Promise<ProfileCv> {
    try {
      return await this.delete<ProfileCv>("/profile/cv");
    } catch (error) {
      this.handleError(error);
    }
  }

  async setCvPreference(preferred: CvChoice): Promise<ProfileCv> {
    try {
      return await this.patch<ProfileCv>("/profile/cv/preference", {
        preferred,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const {
  getProfileCv,
  uploadProfileCv,
  removeProfileCv,
  setCvPreference,
} = new ProfileCvController();

/** The worker's own CV, opened as a real link: a WebView cannot open `blob:`. */
export function profileCvFileUrl(): string {
  return `${config.apiUrl}/profile/cv/file`;
}

/** The CV Rabotka builds from the profile and missions. */
export function rabotkaCvUrl(): string {
  return `${config.apiUrl}/profile/resume/download`;
}
