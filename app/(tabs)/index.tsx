import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PIE_COLORS, PieChart, type PieSlice } from "../../components/PieChart";
import { useTransactionsContext } from "../../context/TransactionsContext";
import type { Transaction } from "../../lib/api";

function formatMoney(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

// Gom giao dịch theo Nội dung -> mảng lát pie (kèm màu), sắp giảm dần
function buildSlices(items: Transaction[]): PieSlice[] {
  const map = new Map<string, number>();
  for (const t of items) {
    map.set(t.content, (map.get(t.content) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .map((s, i) => ({ ...s, color: PIE_COLORS[i % PIE_COLORS.length] }));
}

// Khối 1 biểu đồ + chú thích
function ChartSection({ title, slices }: { title: string; slices: PieSlice[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {total === 0 ? (
        <Text style={styles.empty}>Chưa có dữ liệu tháng này.</Text>
      ) : (
        <View style={styles.chartRow}>
          <PieChart data={slices} size={150} strokeWidth={26} />
          <View style={styles.legend}>
            {slices.map((s) => (
              <View key={s.label} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {s.label}
                </Text>
                <Text style={styles.legendPct}>{Math.round((s.value / total) * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {total > 0 && <Text style={styles.total}>Tổng: {formatMoney(total)}</Text>}
    </View>
  );
}

export default function TongHopScreen() {
  const { transactions, loading, error, month, year, reload } = useTransactionsContext();

  const { thuSlices, chiSlices } = useMemo(() => {
    const thu = transactions.filter((t) => t.type === "Thu");
    const chi = transactions.filter((t) => t.type === "Chi");
    return { thuSlices: buildSlices(thu), chiSlices: buildSlices(chi) };
  }, [transactions]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        <Text style={styles.heading}>
          Tháng {month}/{year}
        </Text>

        {loading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginTop: 30 }} />
        ) : error ? (
          <View style={{ paddingVertical: 16 }}>
            <Text style={styles.errText}>Lỗi: {error}</Text>
            <Pressable onPress={reload}>
              <Text style={styles.retry}>Thử lại</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ChartSection title="📈 Cơ cấu thu nhập" slices={thuSlices} />
            <ChartSection title="📉 Cơ cấu chi tiêu" slices={chiSlices} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAFA" },
  heading: { fontSize: 18, fontWeight: "700", color: "#1E1B4B", marginBottom: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1E1B4B", marginBottom: 12 },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, color: "#374151", fontSize: 13 },
  legendPct: { color: "#1E1B4B", fontSize: 13, fontWeight: "700" },
  total: { marginTop: 12, textAlign: "right", color: "#6B7280", fontWeight: "600" },
  empty: { color: "#9CA3AF", fontStyle: "italic", textAlign: "center", paddingVertical: 20 },
  errText: { color: "#EF4444", fontWeight: "500" },
  retry: { color: "#8B5CF6", marginTop: 8, fontWeight: "600" },
});
