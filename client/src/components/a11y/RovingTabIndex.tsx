import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VisuallyHidden } from './SkipToContent';

interface RovingTabIndexProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  as?: keyof JSX.IntrinsicElements;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

interface RovingTabIndexContextValue {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  orientation: 'horizontal' | 'vertical' | 'both';
  loop: boolean;
  registerItem: (element: HTMLElement) => number;
  unregisterItem: (index: number) => void;
}

const RovingTabIndexContext = React.createContext<RovingTabIndexContextValue | null>(null);

export function RovingTabIndex({
  children,
  className = '',
  orientation = 'horizontal',
  loop = true,
  defaultIndex = 0,
  onIndexChange,
  as: Component = 'div',
  role = 'group',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: RovingTabIndexProps) {
  const [focusedIndex, setFocusedIndex] = useState(defaultIndex);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const nextIndexRef = useRef(0);

  const registerItem = useCallback((element: HTMLElement) => {
    const index = nextIndexRef.current++;
    itemsRef.current.set(index, element);
    return index;
  }, []);

  const unregisterItem = useCallback((index: number) => {
    itemsRef.current.delete(index);
  }, []);

  const handleFocusedIndexChange = useCallback((newIndex: number) => {
    setFocusedIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [onIndexChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const items = Array.from(itemsRef.current.entries()).sort(([a], [b]) => a - b);
    const currentIndex = items.findIndex(([index]) => index === focusedIndex);

    let nextIndex = currentIndex;
    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    switch (event.key) {
      case 'ArrowDown':
        if (isVertical) {
          event.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          event.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'ArrowRight':
        if (isHorizontal) {
          event.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          event.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    // Handle wrapping
    if (loop) {
      if (nextIndex >= items.length) {
        nextIndex = 0;
      } else if (nextIndex < 0) {
        nextIndex = items.length - 1;
      }
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
    }

    if (nextIndex !== currentIndex && items[nextIndex]) {
      const [newFocusedIndex, element] = items[nextIndex];
      handleFocusedIndexChange(newFocusedIndex);
      element.focus();
    }
  }, [focusedIndex, orientation, loop, handleFocusedIndexChange]);

  const contextValue: RovingTabIndexContextValue = {
    focusedIndex,
    setFocusedIndex: handleFocusedIndexChange,
    orientation,
    loop,
    registerItem,
    unregisterItem,
  };

  return (
    <RovingTabIndexContext.Provider value={contextValue}>
      <Component
        className={className}
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Component>
    </RovingTabIndexContext.Provider>
  );
}

interface RovingTabIndexItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  as?: keyof JSX.IntrinsicElements;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function RovingTabIndexItem({
  children,
  className = '',
  disabled = false,
  onClick,
  as: Component = 'button',
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: RovingTabIndexItemProps) {
  const context = React.useContext(RovingTabIndexContext);
  const [itemIndex, setItemIndex] = useState<number | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  if (!context) {
    throw new Error('RovingTabIndexItem must be used within RovingTabIndex');
  }

  const { focusedIndex, setFocusedIndex, registerItem, unregisterItem } = context;

  useEffect(() => {
    const element = elementRef.current;
    if (element && !disabled) {
      const index = registerItem(element);
      setItemIndex(index);
      return () => unregisterItem(index);
    }
  }, [registerItem, unregisterItem, disabled]);

  const handleClick = () => {
    if (!disabled && itemIndex !== null) {
      setFocusedIndex(itemIndex);
      onClick?.();
    }
  };

  const handleFocus = () => {
    if (!disabled && itemIndex !== null) {
      setFocusedIndex(itemIndex);
    }
  };

  const isFocused = itemIndex === focusedIndex;

  return (
    <Component
      ref={elementRef}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      role={role}
      tabIndex={disabled ? -1 : isFocused ? 0 : -1}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      onClick={handleClick}
      onFocus={handleFocus}
    >
      {children}
    </Component>
  );
}

// Gallery component with roving tabindex
interface AccessibleGalleryProps {
  items: Array<{
    id: string;
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  onItemSelect?: (item: any) => void;
  className?: string;
  itemClassName?: string;
}

export function AccessibleGallery({
  items,
  onItemSelect,
  className = '',
  itemClassName = '',
}: AccessibleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={className}>
      <VisuallyHidden>
        <h3>Image Gallery</h3>
        <p>Use arrow keys to navigate, Enter to select</p>
      </VisuallyHidden>

      <RovingTabIndex
        orientation="both"
        onIndexChange={setSelectedIndex}
        aria-label="Image gallery"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {items.map((item, index) => (
          <RovingTabIndexItem
            key={item.id}
            className={`
              ${itemClassName}
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
              rounded-lg overflow-hidden transition-transform duration-200
              hover:scale-105 focus:scale-105
            `}
            onClick={() => onItemSelect?.(item)}
            aria-label={`${item.title || 'Image'} ${index + 1} of ${items.length}. ${item.alt}`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-48 object-cover"
              loading="lazy"
              decoding="async"
            />
            {item.title && (
              <div className="p-3">
                <h4 className="font-medium text-sm">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
            )}
          </RovingTabIndexItem>
        ))}
      </RovingTabIndex>

      <VisuallyHidden aria-live="polite">
        {items[selectedIndex] &&
          `Selected: ${items[selectedIndex].title || 'Image'} ${selectedIndex + 1} of ${items.length}`
        }
      </VisuallyHidden>
    </div>
  );
}

// Hook to use roving tabindex context
export function useRovingTabIndex() {
  const context = React.useContext(RovingTabIndexContext);
  if (!context) {
    throw new Error('useRovingTabIndex must be used within RovingTabIndex');
  }
  return context;
}
