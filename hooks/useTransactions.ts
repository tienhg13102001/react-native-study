import { useCallback, useEffect, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  getCategories,
  listTransactions,
  type Categories,
  type Transaction,
  type TransactionInput,
} from "../lib/api";

/**
 * Hook dữ liệu cho app chi tiêu.
 * Tối ưu tốc độ: danh mục tải 1 lần; thêm/xóa cập nhật ngay tại máy
 * (optimistic) thay vì tải lại toàn bộ từ server sau mỗi thao tác.
 */
export function useTransactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [categories, setCategories] = useState<Categories | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Danh mục: tải MỘT lần (ít khi đổi)
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => console.warn("Không tải được danh mục:", e));
  }, []);

  // Danh sách giao dịch: tải lại khi đổi tháng/năm
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listTransactions(month, year);
      setTransactions([...list].reverse()); // mới nhất lên đầu
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Thêm: 1 lần gọi API, rồi chèn ngay vào danh sách tại máy
  const add = useCallback(
    async (input: TransactionInput) => {
      const { id } = await createTransaction(input);
      const d = new Date(input.date);
      const newTx: Transaction = {
        id,
        date: input.date,
        type: input.type,
        content: input.content,
        note: input.note ?? "",
        amount: input.amount,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      };
      // chỉ hiển thị nếu thuộc tháng/năm đang xem
      if (newTx.month === month && newTx.year === year) {
        setTransactions((prev) => [newTx, ...prev]);
      }
    },
    [month, year]
  );

  // Xóa: bỏ ngay tại máy (optimistic), lỗi thì hoàn tác
  const remove = useCallback(async (id: string) => {
    let snapshot: Transaction[] = [];
    setTransactions((prev) => {
      snapshot = prev;
      return prev.filter((t) => t.id !== id);
    });
    try {
      await deleteTransaction(id);
    } catch (e) {
      setTransactions(snapshot); // hoàn tác
      throw e;
    }
  }, []);

  return {
    categories,
    transactions,
    loading,
    error,
    month,
    year,
    setMonth,
    setYear,
    reload: loadTransactions,
    add,
    remove,
  };
}
