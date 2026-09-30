/** API 支持状态的共享定义（StatusBadge 与 ApiMatrix 共用）。 */

export type SupportLevel = "full" | "partial" | "stub";

export const SUPPORT_LEVEL_META: Record<SupportLevel, { symbol: string; label: string }> = {
  full: { symbol: "✅", label: "完整实现" },
  partial: { symbol: "🟡", label: "局部实现" },
  stub: { symbol: "⬜", label: "有意桩/空操作" },
};

export const SUPPORT_LEVELS: SupportLevel[] = ["full", "partial", "stub"];
