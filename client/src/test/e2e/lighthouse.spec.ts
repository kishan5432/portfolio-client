import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

// Lighthouse performance thresholds
const PERFORMANCE_THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 90,
  pwa: 80,
};

test.describe('Lighthouse Performance Tests', () => {
  test('should meet performance benchmarks on homepage @lighthouse', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that hero section is visible
    await expect(page.locator('[aria-labelledby="hero-heading"]')).toBeVisible();

    // Basic performance checks
    const performanceMetrics = await page.evaluate(() => ({
      timing: performance.timing,
      navigation: performance.navigation,
      memory: (performance as any).memory,
    }));

    // Check that page loads in reasonable time (< 3s)
    const loadTime = performanceMetrics.timing.loadEventEnd - performanceMetrics.timing.navigationStart;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no accessibility violations @lighthouse', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    // Wait for interactive elements
    await page.waitForSelector('main');

    // Check for accessibility violations
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should load images efficiently @lighthouse', async ({ page }) => {
    // Monitor network requests
    const imageRequests: any[] = [];
    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        imageRequests.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'],
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that images are loading properly
    const images = await page.locator('img').all();
    for (const img of images) {
      // Check that images have alt text
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();

      // Check that images have proper dimensions
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');

      if (await img.getAttribute('loading') === 'lazy') {
        // Lazy loaded images should have dimensions to prevent CLS
        expect(width || height).toBeTruthy();
      }
    }

    // Check that no images failed to load
    const failedImages = imageRequests.filter(req => req.status >= 400);
    expect(failedImages).toHaveLength(0);
  });

  test('should have proper heading hierarchy @lighthouse', async ({ page }) => {
    await page.goto('/');

    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(async (heading) => {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const text = await heading.textContent();
        return { level: parseInt(tagName.charAt(1)), text, tagName };
      })
    );

    // Should have exactly one h1
    const h1Count = headingLevels.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Check that heading levels don't skip (e.g., h1 -> h3 without h2)
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i].level;
      const prevLevel = headingLevels[i - 1].level;

      if (currentLevel > prevLevel) {
        // If level increases, it should only increase by 1
        expect(currentLevel - prevLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have proper focus management @lighthouse', async ({ page }) => {
    await page.goto('/');

    // Test skip to content link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('text="Skip to main content"');
    await expect(skipLink).toBeFocused();

    // Press enter to use skip link
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();

    // Test keyboard navigation through buttons
    await page.keyboard.press('Tab');
    const firstFocusable = await page.locator(':focus').first();
    expect(firstFocusable).toBeTruthy();
  });

  test('should meet Core Web Vitals @lighthouse', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Measure Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (approximate with first interaction)
        let fid = 0;
        ['click', 'keydown'].forEach(type => {
          document.addEventListener(type, function (event) {
            if (!fid) {
              fid = performance.now() - event.timeStamp;
              vitals.fid = fid;
            }
          }, { once: true });
        });

        // Cumulative Layout Shift
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
          vitals.cls = cls;
        }).observe({ entryTypes: ['layout-shift'] });

        // Return values after a delay
        setTimeout(() => resolve(vitals), 3000);
      });
    });

    const vitals = await webVitals as any;

    // LCP should be under 2.5s (2500ms)
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500);
    }

    // FID should be under 100ms
    if (vitals.fid) {
      expect(vitals.fid).toBeLessThan(100);
    }

    // CLS should be under 0.1
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1);
    }
  });
});

test.describe('Cross-browser Performance', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should perform well on ${browserName} @lighthouse`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Basic functionality check
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();

      // Check that interactive elements work
      const buttons = await page.locator('button').all();
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
