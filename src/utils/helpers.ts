/* 날짜 변환 함수 */
export function formatTimestamp(raw: string | undefined) {
  if (!raw) return;
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

export function formatTimestampWithoutTime(raw: string) {
  const date = new Date(raw);

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date); // 07/17/2025 형식

  return `${datePart.replace(/\//g, ".")}`;
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

//이메일의 유저네임 중간 40% 영역을 마스킹
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  const len = local.length;
  if (len < 2) return email; // 너무 짧으면 마스킹 생략

  const half = Math.floor(len * 0.4);
  const start = Math.floor((len - half) / 2);
  const end = start + half;

  const masked =
    local.slice(0, start) + "*".repeat(end - start) + local.slice(end);

  return `${masked}@${domain}`;
}

/* supabase 에러 메세지로 에러 타입 판단 */
export function getErrorStatusFromMessage(message: string) {
  const msg = message.toLowerCase();

  switch (true) {
    case msg.includes("registered"):
    case msg.includes("exists"):
      return "EMAIL_EXISTS";

    case msg.includes("password") && msg.includes("characters"):
      return "PASSWORD_LENGTH";

    case msg.includes("confirmed"):
    case msg.includes("verify"):
      return "EMAIL_VERIFY";

    case msg.includes("invalid"):
      return "INVALID_INPUT";

    case msg.includes("missing"):
      return "MISSING_INPUT";

    default:
      return "UNEXPECTED_ERROR";
  }
}
