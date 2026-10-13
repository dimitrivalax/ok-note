import { z } from 'zod';

/**
 * Schema for a checklist item inside a list note.
 */
export const checklistItemSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  checked: z.boolean(),
  order: z.number().int().nonnegative(),
});

/**
 * Schema for a persisted note (text or checklist).
 */
export const noteSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().optional().nullable(),
    type: z.enum(['text', 'checklist']),
    content: z.string().default(''),
    items: z.array(checklistItemSchema).default([]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    reminderAt: z.string().datetime().nullable().optional(),
    notificationId: z.number().int().nullable().optional(),
  })
  .superRefine((note, ctx) => {
    if (note.type === 'text') {
      if (note.content.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Text note content is required',
          path: ['content'],
        });
      }
      return;
    }

    const hasItemWithText = note.items.some((item) => item.text.trim().length > 0);
    if (!hasItemWithText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Checklist note requires at least one item with text',
        path: ['items'],
      });
    }
  });

/**
 * Input payload used when creating a note.
 */
export const createNoteInputSchema = z.object({
  title: z.string().optional().nullable(),
  type: z.enum(['text', 'checklist']),
  content: z.string().default(''),
  items: z.array(checklistItemSchema).default([]),
  reminderAt: z.string().datetime().nullable().optional(),
});

/**
 * Input payload used when updating a note.
 */
export const updateNoteInputSchema = createNoteInputSchema.partial().extend({
  notificationId: z.number().int().nullable().optional(),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;
export type NoteType = Note['type'];
