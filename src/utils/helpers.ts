/* 날짜 변환 함수 */
export function formatTimestamp(raw: string) {
  const date = new Date(raw);

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date); // 07/17/2025 형식

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date); // 12:00 AM 형식

  return `${datePart.replace(/\//g, ".")} ${timePart}`;
}

export function formatMonthDay(raw: string) {
  const date = new Date(raw);
  return new Intl.DateTimeFormat("en-US", {
    month: "short", // Jul
    day: "2-digit", // 17
  }).format(date);
}

/* 경도/위도 좌표 변환 함수 */

//3d 좌표를 실제 경도/위도로 변환
export function cartesianToLatLon(
  x: number,
  y: number,
  z: number
): { lat: number; lon: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const lat = 90 - (Math.acos(y / r) * 180) / Math.PI;
  let lon = (Math.atan2(z, x) * 180) / Math.PI;
  lon = -lon - 180;
  lon = ((lon + 540) % 360) - 180;
  return { lat, lon };
}
