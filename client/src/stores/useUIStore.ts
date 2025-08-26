import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Toast types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

// Modal types
export interface Modal {
  id: string;
  type: 'dialog' | 'drawer' | 'fullscreen';
  title?: string;
  content: React.ReactNode | string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
  footer?: React.ReactNode;
}

// Loading states
export interface LoadingState {
  [key: string]: boolean;
}

// Sidebar state
export interface SidebarState {
  isOpen: boolean;
  isPinned: boolean;
  activeSection?: string;
}

// UI preferences
export interface UIPreferences {
  sidebarCollapsed: boolean;
  gridView: boolean;
  compactMode: boolean;
  showAnimations: boolean;
  autoSave: boolean;
  notifications: {
    desktop: boolean;
    email: boolean;
    sound: boolean;
  };
}

// Search state
export interface SearchState {
  query: string;
  filters: Record<string, string[]>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isActive: boolean;
}

// UI Store interface
interface UIStore {
  // Theme and appearance
  isMobileNavOpen: boolean;
  isDarkMode: boolean;

  // Loading states
  loading: LoadingState;

  // Toasts
  toasts: Toast[];

  // Modals
  modals: Modal[];

  // Sidebar
  sidebar: SidebarState;

  // UI preferences
  preferences: UIPreferences;

  // Search
  search: SearchState;

  // Scroll position
  scrollPosition: number;

  // Page metadata
  pageTitle: string;
  breadcrumbs: { label: string; href?: string }[];

  // Actions - Mobile Navigation
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;

  // Actions - Theme
  setDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;

  // Actions - Loading
  setLoading: (key: string, isLoading: boolean) => void;
  getLoading: (key: string) => boolean;
  clearAllLoading: () => void;

  // Actions - Toasts
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showSuccess: (message: string, title?: string, duration?: number) => string;
  showError: (message: string, title?: string, duration?: number) => string;
  showWarning: (message: string, title?: string, duration?: number) => string;
  showInfo: (message: string, title?: string, duration?: number) => string;

  // Actions - Modals
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  getActiveModal: () => Modal | null;

  // Actions - Sidebar
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  pinSidebar: () => void;
  unpinSidebar: () => void;
  setActiveSection: (section: string) => void;

  // Actions - Preferences
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
  resetPreferences: () => void;

  // Actions - Search
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Record<string, string[]>) => void;
  setSearchSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  clearSearch: () => void;
  toggleSearch: () => void;

  // Actions - Scroll
  setScrollPosition: (position: number) => void;

  // Actions - Page metadata
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void;
  addBreadcrumb: (breadcrumb: { label: string; href?: string }) => void;
}

// Default values
const defaultPreferences: UIPreferences = {
  sidebarCollapsed: false,
  gridView: true,
  compactMode: false,
  showAnimations: true,
  autoSave: true,
  notifications: {
    desktop: true,
    email: false,
    sound: false,
  },
};

const defaultSearch: SearchState = {
  query: '',
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isActive: false,
};

const defaultSidebar: SidebarState = {
  isOpen: false,
  isPinned: false,
  activeSection: undefined,
};

