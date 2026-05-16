import { z } from 'zod';

export const step1Schema = z.object({
  rfc: z
    .string()
    .min(12, 'El RFC debe tener entre 12 y 13 caracteres')
    .max(13, 'El RFC debe tener entre 12 y 13 caracteres'),
});

export const step2Schema = z.object({
  sector: z.string().min(2, 'Indica tu sector').max(100),
});

export const step3Schema = z.object({
  anchor_buyers: z
    .array(z.string().min(1))
    .min(1, 'Agrega al menos un comprador'),
});

// CR-MNR-2: align Zod max with the SQL column `NUMERIC(12,2)` (max value
// 9_999_999_999.99 = 10 integer digits + 2 decimals). The prior literal
// `9_999_999_999_99` parsed as 999_999_999_999 (12 integer digits), letting
// values pass Zod that would then overflow at INSERT/UPDATE and surface as
// generic "No se pudo guardar" — confusing UX in an extreme edge case.
export const step4Schema = z.object({
  monto_tipico_mxn: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(9_999_999_999.99, 'El monto excede el máximo permitido'),
});

export const step5Schema = z.object({
  mayor_frustracion: z
    .string()
    .min(5, 'Cuéntanos un poco más')
    .max(500, 'Máximo 500 caracteres'),
});

export const profileUpdateSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .partial();

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
