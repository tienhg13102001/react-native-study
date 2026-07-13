import { createContext, useContext, type ReactNode } from "react";
import { useTodos } from "../hooks/useTodos";

// Kiểu của value = đúng những gì useTodos trả về (tự suy ra, khỏi gõ tay)
type TodosContextValue = ReturnType<typeof useTodos>;

// Tạo "kênh". Mặc định null để phát hiện dùng sai chỗ.
const TodosContext = createContext<TodosContextValue | null>(null);

// "Đài phát": gọi useTodos MỘT lần, phát value xuống con
export function TodosProvider({ children }: { children: ReactNode }) {
  const todos = useTodos();
  return <TodosContext.Provider value={todos}>{children}</TodosContext.Provider>;
}

// "Máy thu": component con gọi hàm này để lấy dữ liệu dùng chung
export function useTodosContext() {
  const ctx = useContext(TodosContext);
  if (!ctx) {
    throw new Error("useTodosContext phải được dùng bên trong <TodosProvider>");
  }
  return ctx;
}
