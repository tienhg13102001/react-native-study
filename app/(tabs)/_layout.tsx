import { Tabs } from "expo-router";
import { AnimatedTabBar } from "../../components/AnimatedTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      // Dùng thanh tab tự dựng (vòng tròn nổi trượt có nảy)
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#8B5CF6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      {/* Thứ tự: trái -> giữa -> phải */}
      <Tabs.Screen name="chi-tiet" options={{ title: "Chi tiết" }} />
      <Tabs.Screen name="index" options={{ title: "Tổng hợp" }} />
      <Tabs.Screen name="tiet-kiem" options={{ title: "Tiết kiệm" }} />
    </Tabs>
  );
}
