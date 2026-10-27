const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', m => errors.push('CONSOLE[' + m.type() + ']: ' + m.text()));
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', r => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()?.errorText || '')));
  page.on('response', r => {
    if (r.url().includes('/api/trips') || r.url().includes('create-trip') || r.url().includes('/trips/new')) {
      errors.push('RESP ' + r.status() + ' ' + r.url());
    }
  });

  // Step 1: Login
  await page.goto('http://localhost:3001/login');
  await page.waitForSelector('#email', { timeout: 15000 });
  await page.fill('#email', 'admin@fleet.com');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3001/**', { timeout: 15000 });
  console.log('After login URL:', page.url());

  // Step 2: Go to trips/new
  await page.goto('http://localhost:3001/trips/new');
  await page.waitForSelector('form', { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log('Trips/new URL:', page.url());

  // Check for select triggers (role=combobox)
  const comboboxes = await page.locator('[role="combobox"]').count();
  console.log('Combobox count:', comboboxes);

  // Check all form elements
  const els = await page.locator('form *').evaluate(el => Array.from(el).map(e => ({
    tag: e.tagName, id: e.id, role: e.getAttribute('role'), text: (e.textContent||'').substring(0,40), disabled: e.disabled
  })));
  console.log('FORM ELEMENTS:', JSON.stringify(els.filter(e => e.role || e.id || e.tag === 'BUTTON' || e.tag === 'SELECT'), null, 2));

  // Try clicking vehicle select
  if (comboboxes > 0) {
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(500);
    const opts = await page.locator('[role="listbox"] [role="option"]').count();
    console.log('Vehicle options after click:', opts);
    if (opts > 0) {
      await page.locator('[role="listbox"] [role="option"]').first().click();
      console.log('Selected first vehicle');
    }
  }

  // Try clicking driver select
  const cbCount = await page.locator('[role="combobox"]').count();
  if (cbCount > 1) {
    await page.locator('[role="combobox"]').nth(1).click();
    await page.waitForTimeout(500);
    const opts = await page.locator('[role="listbox"] [role="option"]').count();
    console.log('Driver options after click:', opts);
    if (opts > 0) {
      await page.locator('[role="listbox"] [role="option"]').first().click();
      console.log('Selected first driver');
    }
  }

  await page.fill('#origin', 'Test Origin');
  await page.fill('#destination', 'Test Destination');
  await page.fill('#totalKm', '100');
  await page.fill('#revenue', '5000');

  // Check button state before click
  const btn = await page.locator('button:has-text("Create Trip")');
  console.log('Button disabled:', await btn.getAttribute('disabled'));

  // Listen for navigation
  let navigated = false;
  page.on('navigate', () => { navigated = true; });

  await btn.click();
  await page.waitForTimeout(3000);
  console.log('After click URL:', page.url());
  console.log('Navigated:', navigated);

  // Check for any new errors/toasts
  const toastText = await page.locator('[role="status"], [role="alert"], .toast, [class*="toast"]').count();
  console.log('Toast/alert elements:', toastText);

  await page.screenshot({ path: 'D:/gitdata/fleet_software/final-state.png' });

  console.log('=== ALL LOGS ===');
  errors.forEach(e => console.log(e));

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });