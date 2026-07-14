/**
 * Lớp gọi API tới backend Google Apps Script.
 * URL + token đọc từ biến môi trường EXPO_PUBLIC_* (xem .env.local).
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN;

if (!API_URL) {
  console.warn("⚠️ Thiếu EXPO_PUBLIC_API_URL — kiểm tra .env.local rồi chạy `npx expo start -c`");
}

/*** Kiểu dữ liệu ***/
export type Loai = "Thu" | "Chi";

export type Transaction = {
  id: string;
  date: string; // "yyyy-MM-dd"
  type: string; // "Thu" | "Chi"
  content: string;
  note: string;
  amount: number;
  month: number | null;
  year: number | null;
};

export type Categories = {
  loai: string[]; // ["Thu", "Chi"]
  thu: string[];  // nội dung Thu
  chi: string[];  // nội dung Chi
};

export type TransactionInput = {
  date: string;
  type: string;
  content: string;
  note?: string;
  amount: number;
};

/*** Hàm gọi chung ***/

// GET: ghép query string (kèm token) rồi đọc JSON { ok, data, error }
async function apiGet<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ token: API_TOKEN ?? "", ...params }).toString();
  const res = await fetch(`${API_URL}?${qs}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Lỗi không xác định");
  return json.data as T;
}

// POST: gửi JSON body (kèm token) cho các thao tác ghi
async function apiPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: API_TOKEN, ...body }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Lỗi không xác định");
  return json.data as T;
}

/*** API cụ thể ***/

export function getCategories(): Promise<Categories> {
  return apiGet<Categories>({ action: "categories" });
}

export function listTransactions(month?: number, year?: number): Promise<Transaction[]> {
  const params: Record<string, string> = { action: "list" };
  if (month) params.month = String(month);
  if (year) params.year = String(year);
  return apiGet<Transaction[]>(params);
}

export function createTransaction(data: TransactionInput): Promise<{ id: string }> {
  return apiPost<{ id: string }>({ action: "create", data });
}

export function updateTransaction(
  id: string,
  data: Partial<TransactionInput>
): Promise<{ id: string; updated: boolean }> {
  return apiPost<{ id: string; updated: boolean }>({ action: "update", id, data });
}

export function deleteTransaction(id: string): Promise<{ id: string; deleted: boolean }> {
  return apiPost<{ id: string; deleted: boolean }>({ action: "delete", id });
}
