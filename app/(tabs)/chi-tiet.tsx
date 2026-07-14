import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTransactionsContext } from "../../context/TransactionsContext";
import type { Transaction } from "../../lib/api";

function formatMoney(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

function today() {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function ChiTietScreen() {
  const { categories, transactions, loading, error, month, year, add, remove, reload } =
    useTransactionsContext();

  const [type, setType] = useState<"Thu" | "Chi">("Chi");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const contentOptions = type === "Thu" ? (categories?.thu ?? []) : (categories?.chi ?? []);

  const { totalThu, totalChi } = useMemo(() => {
    let thu = 0;
    let chi = 0;
    for (const t of transactions) {
      if (t.type === "Thu") thu += t.amount;
      else chi += t.amount;
    }
    return { totalThu: thu, totalChi: chi };
  }, [transactions]);

  const chooseType = (t: "Thu" | "Chi") => {
    setType(t);
    setContent("");
  };

  const handleAdd = async () => {
    setFormError(null);
    const amountNum = Number(amount.replace(/[^\d]/g, ""));
    if (!content) return setFormError("Hãy chọn Nội dung");
    if (!amountNum) return setFormError("Hãy nhập số tiền hợp lệ");

    setSubmitting(true);
    try {
      await add({ date, type, content, note, amount: amountNum });
      setContent("");
      setAmount("");
      setNote("");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
        {/* Tổng hợp nhanh */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Thu</Text>
            <Text style={[styles.summaryValue, { color: "#22C55E" }]}>{formatMoney(totalThu)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Chi</Text>
            <Text style={[styles.summaryValue, { color: "#EF4444" }]}>{formatMoney(totalChi)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Còn lại</Text>
            <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>
              {formatMoney(totalThu - totalChi)}
            </Text>
          </View>
        </View>

        {/* Form nhập */}
        <View style={styles.form}>
          <View style={styles.typeRow}>
            {(["Chi", "Thu"] as const).map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.typeBtn,
                  type === t && (t === "Thu" ? styles.typeThuActive : styles.typeChiActive),
                ]}
                onPress={() => chooseType(t)}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Nội dung</Text>
          <View style={styles.chips}>
            {contentOptions.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, content === c && styles.chipActive]}
                onPress={() => setContent(c)}
              >
                <Text style={[styles.chipText, content === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Số tiền</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Ngày (yyyy-MM-dd)</Text>
          <TextInput value={date} onChangeText={setDate} style={styles.input} />

          <Text style={styles.fieldLabel}>Ghi chú</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="(không bắt buộc)"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          {formError && <Text style={styles.errText}>{formError}</Text>}

          <Pressable
            style={[styles.addBtn, submitting && { opacity: 0.6 }]}
            onPress={handleAdd}
            disabled={submitting}
          >
            <Text style={styles.addBtnText}>{submitting ? "Đang lưu..." : "Thêm giao dịch"}</Text>
          </Pressable>
        </View>

        {/* Danh sách */}
        <Text style={styles.listTitle}>
          Giao dịch tháng {month}/{year}
        </Text>

        {loading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginTop: 20 }} />
        ) : error ? (
          <View style={{ paddingVertical: 16 }}>
            <Text style={styles.errText}>Lỗi: {error}</Text>
            <Pressable onPress={reload}>
              <Text style={styles.retry}>Thử lại</Text>
            </Pressable>
          </View>
        ) : transactions.length === 0 ? (
          <Text style={styles.empty}>Chưa có giao dịch nào trong tháng này.</Text>
        ) : (
          transactions.map((t, i) => <Row key={t.id || `idx-${i}`} t={t} onDelete={remove} />)
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Row({ t, onDelete }: { t: Transaction; onDelete: (id: string) => void }) {
  const isThu = t.type === "Thu";
  return (
    <View style={styles.row}>
      <View style={[styles.rowBar, { backgroundColor: isThu ? "#22C55E" : "#EF4444" }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowContent}>{t.content}</Text>
        {!!t.note && <Text style={styles.rowNote}>{t.note}</Text>}
        <Text style={styles.rowDate}>{t.date}</Text>
      </View>
      <Text style={[styles.rowAmount, { color: isThu ? "#22C55E" : "#EF4444" }]}>
        {isThu ? "+" : "-"}
        {formatMoney(t.amount)}
      </Text>
      <Pressable onPress={() => onDelete(t.id)} hitSlop={8}>
        <Text style={styles.rowDelete}>Xóa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAFA" },
  summary: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryLabel: { color: "#6B7280", fontSize: 13, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: "700" },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  typeChiActive: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  typeThuActive: { backgroundColor: "#DCFCE7", borderColor: "#22C55E" },
  typeText: { fontWeight: "700", color: "#6B7280", fontSize: 15 },
  typeTextActive: { color: "#1E1B4B" },
  fieldLabel: { color: "#8B5CF6", fontWeight: "700", fontSize: 13, marginTop: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  chipActive: { backgroundColor: "#8B5CF6" },
  chipText: { color: "#8B5CF6", fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: "#FFFFFF" },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1E1B4B",
    marginTop: 6,
    backgroundColor: "#FFFFFF",
  },
  addBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  errText: { color: "#EF4444", marginTop: 8, fontWeight: "500" },
  retry: { color: "#8B5CF6", marginTop: 8, fontWeight: "600" },
  listTitle: { fontSize: 16, fontWeight: "700", color: "#1E1B4B", marginTop: 24, marginBottom: 8 },
  empty: { color: "#9CA3AF", fontStyle: "italic", marginTop: 12, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  rowBar: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  rowContent: { fontSize: 15, fontWeight: "600", color: "#1E1B4B" },
  rowNote: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  rowDate: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: "700" },
  rowDelete: { color: "#EF4444", fontSize: 13, fontWeight: "600" },
});
