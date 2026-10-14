import { expect, test } from '@playwright/test'

for (const [scheme, background, surface] of [
  ['light', 'rgb(250, 250, 247)', 'rgb(255, 255, 255)'],
  ['dark', 'rgb(5, 31, 32)', 'rgb(11, 43, 38)']
]) {
  test(`segue o tema ${scheme} do sistema`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/')
    const colors = await page.evaluate(() => ({
      background: getComputedStyle(document.documentElement).backgroundColor,
      surface: getComputedStyle(document.querySelector('.home-example')).backgroundColor
    }))
    expect(colors).toEqual({ background, surface })
  })
}

test('paleta escura aparece nos elementos da página', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  const colors = await page.evaluate(() => {
    const color = selector => getComputedStyle(document.querySelector(selector))
    return {
      heading: color('.home h1').color,
      muted: color('.home-copy > p').color,
      accent: color('.brand-mark').backgroundColor,
      border: color('.home-example').borderTopColor,
      themeColor: document.querySelector('meta[name="theme-color"]').content
    }
  })
  expect(colors).toEqual({
    heading: 'rgb(218, 241, 222)',
    muted: 'rgb(142, 182, 155)',
    accent: 'rgb(22, 59, 50)',
    border: 'rgb(35, 83, 71)',
    themeColor: '#051f20'
  })
})

test('controle de aparência salva tema, tamanho da fonte e alto contraste', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Aparência e acessibilidade' }).click()
  await expect(page.getByRole('button', { name: 'Sistema' })).toHaveAttribute('aria-pressed', 'true')
  const panel = await page.locator('.accessibility-panel').boundingBox()
  const viewport = page.viewportSize()
  expect(panel.x).toBeGreaterThanOrEqual(0)
  expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width)

  await page.getByRole('button', { name: 'Claro', exact: true }).click()
  await page.emulateMedia({ colorScheme: 'light' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(250, 250, 247)')

  await page.getByRole('button', { name: 'Escuro', exact: true }).click()
  const normalFont = await page.locator('.home-copy > p').evaluate(element => parseFloat(getComputedStyle(element).fontSize))
  await page.getByRole('button', { name: 'Aumentar fonte' }).click()
  await expect(page.locator('.font-controls output')).toHaveText('110%')
  expect(await page.locator('.home-copy > p').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(normalFont)
  await page.getByRole('switch', { name: 'Alto contraste' }).click()
  await expect(page.getByRole('switch', { name: 'Alto contraste' })).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(0, 0, 0)')

  await page.reload()
  await page.getByRole('button', { name: 'Aparência e acessibilidade' }).click()
  await expect(page.getByRole('button', { name: 'Escuro', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.font-controls output')).toHaveText('110%')
  await expect(page.getByRole('switch', { name: 'Alto contraste' })).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('button', { name: 'Restaurar padrão' }).click()
  await expect(page.getByRole('button', { name: 'Sistema' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.font-controls output')).toHaveText('100%')
  await expect(page.getByRole('switch', { name: 'Alto contraste' })).toHaveAttribute('aria-checked', 'false')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(250, 250, 247)')
  await page.getByRole('button', { name: 'Diminuir fonte' }).click()
  await expect(page.locator('.font-controls output')).toHaveText('90%')
  expect(await page.locator('.home-copy > p').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeLessThan(normalFont)
  for (let index = 0; index < 4; index++) await page.getByRole('button', { name: 'Aumentar fonte' }).click()
  await expect(page.locator('.font-controls output')).toHaveText('130%')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Aparência e acessibilidade' })).toBeFocused()
})
