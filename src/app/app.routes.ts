import type { CanDeactivateFn, Routes } from '@angular/router';

import type { NoteEditorPage } from './note-editor/note-editor.page';

/**
 * Flushes debounced note edits before leaving the editor.
 */
const noteEditorCanDeactivate: CanDeactivateFn<NoteEditorPage> = (component) =>
  component.flushPendingAutoSave();

export const routes: Routes = [
  {
    path: 'notes',
    loadComponent: () => import('./notes/notes.page').then((m) => m.NotesPage),
  },
  {
    path: 'notes/new',
    loadComponent: () => import('./note-editor/note-editor.page').then((m) => m.NoteEditorPage),
    canDeactivate: [noteEditorCanDeactivate],
  },
  {
    path: 'notes/:id',
    loadComponent: () => import('./note-editor/note-editor.page').then((m) => m.NoteEditorPage),
    canDeactivate: [noteEditorCanDeactivate],
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '',
    redirectTo: '/notes',
    pathMatch: 'full',
  },
];
