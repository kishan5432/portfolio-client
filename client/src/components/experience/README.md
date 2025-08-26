# Custom Cursor System

A performant, accessible custom cursor system with magnetic effects and hover states, built with Framer Motion and React.

## Features

- **Custom Cursor**: Replaces the default cursor with a smooth, animated circle
- **Magnetic Effects**: Elements can attract the cursor when hovering nearby
- **Hover States**: Different cursor appearances for different interaction types
- **Reduced Motion Support**: Automatically disables effects for users with motion sensitivity
- **Performance Optimized**: Uses `requestAnimationFrame` and efficient event handling
- **TypeScript Support**: Fully typed with comprehensive interfaces

## Components

### Cursor

The main custom cursor component that follows the mouse with smooth animations.

```tsx
import { Cursor } from '@/components/experience';

function App() {
  return (
    <div>
      <Cursor />
      {/* Your app content */}
    </div>
  );
}
```

### Button with Magnetic Effect

Enhanced Button component with built-in magnetic effects and cursor states.

```tsx
import { Button } from '@/components/ui/Button';

// Magnetic button with default magnet cursor
<Button magnetic>Click me</Button>

// Custom magnetic options
<Button
  magnetic
  magneticOptions={{
    strength: 0.4,
    radius: 150,
    damping: 30,
    stiffness: 500
  }}
>
  Strong Magnet
</Button>

// Custom cursor type
<Button cursorType="view">View Button</Button>
```

## Data Attributes

Use `data-cursor` attributes to control cursor behavior on any element:

```tsx
// Default cursor behavior
<div data-cursor="default">Standard interaction</div>

// Magnetic attraction effect
<div data-cursor="magnet">Cursor attracts to this element</div>

// Enhanced viewing cursor
<div data-cursor="view">Enhanced cursor for viewing</div>
```

## Magnetic Effects

### useMagnetic Hook

Create custom magnetic effects on any element:

```tsx
import { useMagnetic } from '@/lib/magnetic';

function MagneticCard() {
  const magnetic = useMagnetic({
    strength: 0.3, // Magnetic force (0-1)
    radius: 100, // Attraction radius in pixels
    damping: 25, // Spring damping
    stiffness: 400, // Spring stiffness
    mass: 0.1, // Spring mass
  });

  return (
    <motion.div
      ref={magnetic.ref}
      style={{
        x: magnetic.x,
        y: magnetic.y,
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      This card attracts the cursor
    </motion.div>
  );
}
```

### withMagnetic HOC

Wrap any component with magnetic effects:

```tsx
import { withMagnetic } from '@/lib/magnetic';

const MagneticImage = withMagnetic('img', { strength: 0.2 });

function Gallery() {
  return <MagneticImage src="/image.jpg" alt="Magnetic image" />;
}
```

### createMagneticEffect

Apply magnetic effects to DOM elements directly:

```tsx
import { createMagneticEffect } from '@/lib/magnetic';

useEffect(() => {
  const element = document.getElementById('my-element');
  if (element) {
    const cleanup = createMagneticEffect(element, {
      strength: 0.3,
      radius: 120,
    });

    return cleanup;
  }
}, []);
```

## Configuration Options

### Cursor States

| State     | Description         | Visual Effect                                 |
| --------- | ------------------- | --------------------------------------------- |
| `default` | Standard cursor     | Small circle, subtle glow                     |
| `magnet`  | Magnetic attraction | Medium circle, magnetic glow, trailing effect |
| `view`    | Enhanced viewing    | Large circle, enhanced glow, double trailing  |

### Magnetic Options

| Option      | Default | Description                         |
| ----------- | ------- | ----------------------------------- |
| `strength`  | 0.3     | Magnetic force (0-1)                |
| `radius`    | 100     | Attraction radius in pixels         |
| `damping`   | 25      | Spring damping for smooth movement  |
| `stiffness` | 400     | Spring stiffness for responsiveness |
| `mass`      | 0.1     | Spring mass for inertia             |

## Performance Considerations

- **Hardware Acceleration**: Uses `transform: translate3d(0, 0, 0)` for GPU acceleration
- **Efficient Animation**: Leverages Framer Motion's optimized animation system
- **Event Throttling**: Mouse events are handled efficiently with `requestAnimationFrame`
- **Memory Management**: Proper cleanup of event listeners and animation frames

## Accessibility

- **Reduced Motion**: Automatically disables effects when `prefers-reduced-motion` is enabled
- **Keyboard Navigation**: Cursor effects don't interfere with keyboard interactions
- **Screen Readers**: Cursor is hidden from screen readers (`pointer-events: none`)

## Browser Support

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Mobile Devices**: Touch-friendly with appropriate fallbacks
- **Legacy Support**: Graceful degradation for older browsers

## Examples

See `CursorDemo.tsx` for comprehensive examples of all features:

- Different cursor types
- Magnetic buttons
- Custom magnetic elements
- Advanced interactions
- Performance demonstrations

## Integration

### With Existing Components

```tsx
// Add to your layout or app root
import { Cursor } from '@/components/experience';

function Layout({ children }) {
  return (
    <>
      <Cursor />
      {children}
    </>
  );
}
```

### With Tailwind CSS

The system works seamlessly with Tailwind CSS classes and can be customized using the `className` prop:

```tsx
<Cursor className="w-6 h-6 bg-blue-500" />
```

### With Other Animation Libraries

The magnetic system can be combined with other animation libraries:

```tsx
import { useMagnetic } from '@/lib/magnetic';
import { useSpring, animated } from '@react-spring/web';

function HybridElement() {
  const magnetic = useMagnetic();
  const spring = useSpring({ scale: 1 });

  return (
    <animated.div
      ref={magnetic.ref}
      style={{
        x: magnetic.x,
        y: magnetic.y,
        scale: spring.scale,
      }}
    >
      Hybrid animation element
    </animated.div>
  );
}
```

## Troubleshooting

### Cursor Not Visible

- Check if `prefers-reduced-motion` is enabled
- Ensure the Cursor component is mounted
- Verify z-index is high enough (`z-[9999]`)

### Magnetic Effects Not Working

- Check if `magnetic` prop is set to `true`
- Verify element has proper dimensions
- Ensure no conflicting CSS transforms

### Performance Issues

- Reduce `strength` and `radius` values
- Increase `damping` for smoother movement
- Use `useCallback` for event handlers in custom implementations

## License

This component system is part of the portfolio project and follows the same licensing terms.
