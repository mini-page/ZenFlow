export type AppView =
  | 'dashboard'
  | 'focus'
  | 'breathe'
  | 'hydrate'
  | 'tasks'
  | 'sounds'
  | 'stretch'
  | 'studio';

export interface NavItem {
  view: AppView;
  label: string;
  group: 'Core' | 'Wellness' | 'Tools';
  shortcut: string;
  icon:
    | 'leaf'
    | 'timer'
    | 'wind'
    | 'droplet'
    | 'list-todo'
    | 'music'
    | 'activity'
    | 'cpu';
}

// Single source of truth for header page links.
// To add a future page:
// 1) Add it to AppView.
// 2) Add an item here.
// 3) Handle it in App.tsx renderView().
export const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', group: 'Core', shortcut: 'D / Esc', icon: 'leaf' },
  { view: 'focus', label: 'Focus', group: 'Core', shortcut: 'F', icon: 'timer' },
  { view: 'tasks', label: 'Tasks', group: 'Core', shortcut: 'T', icon: 'list-todo' },
  { view: 'breathe', label: 'Breathe', group: 'Wellness', shortcut: 'B', icon: 'wind' },
  { view: 'hydrate', label: 'Hydrate', group: 'Wellness', shortcut: 'H / W', icon: 'droplet' },
  { view: 'stretch', label: 'Stretch', group: 'Wellness', shortcut: 'X', icon: 'activity' },
  { view: 'sounds', label: 'Sounds', group: 'Tools', shortcut: 'S', icon: 'music' },
  { view: 'studio', label: 'Studio', group: 'Tools', shortcut: 'I', icon: 'cpu' },
];

export const NAV_GROUPS: Array<'Core' | 'Wellness' | 'Tools'> = ['Core', 'Wellness', 'Tools'];
