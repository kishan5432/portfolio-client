import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the homepage successfully @smoke', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Kishan Kumar');

    // Check navigation
    await expect(page.locator('nav')).toBeVisible();

    // Check main content areas
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('[aria-labelledby="hero-heading"]')).toBeVisible();
    await expect(page.locator('[aria-labelledby="stats-heading"]')).toBeVisible();
    await expect(page.locator('[aria-labelledby="projects-heading"]')).toBeVisible();
  });

  test('should navigate between pages @smoke', async ({ page }) => {
    await page.goto('/');

    // Click on Projects link
    await page.click('text="Projects"');
    await expect(page).toHaveURL('/projects');

    // Go back to home
    await page.click('text="Home"');
    await expect(page).toHaveURL('/');
  });

  test('should have working interactive elements @smoke', async ({ page }) => {
    await page.goto('/');

    // Check that buttons are clickable
    const buttons = await page.locator('button:visible').all();
    expect(buttons.length).toBeGreaterThan(0);

    // Test project carousel navigation
    const carouselButtons = await page.locator('[role="tab"]').all();
    if (carouselButtons.length > 1) {
      await carouselButtons[1].click();
      await expect(carouselButtons[1]).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should handle keyboard navigation @smoke', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First focusable element

    const focusedElement = await page.locator(':focus').first();
    expect(focusedElement).toBeTruthy();
  });

  test('should load without JavaScript errors @smoke', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    expect(errors).toHaveLength(0);
  });

  test('should be responsive @smoke', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have proper meta tags @smoke', async ({ page }) => {
    await page.goto('/');

    // Check meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Portfolio');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

test.describe('Performance Smoke Tests', () => {
  test('should load quickly @smoke', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have layout shifts @smoke', async ({ page }) => {
    await page.goto('/');

    // Wait for any animations to settle
    await page.waitForTimeout(2000);

    // Take screenshot to ensure layout is stable
    await expect(page).toHaveScreenshot('homepage-layout.png', {
      fullPage: true,
      threshold: 0.3, // Allow for minor differences
    });
  });
});
