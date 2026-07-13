import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import TodoItem from "../components/TodoItem";
import { useTodos } from "../hooks/useTodos";

export default function HomeScreen() {
  // Tất cả logic dữ liệu gói gọn trong 1 dòng 👇
  const { todos, addTodo, removeTodo, toggleTodo, editTodo } = useTodos();

  // Chỉ còn lại state thuộc về GIAO DIỆN
  const [textInput, setTextInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const visibleTodos = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  // Bọc addTodo: lấy chữ từ ô input, thêm, rồi xóa ô
  const handleAdd = () => {
    addTodo(textInput);
    setTextInput("");
  };

  return (
    // Header của Stack đã lo phần né tai thỏ ở trên, nên không cần SafeAreaView top nữa.
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <View style={styles.inputContainer}>
        <TextInput value={textInput} onChangeText={setTextInput} placeholder="Nhập việc..." placeholderTextColor="#6B7280" style={styles.input} />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Thêm</Text>
        </Pressable>
      </View>
      {/* ── Thanh lọc ── */}
      <View style={styles.filterBar}>
        {(["all", "active", "done"] as const).map((f) => (
          <Pressable key={f} style={[styles.filterButton, filter === f && styles.filterButtonActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "Tất cả" : f === "active" ? "Chưa xong" : "Đã xong"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={visibleTodos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TodoItem item={item} onPressDelete={removeTodo} onPressToggle={toggleTodo} onEdit={editTodo} />}
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
  filterBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  filterButtonActive: {
    backgroundColor: "#8B5CF6", // nút đang chọn tô nền tím
  },
  filterText: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF", // chữ trắng khi được chọn
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
