export type AppView =
  | 'dashboard'
  | 'focus'
  | 'breathe'
  | 'hydrate'
  | 'recovery'
  | 'tasks'
  | 'journal'
  | 'habits'
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
    | 'moon-star'
    | 'list-todo'
    | 'book-open'
    | 'music'
    | 'activity'
    | 'cpu'
    | 'sparkles';
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
    { view: 'journal', label: 'Zen Notes', group: 'Core', shortcut: 'N', icon: 'book-open' },
    { view: 'habits', label: 'Forest Floor', group: 'Core', shortcut: 'H', icon: 'sparkles' },
    { view: 'breathe', label: 'Breathe', group: 'Wellness', shortcut: 'B', icon: 'wind' },
    { view: 'hydrate', label: 'Hydrate', group: 'Wellness', shortcut: 'W', icon: 'droplet' },        
    { view: 'recovery', label: 'Recovery', group: 'Wellness', shortcut: 'R', icon: 'moon-star' },        
    { view: 'stretch', label: 'Stretch', group: 'Wellness', shortcut: 'X', icon: 'activity' },
    { view: 'sounds', label: 'Sounds', group: 'Tools', shortcut: 'S', icon: 'music' },
    { view: 'studio', label: 'Studio', group: 'Tools', shortcut: 'I', icon: 'cpu' },
    ];
export const NAV_GROUPS: Array<'Core' | 'Wellness' | 'Tools'> = ['Core', 'Wellness', 'Tools'];
