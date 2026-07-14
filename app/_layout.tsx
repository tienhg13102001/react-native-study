import { Stack } from "expo-router";
import { TransactionsProvider } from "../context/TransactionsContext";

export default function RootLayout() {
  return (
    // Bọc toàn app: cả 3 tab dùng chung 1 nguồn dữ liệu giao dịch
    <TransactionsProvider>
      {/* Ẩn header của Stack vì thanh Tabs đã có header riêng */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TransactionsProvider>
  );
}
