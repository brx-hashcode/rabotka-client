import { BaseController } from "mvc-front-sdk";
import { useCsrfStore } from "@/stores/csrf-store";
import { config } from "@/config";

type RequestBody = Record<string, unknown> | FormData;

// Monotonic counter so two GETs fired within the same millisecond still get
// distinct cache-buster values.
let cacheBusterSeq = 0;

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

  // The app runs inside WhatsApp's in-app WKWebView, whose HTTP cache readily
  // serves cached GET responses without hitting the network — so a React Query
  // refetch after a mutation comes back with stale data and the UI only updates
  // on a manual reload. The underlying SDK issues fetch() with the default
  // cache mode and exposes no way to set `cache: "no-store"`, so we append a
  // unique query param to make every GET URL distinct and thus uncacheable.
  // (A `Cache-Control` request header would be simpler but is not CORS
  // safelisted, so it would require the cross-origin API to allow it.)
  protected bustCache(path: string): string {
    const buster = `_=${Date.now()}${cacheBusterSeq++}`;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${buster}`;
  }

  protected get<T>(
    path: string,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.get<T>(
      this.bustCache(path),
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
