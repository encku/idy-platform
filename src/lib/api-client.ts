const API_BASE = ""

class ApiClient {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    })

    if (res.status === 401) {
      // Try refresh
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" })
      if (refreshRes.ok) {
        // Retry original request
        const retryRes = await fetch(`${API_BASE}${url}`, {
          ...options,
          headers: {
            ...(options.body instanceof FormData
              ? {}
              : { "Content-Type": "application/json" }),
            ...options.headers,
          },
        })
        if (retryRes.ok) return retryRes.json()
      }
      window.location.href = "/login"
      throw new Error("Unauthorized")
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "An error occurred" }))
      throw err
    }

    return res.json()
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url)
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  }

  async put<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  }

  async del<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
