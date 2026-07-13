import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#F97316" }, // header màu cam
        headerTintColor: "#fff", // chữ + nút back màu trắng
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Mỗi <Stack.Screen> tương ứng 1 file trong app/.
          name="index" = app/index.tsx = route "/" */}
      <Stack.Screen name="index" options={{ title: "Việc cần làm" }} />
    </Stack>
  );
}
