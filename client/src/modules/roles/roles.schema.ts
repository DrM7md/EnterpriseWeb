import { z } from 'zod';

/** نموذج الدور (Zod = مصدر الحقيقة، يطابق FluentValidation على الخادم). */
export const roleSchema = z.object({
  name: z.string().min(1, 'اسم الدور مطلوب').max(100),
  description: z.string().max(400).optional().or(z.literal('')),
  permissionIds: z.array(z.number()),
});

export type RoleForm = z.infer<typeof roleSchema>;
