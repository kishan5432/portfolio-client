import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { SkipToContent, VisuallyHidden } from '@/components/a11y/SkipToContent';
import { RovingTabIndex, RovingTabIndexItem } from '@/components/a11y/RovingTabIndex';

// Mock framer-motion to avoid issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    button: 'button',
    a: 'a',
    img: 'img',
    span: 'span',
    header: 'header',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useScroll: () => ({ scrollY: { on: vi.fn(), get: () => 0 }, scrollYProgress: { on: vi.fn(), get: () => 0 } }),
  useTransform: () => 0,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: () => ({ set: vi.fn(), get: () => 0 }),
}));

// Mock hooks
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  describe('SkipToContent', () => {
    it('should render skip links', () => {
      render(<SkipToContent />);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
      expect(screen.getByText('Skip to footer')).toBeInTheDocument();
    });

    it('should have proper href attributes', () => {
      render(<SkipToContent />);

      const mainLink = screen.getByText('Skip to main content');
      expect(mainLink).toHaveAttribute('href', '#main-content');

      const navLink = screen.getByText('Skip to navigation');
      expect(navLink).toHaveAttribute('href', '#navigation');

      const footerLink = screen.getByText('Skip to footer');
      expect(footerLink).toHaveAttribute('href', '#footer');
    });
  });

  describe('VisuallyHidden', () => {
    it('should hide content visually but keep it accessible', () => {
      render(<VisuallyHidden>Hidden content</VisuallyHidden>);

      const element = screen.getByText('Hidden content');
      expect(element).toBeInTheDocument();

      // Check that it has screen reader only styles
      expect(element).toHaveStyle({
        position: 'absolute',
        width: '1px',
        height: '1px',
      });
    });

    it('should render as different elements', () => {
      render(<VisuallyHidden as="h2">Heading</VisuallyHidden>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Heading');
    });
  });

  describe('RovingTabIndex', () => {
    it('should render with proper ARIA attributes', () => {
      render(
        <RovingTabIndex aria-label="Test group">
          <RovingTabIndexItem>Item 1</RovingTabIndexItem>
          <RovingTabIndexItem>Item 2</RovingTabIndexItem>
        </RovingTabIndex>
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-label', 'Test group');
    });

    it('should manage tabindex correctly', () => {
      render(
        <RovingTabIndex>
          <RovingTabIndexItem>Item 1</RovingTabIndexItem>
          <RovingTabIndexItem>Item 2</RovingTabIndexItem>
        </RovingTabIndex>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('tabindex', '0'); // First item is focusable
      expect(buttons[1]).toHaveAttribute('tabindex', '-1'); // Other items are not
    });
  });

  describe('HomePage Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<HomePage />);

      // Should have one h1
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);

      // Should have h2 elements for sections
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have proper landmarks', () => {
      renderWithRouter(<HomePage />);

      // Check for main landmark (should be in Layout)
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have accessible images', () => {
      renderWithRouter(<HomePage />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        // Every image should have alt text
        expect(img).toHaveAttribute('alt');
        const alt = img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt?.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible buttons', () => {
      renderWithRouter(<HomePage />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Buttons should have accessible names
        const accessibleName =
          button.getAttribute('aria-label') ||
          button.getAttribute('aria-labelledby') ||
          button.textContent;
        expect(accessibleName).toBeTruthy();
      });
    });

    it('should have proper carousel accessibility', () => {
      renderWithRouter(<HomePage />);

      // Check for tablist role
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
      expect(tablist).toHaveAttribute('aria-label', 'Project navigation');

      // Check for tabs
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // Check that one tab is selected
      const selectedTabs = tabs.filter(tab =>
        tab.getAttribute('aria-selected') === 'true'
      );
      expect(selectedTabs).toHaveLength(1);
    });

    it('should have proper section labeling', () => {
      renderWithRouter(<HomePage />);

      // Check that sections have proper aria-labelledby
      const heroSection = screen.getByLabelText(/kishan kumar/i);
      expect(heroSection).toBeInTheDocument();

      // Other sections should have proper labels
      expect(screen.getByText('Portfolio Statistics')).toBeInTheDocument();
      expect(screen.getByText('Featured Projects')).toBeInTheDocument();
      expect(screen.getByText('Recent Certificates')).toBeInTheDocument();
      expect(screen.getByText('My Journey')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus properly', () => {
      renderWithRouter(<HomePage />);

      // Get focusable elements
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      // Should have focusable elements
      expect(buttons.length + links.length).toBeGreaterThan(0);

      // Focus first button
      if (buttons.length > 0) {
        buttons[0].focus();
        expect(buttons[0]).toHaveFocus();
      }
    });
  });
});
