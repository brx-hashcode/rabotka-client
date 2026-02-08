import { env } from "@/env";
import { BaseController } from "mvc-front-sdk";
import { useCsrfStore } from "@/stores/csrf-store";

type RequestBody = Record<string, unknown> | FormData;

export class RabotkaBaseController extends BaseController {
  constructor() {
    super(env.VITE_API_URL);
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

  protected post<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.post<T>(
      path,
      body,
      this.mergeCsrfHeaders(headers),
      customErrorMessage,
    );
  }

  protected put<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.put<T>(
      path,
      body,
      this.mergeCsrfHeaders(headers),
      customErrorMessage,
    );
  }

  protected patch<T>(
    path: string,
    body?: RequestBody,
    headers?: HeadersInit,
    customErrorMessage?: string,
  ): Promise<T> {
    return this.apiService.patch<T>(
      path,
      body,
      this.mergeCsrfHeaders(headers),
      customErrorMessage,
    );
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
