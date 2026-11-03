import { TestBed } from '@angular/core/testing';

import type { Note } from '../models/note.schema';
import { I18nService } from './i18n.service';
import { noteDb } from './note-db';
import { NoteService } from './note.service';
import { NotificationService } from './notification.service';

/**
 * Builds a persisted text note for service tests.
 */
function createTextNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Keep me',
    type: 'text',
    content: 'Original',
    items: [],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
    reminderAt: null,
    notificationId: null,
    ...overrides,
  };
}

describe('NoteService.replaceAll', () => {
  let service: NoteService;
  const cancel = vi.fn(async () => undefined);
  const schedule = vi.fn(async () => 99);

  beforeEach(async () => {
    cancel.mockClear();
    schedule.mockClear();
    await noteDb.notes.clear();

    await TestBed.configureTestingModule({
      providers: [
        NoteService,
        { provide: NotificationService, useValue: { cancel, schedule } },
        { provide: I18nService, useValue: { t: (key: string) => key } },
      ],
    }).compileComponents();

    service = TestBed.inject(NoteService);
  });

  it('cancels existing reminders then stores imported notes', async () => {
    await noteDb.notes.put(
      createTextNote({
        id: 'old',
        title: 'Old',
        notificationId: 7,
      })
    );

    const imported = createTextNote({
      id: 'imported',
      title: 'Imported',
      content: 'From backup',
      createdAt: '2025-12-01T00:00:00.000Z',
      updatedAt: '2025-12-02T00:00:00.000Z',
    });

    await service.replaceAll([imported]);

    expect(cancel).toHaveBeenCalledWith(7);
    const stored = await service.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.id).toBe('imported');
    expect(stored[0]?.createdAt).toBe('2025-12-01T00:00:00.000Z');
    expect(stored[0]?.title).toBe('Imported');
  });

  it('reschedules future imported reminders', async () => {
    const reminderAt = new Date(Date.now() + 60_000).toISOString();
    await service.replaceAll([
      createTextNote({
        reminderAt,
        notificationId: 12,
      }),
    ]);

    expect(schedule).toHaveBeenCalledOnce();
    const stored = await service.getAll();
    expect(stored[0]?.notificationId).toBe(99);
    expect(stored[0]?.reminderAt).toBe(reminderAt);
  });

  it('does not write when validation fails, leaving existing notes', async () => {
    await noteDb.notes.put(createTextNote());

    await expect(
      service.replaceAll([
        createTextNote({
          id: 'bad',
          content: '',
        }),
      ])
    ).rejects.toThrow();

    expect(cancel).not.toHaveBeenCalled();
    const stored = await service.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.id).toBe('note-1');
  });
});
