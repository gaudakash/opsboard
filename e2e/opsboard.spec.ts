import { test, expect } from '@playwright/test'

test.describe('OpsBoard E2E User Flows', () => {
  
  test('should load login page and show correct elements', async ({ page }) => {
    await page.goto('/login')
    
    // Check title and form inputs exist
    await expect(page.locator('text=OpsBoard Admin')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should load signup page with role selector', async ({ page }) => {
    await page.goto('/signup')
    
    // Check signup elements exist
    await expect(page.locator('text=Create OpsBoard Account')).toBeVisible()
    await expect(page.locator('input[name="fullName"]')).toBeVisible()
    await expect(page.locator('select[name="role"]')).toBeVisible()
  })

  test('should redirect unauthenticated users away from dashboard', async ({ page }) => {
    await page.goto('/dashboard/products')
    
    // Should be redirected to /login
    await expect(page).toHaveURL(/.*login/)
  })

})