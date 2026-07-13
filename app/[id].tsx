import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTodosContext } from "../context/TodoContext";

export default function TodoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // giờ chỉ cần id!
  console.log("🚀 ~ TodoDetailScreen ~ id:", id)
  const { todos, toggleTodo } = useTodosContext();

  // Tìm todo SỐNG từ state dùng chung theo id
  const todo = todos.find((t) => t.id === id);
  console.log("🚀 ~ TodoDetailScreen ~ todo:", todo)

  // Phòng trường hợp todo đã bị xóa
  if (!todo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Không tìm thấy việc này 🤔</Text>
        <Text style={styles.id}>Có thể nó đã bị xóa.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nội dung</Text>
      <Text style={styles.title}>{todo.title}</Text>

      <Text style={styles.label}>Trạng thái</Text>
      <Text style={[styles.status, todo.done && styles.statusDone]}>{todo.done ? "✅ Đã xong" : "⏳ Chưa xong"}</Text>

      {/* Toggle NGAY tại màn chi tiết — sẽ đồng bộ về danh sách */}
      <Pressable style={styles.toggleBtn} onPress={() => toggleTodo(todo.id)}>
        <Text style={styles.toggleBtnText}>{todo.done ? "↩︎ Đánh dấu chưa xong" : "✓ Đánh dấu đã xong"}</Text>
      </Pressable>

      <Text style={styles.label}>ID</Text>
      <Text style={styles.id}>{todo.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAFA", padding: 24, gap: 6 },
  label: { color: "#8B5CF6", fontWeight: "700", fontSize: 13, marginTop: 16 },
  title: { color: "#1E1B4B", fontSize: 22, fontWeight: "600" },
  status: { fontSize: 18, color: "#F97316" },
  statusDone: { color: "#22C55E" },
  id: { color: "#9CA3AF", fontSize: 12 },
  toggleBtn: {
    marginTop: 12,
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  toggleBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
