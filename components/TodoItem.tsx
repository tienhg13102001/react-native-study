import React, { type FC } from "react";
import type { Todo } from "../types";
import { Text, View, StyleSheet, Pressable } from "react-native";

type Props = {
  item: Todo;
  onPressDelete: (id: string) => void;
  onPressToggle: (id: string) => void;
};

const TodoItem: FC<Props> = ({ item, onPressDelete, onPressToggle }) => {
  return (
    <View style={styles.card}>
      <Pressable onPress={() => onPressToggle(item.id)}>
        <View style={[styles.toggleButton, item.done && styles.doneButton]} />
      </Pressable>
      <Text style={[styles.text, item.done && styles.doneText]}>{item.title}</Text>
      <Pressable onPress={() => onPressDelete(item.id)}>
        <Text style={styles.eraseButton}>Xóa</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6", // Nhấn màu tím pastel bên trái
    // Hiệu ứng thẻ nổi
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 5,
  },
  toggleButton: {
    color: "blue",
    width: 20,
    height: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 5,
  },
  doneButton: { backgroundColor: "#8B5CF6" },
  text: {
    color: "#1E1B4B", // Xanh tím than đậm
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  doneText: {
    textDecorationLine: "line-through", // ⭐ RN-specific: gạch ngang chữ
    color: "#9CA3AF",
  },
  eraseButton: {
    color: "red",
  },
});

export default TodoItem;
