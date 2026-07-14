import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

export type PieSlice = { label: string; value: number; color: string };

/**
 * Biểu đồ tròn kiểu "donut" vẽ bằng react-native-svg.
 * Kỹ thuật: mỗi lát là 1 <Circle> có strokeDasharray = (độ dài lát, phần còn lại),
 * dịch bằng strokeDashoffset để xếp nối tiếp nhau quanh vòng.
 */
export function PieChart({
  data,
  size = 180,
  strokeWidth = 30,
}: {
  data: PieSlice[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);

  let offset = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Xoay -90° để lát đầu tiên bắt đầu từ đỉnh (12 giờ) */}
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {total === 0 ? (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="none"
            />
          ) : (
            data.map((d, i) => {
              const dash = (d.value / total) * circumference;
              const el = (
                <Circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  stroke={d.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += dash;
              return el;
            })
          )}
        </G>
      </Svg>
    </View>
  );
}

// Bảng màu dùng chung cho các lát
export const PIE_COLORS = [
  "#8B5CF6", "#F97316", "#22C55E", "#EF4444", "#3B82F6",
  "#EC4899", "#14B8A6", "#EAB308", "#A855F7", "#F43F5E",
  "#0EA5E9", "#84CC16", "#F59E0B", "#6366F1", "#10B981",
];
