import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Icon emoji, có "viên" nền bo tròn khi tab đang chọn -> nhìn hiện đại hơn
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? "#EDE9FE" : "transparent", // nền tím nhạt khi chọn
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#8B5CF6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "800", fontSize: 18 },
        headerShadowVisible: false,
        tabBarActiveTintColor: "#8B5CF6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        // Thanh tab NỔI: bo tròn, cách đáy theo safe-area, có bóng
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 5, // cách vạch home iPhone
          height: 66,
          borderRadius: 10,
          borderEndEndRadius: 50,
          borderBottomRightRadius: 50,
          borderBottomLeftRadius: 50,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
          marginLeft: 8,
          marginRight: 8,
        },
        tabBarItemStyle: { paddingTop: 4 },
      }}
    >
      {/* Thứ tự: trái -> giữa -> phải */}
      <Tabs.Screen
        name="chi-tiet"
        options={{
          title: "Chi tiết",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📝" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng hợp",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tiet-kiem"
        options={{
          title: "Tiết kiệm",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐷" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
