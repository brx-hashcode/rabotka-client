import { BaseController } from "mvc-front-sdk";
import { useCsrfStore } from "@/stores/csrf-store";
import { config } from "@/config";

type RequestBody = Record<string, unknown> | FormData;

// mvc-front-sdk throws an object with statusCode when the HTTP response is not ok
function isCsrfError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    (err as { statusCode: number }).statusCode === 403
  );
}

export class RabotkaBaseController extends BaseController {
  constructor() {
    super(config.apiUrl);
  }

  protected mergeCsrfHeaders(headers?: HeadersInit): HeadersInit {
    const token = useCsrfStore.getState().getToken();

    const csrfHeaders: Record<string, string> = token
      ? { "x-csrf-token": token }
      : {};

    if (!headers) {
      return csrfHeaders;
    }

    if (headers instanceof Headers) {
      const merged = new Headers(headers);
      if (token) {
        merged.set("x-csrf-token", token);
      }
      return merged;
    }

    if (Array.isArray(headers)) {
      const merged = [...headers];
      if (token) {
        merged.push(["x-csrf-token", token]);
      }
      return merged;
    }

    return { ...csrfHeaders, ...headers };
  }

  protected get<T>(
    path: string,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.get<T>(
      path,
      this.mergeCsrfHeaders(headers),
      customErrorMessage,
    );
  }

  protected async post<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    try {
      return await this.apiService.post<T>(
        path,
        body,
        this.mergeCsrfHeaders(headers),
        customErrorMessage,
      );
    } catch (err) {
      if (isCsrfError(err)) {
        await useCsrfStore.getState().fetchAndSetToken();
        return this.apiService.post<T>(
          path,
          body,
          this.mergeCsrfHeaders(headers),
          customErrorMessage,
        );
      }
      throw err;
    }
  }

  protected async put<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    try {
      return await this.apiService.put<T>(
        path,
        body,
        this.mergeCsrfHeaders(headers),
        customErrorMessage,
      );
    } catch (err) {
      if (isCsrfError(err)) {
        await useCsrfStore.getState().fetchAndSetToken();
        return this.apiService.put<T>(
          path,
          body,
          this.mergeCsrfHeaders(headers),
          customErrorMessage,
        );
      }
      throw err;
    }
  }

  protected async patch<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    try {
      return await this.apiService.patch<T>(
        path,
        body,
        this.mergeCsrfHeaders(headers),
        customErrorMessage,
      );
    } catch (err) {
      if (isCsrfError(err)) {
        await useCsrfStore.getState().fetchAndSetToken();
        return this.apiService.patch<T>(
          path,
          body,
          this.mergeCsrfHeaders(headers),
          customErrorMessage,
        );
      }
      throw err;
    }
  }

  protected delete<T>(
    path: string,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.delete<T>(
      path,
      this.mergeCsrfHeaders(headers),
      customErrorMessage,
    );
  }
}