// Generate unique ID for toasts and modals
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create the store
export const useUIStore = create<UIStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      isMobileNavOpen: false,
      isDarkMode: false,
      loading: {},
      toasts: [],
      modals: [],
      sidebar: defaultSidebar,
      preferences: defaultPreferences,
      search: defaultSearch,
      scrollPosition: 0,
      pageTitle: '',
      breadcrumbs: [],

      // Mobile Navigation Actions
      openMobileNav: () => {
        set((state) => {
          state.isMobileNavOpen = true;
        });
      },

      closeMobileNav: () => {
        set((state) => {
          state.isMobileNavOpen = false;
        });
      },

      toggleMobileNav: () => {
        set((state) => {
          state.isMobileNavOpen = !state.isMobileNavOpen;
        });
      },

      // Theme Actions
      setDarkMode: (isDark: boolean) => {
        set((state) => {
          state.isDarkMode = isDark;
        });
      },

      toggleDarkMode: () => {
        set((state) => {
          state.isDarkMode = !state.isDarkMode;
        });
      },

      // Loading Actions
      setLoading: (key: string, isLoading: boolean) => {
        set((state) => {
          if (isLoading) {
            state.loading[key] = true;
          } else {
            delete state.loading[key];
          }
        });
      },

      getLoading: (key: string) => {
        return get().loading[key] || false;
      },

      clearAllLoading: () => {
        set((state) => {
          state.loading = {};
        });
      },

      // Toast Actions
      addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => {
        const id = generateId();
        const newToast: Toast = {
          ...toast,
          id,
          createdAt: Date.now(),
          duration: toast.duration || (toast.type === 'error' ? 8000 : 5000),
        };

        set((state) => {
          state.toasts.push(newToast);
        });

        // Auto remove toast after duration
        if (newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }

        return id;
      },

      removeToast: (id: string) => {
        set((state) => {
          state.toasts = state.toasts.filter(toast => toast.id !== id);
        });
      },

      clearToasts: () => {
        set((state) => {
          state.toasts = [];
        });
      },

      showSuccess: (message: string, title?: string, duration?: number) => {
        return get().addToast({ type: 'success', message, title, duration });
      },

      showError: (message: string, title?: string, duration?: number) => {
        return get().addToast({ type: 'error', message, title, duration });
      },

      showWarning: (message: string, title?: string, duration?: number) => {
        return get().addToast({ type: 'warning', message, title, duration });
      },

      showInfo: (message: string, title?: string, duration?: number) => {
        return get().addToast({ type: 'info', message, title, duration });
      },

      // Modal Actions
      openModal: (modal: Omit<Modal, 'id'>) => {
        const id = generateId();
        const newModal: Modal = {
          ...modal,
          id,
          size: modal.size || 'md',
          closable: modal.closable !== false,
        };

        set((state) => {
          state.modals.push(newModal);
        });

        return id;
      },

      closeModal: (id: string) => {
        const modal = get().modals.find(m => m.id === id);
        if (modal?.onClose) {
          modal.onClose();
        }

        set((state) => {
          state.modals = state.modals.filter(modal => modal.id !== id);
        });
      },

      closeAllModals: () => {
        const { modals } = get();
        modals.forEach(modal => {
          if (modal.onClose) {
            modal.onClose();
          }
        });

        set((state) => {
          state.modals = [];
        });
      },

      getActiveModal: () => {
        const { modals } = get();
        return modals[modals.length - 1] || null;
      },

      // Sidebar Actions
      openSidebar: () => {
        set((state) => {
          state.sidebar.isOpen = true;
        });
      },

      closeSidebar: () => {
        set((state) => {
          state.sidebar.isOpen = false;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebar.isOpen = !state.sidebar.isOpen;
        });
      },

      pinSidebar: () => {
        set((state) => {
          state.sidebar.isPinned = true;
        });
      },

      unpinSidebar: () => {
        set((state) => {
          state.sidebar.isPinned = false;
        });
      },

      setActiveSection: (section: string) => {
        set((state) => {
          state.sidebar.activeSection = section;
        });
      },

      // Preferences Actions
      updatePreferences: (preferences: Partial<UIPreferences>) => {
        set((state) => {
          state.preferences = { ...state.preferences, ...preferences };
        });
      },

      resetPreferences: () => {
        set((state) => {
          state.preferences = defaultPreferences;
        });
      },

      // Search Actions
      setSearchQuery: (query: string) => {
        set((state) => {
          state.search.query = query;
          state.search.isActive = query.length > 0;
        });
      },

      setSearchFilters: (filters: Record<string, string[]>) => {
        set((state) => {
          state.search.filters = filters;
        });
      },

      setSearchSort: (sortBy: string, sortOrder: 'asc' | 'desc') => {
        set((state) => {
          state.search.sortBy = sortBy;
          state.search.sortOrder = sortOrder;
        });
      },

      clearSearch: () => {
        set((state) => {
          state.search = { ...defaultSearch };
        });
      },

      toggleSearch: () => {
        set((state) => {
          state.search.isActive = !state.search.isActive;
          if (!state.search.isActive) {
            state.search.query = '';
          }
        });
      },

      // Scroll Actions
      setScrollPosition: (position: number) => {
        set((state) => {
          state.scrollPosition = position;
        });
      },

      // Page metadata Actions
      setPageTitle: (title: string) => {
        set((state) => {
          state.pageTitle = title;
        });
        // Also update document title
        document.title = title;
      },

      setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => {
        set((state) => {
          state.breadcrumbs = breadcrumbs;
        });
      },

      addBreadcrumb: (breadcrumb: { label: string; href?: string }) => {
        set((state) => {
          state.breadcrumbs.push(breadcrumb);
        });
      },
    })),
    {
      name: 'portfolio-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        sidebar: {
          isPinned: state.sidebar.isPinned,
        },
      }),
    }
  )
);

// Selectors for better performance
export const useIsMobileNavOpen = () => useUIStore(state => state.isMobileNavOpen);
export const useToasts = () => useUIStore(state => state.toasts);
export const useModals = () => useUIStore(state => state.modals);
export const useLoading = (key: string) => useUIStore(state => state.loading[key] || false);
export const useSidebar = () => useUIStore(state => state.sidebar);
export const usePreferences = () => useUIStore(state => state.preferences);
export const useSearch = () => useUIStore(state => state.search);
export const usePageMetadata = () => useUIStore(state => ({
  title: state.pageTitle,
  breadcrumbs: state.breadcrumbs,
}));

export default useUIStore;

