const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', m => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text());
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', r => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

  // Step 1: Login
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'D:/gitdata/fleet_software/login-page.png' });
  const emailInput = await page.locator('#email').count();
  console.log('Email input count:', emailInput);
  if (emailInput === 0) {
    console.log('PAGE HTML:', await page.content());
  }
  await page.waitForSelector('#email', { timeout: 15000 });
  await page.fill('#email', 'admin@fleet.com');
  await page.fill('#password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {
    console.log('Did not redirect to dashboard, current URL:', page.url());
  });
  console.log('After login URL:', page.url());
  await page.screenshot({ path: 'D:/gitdata/fleet_software/after-login.png' });

  // Step 2: Navigate to trips/new
  await page.goto('http://localhost:3001/trips/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Trips/new URL:', page.url());
  await page.screenshot({ path: 'D:/gitdata/fleet_software/trips-new.png' });
  // Dump the form HTML
  const formHtml = await page.locator('form').first().innerHTML().catch(() => 'NO FORM');
  console.log('FORM HTML:', formHtml.substring(0, 3000));
  // Check all inputs/selects
  const allInputs = await page.locator('input, select, button, [role="combobox"], [role="listbox"]').evaluate(el => Array.from(el).map(e => ({ tag: e.tagName, id: e.id, role: e.getAttribute('role'), text: e.textContent?.substring(0,60) })));
  console.log('ALL FORM ELEMENTS:', JSON.stringify(allInputs, null, 2));

  // Try selecting and submitting
  if (vehicleSelect > 0) {
    try {
      await page.click('[id="vehicleId"]');
      await page.waitForTimeout(500);
      const firstOpt = await page.locator('[role="listbox"] [role="option"]').first();
      if (await firstOpt.count() > 0) {
        await firstOpt.click();
        console.log('Selected first vehicle');
      }
    } catch (e) { console.log('Vehicle select err:', e.message); }
  }

  if (driverSelect > 0) {
    try {
      await page.click('[id="driverId"]');
      await page.waitForTimeout(500);
      const firstOpt = await page.locator('[role="listbox"] [role="option"]').first();
      if (await firstOpt.count() > 0) {
        await firstOpt.click();
        console.log('Selected first driver');
      }
    } catch (e) { console.log('Driver select err:', e.message); }
  }

  await page.fill('#origin', 'Test Origin');
  await page.fill('#destination', 'Test Destination');
  await page.fill('#totalKm', '100');
  await page.fill('#revenue', '5000');

  // Click Create Trip and watch network
  const responses = [];
  page.on('response', r => {
    if (r.url().includes('/api/trips') || r.url().includes('create-trip')) {
      responses.push({ url: r.url(), status: r.status() });
    }
  });

  if (createBtn > 0) {
    await page.click('button:has-text("Create Trip")');
    console.log('Clicked Create Trip');
  } else {
    // Try submit via form
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const ev = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(ev);
      }
    });
    console.log('Dispatched form submit');
  }

  await page.waitForTimeout(3000);
  console.log('After submit URL:', page.url());
  await page.screenshot({ path: 'D:/gitdata/fleet_software/after-submit.png' });

  // Check for error messages on page
  const errorText = await page.locator('.text-destructive, [class*="destructive"]').count();
  console.log('Error elements on page:', errorText);
  if (errorText > 0) {
    const msg = await page.locator('.text-destructive, [class*="destructive"]').first().textContent();
    console.log('Error message:', msg);
  }

  console.log('=== ERRORS ===');
  errors.forEach(e => console.log(e));
  console.log('=== RESPONSES ===');
  responses.forEach(r => console.log(r.status, r.url));

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });