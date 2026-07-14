import { createContext, useContext, type ReactNode } from "react";
import { useTransactions } from "../hooks/useTransactions";

// Kiểu value = đúng những gì useTransactions trả về
type TransactionsContextValue = ReturnType<typeof useTransactions>;

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

// Gọi useTransactions MỘT lần ở đây, phát cho cả 3 tab dùng chung
export function TransactionsProvider({ children }: { children: ReactNode }) {
  const value = useTransactions();
  return (
    <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
  );
}

export function useTransactionsContext() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error("useTransactionsContext phải được dùng bên trong <TransactionsProvider>");
  }
  return ctx;
}
