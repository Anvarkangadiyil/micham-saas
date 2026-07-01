type QueryValue = string | number | boolean | null | undefined;

export interface CreateExpenseInput {
  amount: number;
  category: string;
  description: string;
  date: string;
  requestId?: string;
}

export interface GetExpensesParams {
  category?: string;
  sort?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers, ...restOptions } = options;
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    ...restOptions,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function buildQueryString(params?: Record<string, QueryValue> | object): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, QueryValue>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function createExpense<T = unknown>(
  data: CreateExpenseInput
): Promise<T> {
  return apiRequest<T>("/api/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getExpenses<T = unknown>(
  params?: GetExpensesParams,
  options?: RequestInit
): Promise<T> {
  const queryString = buildQueryString(params);
  return apiRequest<T>(`/api/expenses${queryString}`, {
    method: "GET",
    ...options,
  });
}

export interface UpdateExpenseInput {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export async function updateExpense<T = unknown>(
  id: string,
  data: UpdateExpenseInput
): Promise<T> {
  return apiRequest<T>(`/api/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteExpense<T = unknown>(
  id: string
): Promise<T> {
  return apiRequest<T>(`/api/expenses/${id}`, {
    method: "DELETE",
  });
}
