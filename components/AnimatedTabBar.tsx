import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

// Icon nét cho từng tab (theo tên file trong (tabs))
const ICONS: Record<string, IoniconName> = {
  "chi-tiet": "receipt-outline",
  index: "pie-chart-outline",
  "tiet-kiem": "wallet-outline",
};

const ACTIVE = "#22C55E"; // màu icon đang chọn
const INACTIVE = "#64748B"; // màu icon không chọn
const BAR_FILL = "#FFFFFF"; // màu thanh (xám rất nhạt)

// Hình học
const BAR_TOP = 34; // mép trên thanh
const BOTTOM = 92; // đáy thanh
const SVG_H = 96;
const CR = 24; // bo góc thanh
const CIRCLE = 80; // đường kính vòng tròn
const Rc = CIRCLE / 2; // bán kính vòng tròn
const GAP = 5; // khe hở giữa vòng tròn và mép lõm
const NOTCH_R = Rc + GAP; // bán kính cung lõm
const LIFT = 12; // vòng tròn nhô lên trên mép thanh bao nhiêu

// Dựng path thanh với chỗ LÕM TRÒN (cung tròn thật) tại cx
function buildPath(cx: number, W: number) {
  const cy = BAR_TOP - LIFT; // tâm vòng tròn (trên mép thanh)
  const halfW = Math.sqrt(Math.max(NOTCH_R * NOTCH_R - LIFT * LIFT, 1));
  const leftX = cx - halfW;
  const rightX = cx + halfW;

  // lấy mẫu cung tròn đáy (từ trái, vòng xuống đáy, sang phải)
  const leftAng = Math.atan2(LIFT, -halfW);
  const rightAng = Math.atan2(LIFT, halfW);
  const steps = 18;
  let arc = "";
  for (let i = 0; i <= steps; i++) {
    const a = leftAng + (rightAng - leftAng) * (i / steps);
    const x = cx + NOTCH_R * Math.cos(a);
    const y = cy + NOTCH_R * Math.sin(a);
    arc += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
  }

  return [
    `M 0 ${BAR_TOP + CR}`,
    `Q 0 ${BAR_TOP} ${CR} ${BAR_TOP}`,
    `H ${leftX.toFixed(1)}`,
    arc.trim(),
    `H ${W - CR}`,
    `Q ${W} ${BAR_TOP} ${W} ${BAR_TOP + CR}`,
    `V ${BOTTOM - CR}`,
    `Q ${W} ${BOTTOM} ${W - CR} ${BOTTOM}`,
    `H ${CR}`,
    `Q 0 ${BOTTOM} 0 ${BOTTOM - CR}`,
    `Z`,
  ].join(" ");
}

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const n = state.routes.length;
  const tabWidth = barWidth > 0 ? barWidth / n : 0;
  const centerOf = (i: number) => tabWidth * i + tabWidth / 2;

  const anim = useRef(new Animated.Value(state.index)).current;
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const [cx, setCx] = useState(0);
  const [shownIndex, setShownIndex] = useState(state.index);

  useEffect(() => {
    const id = anim.addListener(({ value }) => {
      if (tabWidth > 0) setCx(tabWidth * value + tabWidth / 2);
    });
    return () => anim.removeListener(id);
  }, [anim, tabWidth]);

  useEffect(() => {
    if (tabWidth > 0) setCx(centerOf(state.index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabWidth]);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: state.index,
      useNativeDriver: false,
      friction: 8,
      tension: 70,
    }).start();

    Animated.timing(iconOpacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setShownIndex(state.index);
      Animated.timing(iconOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    });
  }, [state.index, anim, iconOpacity]);

  return (
    <View style={[styles.wrap, { bottom: insets.bottom > 0 ? Math.max(insets.bottom - 8, 6) : 10 }]}>
      <View style={styles.inner} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {/* Thanh có chỗ lõm tròn — bóng đổ theo đúng hình (không dùng rect che) */}
        {barWidth > 0 && (
          <View style={styles.barShadow}>
            <Svg width={barWidth} height={SVG_H}>
              <Path d={buildPath(cx, barWidth)} fill={BAR_FILL} />
            </Svg>
          </View>
        )}

        {/* Vùng chạm + icon tab không active */}
        <View style={styles.row}>
          {state.routes.map((route, i) => {
            const focused = state.index === i;
            const label = (descriptors[route.key].options.title ?? route.name) as string;
            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <Pressable key={route.key} style={styles.tab} onPress={onPress}>
                {/* Tab active hiện bằng vòng tròn nổi -> ẩn icon+chữ ở đây */}
                <Ionicons
                  name={ICONS[route.name]}
                  size={22}
                  color={INACTIVE}
                  style={{ opacity: focused ? 0 : 1 }}
                />
                {!focused && <Text style={styles.label}>{label}</Text>}
              </Pressable>
            );
          })}
        </View>

        {/* Vòng tròn trắng nổi, trượt theo lõm, icon cross-fade */}
        {barWidth > 0 && (
          <View pointerEvents="none" style={[styles.circle, { left: cx - Rc }]}>
            <Animated.View style={{ opacity: iconOpacity }}>
              <Ionicons name={ICONS[state.routes[shownIndex].name]} size={32} color={ACTIVE} />
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16 },
  inner: { height: SVG_H, overflow: "visible" },
  barShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  row: {
    position: "absolute",
    top: BAR_TOP,
    left: 0,
    right: 0,
    height: BOTTOM - BAR_TOP,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", height: "100%", gap: 3 },
  label: { fontSize: 10, fontWeight: "600", color: INACTIVE },
  circle: {
    position: "absolute",
    top: BAR_TOP - LIFT - Rc, // tâm vòng tròn ở y = BAR_TOP - LIFT
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: Rc,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6,
  },
});
