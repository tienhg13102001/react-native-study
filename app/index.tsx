import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import TodoItem from "../components/TodoItem";
import type { Todo } from "../types";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");
  const [todos, setTodos] = useState<Array<Todo>>([]);

  const addTodo = () => {
    if (!textInput.trim()) return; // Tránh thêm việc rỗng
    const newTodo: Todo = { id: Date.now().toString(), title: textInput, done: false };
    setTodos((prev) => [...prev, newTodo]);
    setTextInput("");
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    // Header của Stack đã lo phần né tai thỏ ở trên, nên không cần SafeAreaView top nữa.
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <View style={styles.inputContainer}>
        <TextInput value={textInput} onChangeText={setTextInput} placeholder="Nhập việc..." placeholderTextColor="#6B7280" style={styles.input} />
        <Pressable style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Thêm</Text>
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TodoItem item={item} onPressDelete={removeTodo} onPressToggle={toggleTodo} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAFA",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#8B5CF6",
    borderRadius: 12,
    padding: 14,
    color: "#1E1B4B",
    flex: 1,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#F97316",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
});
