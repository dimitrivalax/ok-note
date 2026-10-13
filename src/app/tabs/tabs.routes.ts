import { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'notes',
        loadComponent: () => import('../notes/notes.page').then((m) => m.NotesPage),
      },
      {
        path: 'notes/new',
        loadComponent: () =>
          import('../note-editor/note-editor.page').then((m) => m.NoteEditorPage),
      },
      {
        path: 'notes/:id',
        loadComponent: () =>
          import('../note-editor/note-editor.page').then((m) => m.NoteEditorPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/notes',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/notes',
    pathMatch: 'full',
  },
];
