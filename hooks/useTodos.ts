import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { useEffect, useState } from "react";
import type { Todo } from "../types";

const STORAGE_KEY = "@rn_study_todos";

export function useTodos() {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Nạp todo cũ 1 lần khi mở app
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTodos(JSON.parse(raw));
      } catch (e) {
        console.warn("Không đọc được todo đã lưu:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTodos();
  }, []);

  // Lưu mỗi khi todos đổi (chặn bẫy ghi đè bằng isLoaded)
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, isLoaded]);

  const addTodo = (title: string) => {
    if (!title.trim()) return;
    const newTodo: Todo = { id: Crypto.randomUUID(), title: title.trim(), done: false };
    setTodos((prev) => [...prev, newTodo]);
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const editTodo = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title: newTitle.trim() } : t)));
  };

  // "Cửa sổ" hook trưng ra ngoài: dữ liệu + các hành động
  return { todos, addTodo, removeTodo, toggleTodo, editTodo };
}
