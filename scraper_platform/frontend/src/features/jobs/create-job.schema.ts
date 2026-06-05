import { z } from 'zod'

export const createJobSchema = z.object({
  url: z.string().url('Enter a valid URL'),
  source_type: z.enum(['generic', 'olx']),
  priority: z.number().int().min(0).max(100),
  max_attempts: z.number().int().min(1).max(10),
  extraction_instruction: z.string().optional(),
  metadataJson: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val?.trim()) return true
        try {
          JSON.parse(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Metadata must be valid JSON' },
    ),
})

export type CreateJobFormValues = z.infer<typeof createJobSchema>
