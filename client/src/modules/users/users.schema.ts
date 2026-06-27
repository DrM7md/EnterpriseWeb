import { z } from 'zod';

/**
 * مصدر الحقيقة الواحد لنموذج المستخدم: Zod schema يولّد TS types ويغذّي RHF.
 * يطابق قواعد FluentValidation على الخادم (تحقّق على الطرفين).
 */
export const createUserSchema = z.object({
  userName: z.string().min(1, 'اسم المستخدم مطلوب').max(100),
  email: z.string().min(1, 'البريد مطلوب').email('بريد غير صالح').max(256),
  fullName: z.string().min(1, 'الاسم الكامل مطلوب').max(200),
  password: z
    .string()
    .min(8, 'كلمة المرور 8 أحرف على الأقل')
    .regex(/[A-Za-z]/, 'يجب أن تحوي حروفًا')
    .regex(/\d/, 'يجب أن تحوي أرقامًا'),
});

export const editUserSchema = z.object({
  fullName: z.string().min(1, 'الاسم الكامل مطلوب').max(200),
  isActive: z.boolean(),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type EditUserForm = z.infer<typeof editUserSchema>;
