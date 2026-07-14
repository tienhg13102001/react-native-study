import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTransactionsContext } from "../../context/TransactionsContext";

const GOAL_KEY = "@chitieu_muc_tieu_tiet_kiem";

function formatMoney(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

export default function TietKiemScreen() {
  const { transactions, month, year } = useTransactionsContext();

  // Số dư tháng = tổng thu - tổng chi (chính là phần "để dành" được)
  const balance = useMemo(() => {
    let thu = 0;
    let chi = 0;
    for (const t of transactions) {
      if (t.type === "Thu") thu += t.amount;
      else chi += t.amount;
    }
    return thu - chi;
  }, [transactions]);

  // Mục tiêu tiết kiệm — lưu bền vững bằng AsyncStorage
  const [goal, setGoal] = useState(0);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(GOAL_KEY).then((raw) => {
      if (raw) {
        setGoal(Number(raw) || 0);
        setGoalInput(raw);
      }
    });
  }, []);

  const saveGoal = async () => {
    const g = Number(goalInput.replace(/[^\d]/g, "")) || 0;
    setGoal(g);
    await AsyncStorage.setItem(GOAL_KEY, String(g));
  };

  const progress = goal > 0 ? Math.min(Math.max(balance / goal, 0), 1) : 0;
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
        {/* Số dư */}
        <View style={styles.card}>
          <Text style={styles.emoji}>🐷</Text>
          <Text style={styles.balanceLabel}>Để dành tháng {month}/{year}</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? "#22C55E" : "#EF4444" }]}>
            {formatMoney(balance)}
          </Text>
          {balance < 0 && (
            <Text style={styles.warn}>Tháng này chi nhiều hơn thu 😅</Text>
          )}
        </View>

        {/* Mục tiêu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mục tiêu tiết kiệm</Text>
          <View style={styles.goalRow}>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="VD: 5000000"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <Pressable style={styles.saveBtn} onPress={saveGoal}>
              <Text style={styles.saveBtnText}>Lưu</Text>
            </Pressable>
          </View>

          {goal > 0 && (
            <View style={{ marginTop: 16 }}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {formatMoney(Math.max(balance, 0))} / {formatMoney(goal)} ({percent}%)
              </Text>
              {progress >= 1 && <Text style={styles.done}>🎉 Đã đạt mục tiêu!</Text>}
            </View>
          )}
        </View>

        <Text style={styles.note}>
          "Để dành" = tổng thu − tổng chi trong tháng. Đổi tháng ở tab Chi tiết sẽ đổi số ở đây.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAFA" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  balanceLabel: { color: "#6B7280", fontSize: 14 },
  balanceValue: { fontSize: 28, fontWeight: "800", marginTop: 4 },
  warn: { color: "#EF4444", marginTop: 8, fontSize: 13 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1E1B4B", alignSelf: "flex-start", marginBottom: 12 },
  goalRow: { flexDirection: "row", gap: 10, width: "100%" },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1E1B4B",
  },
  saveBtn: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 12,
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "700" },
  progressBg: { height: 14, backgroundColor: "#E5E7EB", borderRadius: 7, overflow: "hidden" },
  progressFill: { height: 14, backgroundColor: "#22C55E", borderRadius: 7 },
  progressText: { marginTop: 8, textAlign: "center", color: "#374151", fontWeight: "600" },
  done: { marginTop: 6, textAlign: "center", color: "#22C55E", fontWeight: "700" },
  note: { color: "#9CA3AF", fontSize: 12, textAlign: "center", fontStyle: "italic" },
});
