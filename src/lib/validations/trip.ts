import { z } from "zod";

export const createTripSchema = z.object({
  title: z
    .string()
    .min(1, "여행 제목을 입력해주세요")
    .max(50, "여행 제목은 50자 이하로 입력해주세요"),
  destination: z
    .string()
    .min(1, "목적지를 입력해주세요")
    .max(100, "목적지는 100자 이하로 입력해주세요"),
  start_date: z.string().min(1, "시작일을 선택해주세요"),
  end_date: z.string().min(1, "종료일을 선택해주세요"),
  description: z.string().max(500, "설명은 500자 이하로 입력해주세요").optional(),
  is_domestic: z.boolean(),
  currency: z.string(),
  budget_total: z.number().min(0).optional().nullable(),
}).refine(
  (data) => {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  },
  {
    message: "종료일은 시작일 이후여야 합니다",
    path: ["end_date"],
  }
);

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const joinTripSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "초대 코드를 입력해주세요")
    .length(8, "초대 코드는 8자입니다")
    .regex(/^[A-Z0-9]+$/, "올바른 초대 코드 형식이 아닙니다"),
});

export type JoinTripInput = z.infer<typeof joinTripSchema>;
