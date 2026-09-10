const API_BASE = "https://dhanalaxmi-backend-production.up.railway.app/api";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("dj-auth-token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem("dj-auth-token", token);
  } catch {
    /* ignore */
  }
}

export function removeAuthToken() {
  try {
    localStorage.removeItem("dj-auth-token");
  } catch {
    /* ignore */
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const rawText = await response.text();
      const match = rawText.match(/<pre>(.*?)<\/pre>/s) || rawText.match(/Cannot (POST|GET|PUT|DELETE) [^\s<]+/);
      data = {
        message: match ? match[1]?.trim() || match[0] : (response.status === 404 ? `Endpoint ${endpoint} not found (404)` : `Server returned error (${response.status})`),
      };
    } catch {
      data = { message: `Server error (${response.status})` };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Server responded with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  request,
  // Auth API
  auth: {
    register: (data: { name: string; email?: string; phone: string; password?: string }) =>
      request<{ message: string; user: any; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password?: string }) =>
      request<{ message: string; user: any; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    loginOtp: (data: { phone: string; name?: string }) =>
      request<{ message: string; user: any; token: string }>("/auth/login-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    sendOtp: (data: { phone: string; intent?: "login" | "signup" }) =>
      request<{ message: string; userExists?: boolean; devOtp?: string; warning?: string }>("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyOtp: (data: { phone: string; otp: string; name?: string; intent?: "login" | "signup" }) =>
      request<{ message: string; user: any; token: string }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getProfile: () => request<{ user: any }>("/auth/profile"),
    updateProfile: (data: any) =>
      request<{ user: any }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Customers API
  customers: {
    getAll: () => request<{ customers: any[] }>("/auth/customers"),
  },

  // Addresses API
  addresses: {
    getAll: () => request<{ addresses: any[] }>("/addresses"),
    create: (data: any) =>
      request<{ address: any }>("/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ address: any }>(`/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/addresses/${id}`, {
        method: "DELETE",
      }),
  },

  // Wishlist API
  wishlist: {
    get: () => request<{ wishlist: any[] }>("/wishlist"),
    toggle: (productId: number) =>
      request<{ action: string; message: string; item?: any }>("/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId }),
      }),
  },

  // Products API
  products: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ products: any[]; total: number }>(`/products${query}`);
    },
    getBySlug: (slug: string) => request<{ product: any }>(`/products/${slug}`),
    create: (data: any) =>
      request<{ product: any }>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string | number, data: any) =>
      request<{ product: any }>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string | number) =>
      request<{ message: string }>(`/products/${id}`, {
        method: "DELETE",
      }),
  },

  // Categories API
  categories: {
    getAll: () => request<{ categories: any[] }>("/categories"),
    create: (data: any) => request<{ category: any }>("/categories", { method: "POST", body: JSON.stringify(data) }),
    update: (slug: string, data: any) => request<{ category: any }>(`/categories/${slug}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (slug: string) => request<{ message: string }>(`/categories/${slug}`, { method: "DELETE" }),
  },

  // Banners API
  banners: {
    getAll: () => request<{ banners: any[]; promos: any[] }>("/banners"),
    createBanner: (data: any) => request<{ banner: any }>("/banners/banner", { method: "POST", body: JSON.stringify(data) }),
    updateBanner: (id: string, data: any) => request<{ banner: any }>(`/banners/banner/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteBanner: (id: string) => request<{ message: string }>(`/banners/banner/${id}`, { method: "DELETE" }),
    createPromo: (data: any) => request<{ promo: any }>("/banners/promo", { method: "POST", body: JSON.stringify(data) }),
    updatePromo: (id: string, data: any) => request<{ promo: any }>(`/banners/promo/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deletePromo: (id: string) => request<{ message: string }>(`/banners/promo/${id}`, { method: "DELETE" }),
  },

  // Orders API
  orders: {
    create: (data: any) =>
      request<{ message: string; order: any }>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getUserOrders: () => request<{ orders: any[] }>("/orders/user"),
    track: (identifier: string) => request<{ order: any }>(`/orders/track/${identifier}`),
    getAllAdmin: () => request<{ orders: any[] }>("/orders/admin/all"),
    getAnalytics: () => request<{ totalRevenue: number; totalOrders: number; averageOrderValue: number; chartData: any[] }>("/orders/admin/analytics"),
    updateAdmin: (id: string | number, data: any) =>
      request<{ message: string; order: any }>(`/orders/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  coupons: {
    getAllAdmin: () => request<{ coupons: any[] }>("/coupons"),
    create: (data: any) => request<{ coupon: any }>("/coupons", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ coupon: any }>(`/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ message: string }>(`/coupons/${id}`, { method: "DELETE" }),
    validate: (code: string, cartValue: number) => request<{ coupon: any }>("/coupons/validate", { method: "POST", body: JSON.stringify({ code, cartValue }) }),
  },
  reviews: {
    getAllAdmin: () => request<{ reviews: any[] }>("/reviews/admin/all"),
    updateStatus: (id: number, status: string) => request<{ review: any }>(`/reviews/admin/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    delete: (id: number) => request<{ message: string }>(`/reviews/admin/${id}`, { method: "DELETE" }),
    getProductReviews: (productId: string) => request<{ reviews: any[] }>(`/reviews/product/${productId}`),
    createReview: (productId: string, data: any) => request<{ review: any }>("/reviews", { method: "POST", body: JSON.stringify({ productId, ...data }) }),
  },
  settings: {
    getSilverRate: () => request<{ silverRate: number }>("/settings/silver-rate"),
    updateSilverRate: (data: { rate: number }) => 
      request<{ message: string; silverRate: number }>("/settings/silver-rate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return request<{ message: string; url: string }>("/upload", {
        method: "POST",
        body: formData,
      });
    },
    multiple: (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      return request<{ message: string; images: Array<{ originalName: string; url: string }> }>("/upload/multiple", {
        method: "POST",
        body: formData,
      });
    },
  },
};
