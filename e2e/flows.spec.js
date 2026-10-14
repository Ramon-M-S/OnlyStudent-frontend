import { expect, test } from '@playwright/test'

const password = process.env.DEMO_PASSWORD || 'OnlyStudent2026!'

async function login(page, email) {
  await page.goto('/')
  if (await page.getByRole('button', { name: 'Abrir menu' }).isVisible()) {
    await page.getByRole('button', { name: 'Abrir menu' }).click()
  }
  await page.getByRole('navigation').getByRole('button', { name: 'Entrar' }).click()
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Fundamentos de Programação')).toBeVisible()
}

async function noHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
}

test('aluno entra, vê as turmas, explora e abre os detalhes', async ({ page }) => {
  await login(page, 'aluno.demo@onlystudent.test')
  await page.getByRole('button', { name: /Fundamentos de Programação/ }).click()
  await expect(page.getByText('Variáveis, condicionais, funções e primeiros exercícios.')).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Olá, Lucas.' })).toBeVisible()
  await page.getByRole('button', { name: /Fundamentos de Programação/ }).click()
  await page.getByRole('button', { name: '← Minhas turmas' }).click()
  await expect(page.getByRole('heading', { name: 'Olá, Lucas.' })).toBeVisible()
  await noHorizontalOverflow(page)
  const mobileMenu = page.getByRole('button', { name: 'Abrir menu' })
  if (await mobileMenu.isVisible()) await mobileMenu.click()
  await page.getByRole('navigation').getByRole('button', { name: 'Explorar turmas' }).click()
  await page.getByPlaceholder('Digite o nome da turma').fill('Lógica')
  await expect(page.getByText('Lógica de Programação')).toBeVisible()
  await noHorizontalOverflow(page)
})

test('professor entra e acessa o formulário de nova turma', async ({ page }) => {
  await login(page, 'professor.demo@onlystudent.test')
  await expect(page.getByText('Olá, Marina.')).toBeVisible()
  await noHorizontalOverflow(page)
  await page.getByRole('button', { name: /Fundamentos de Programação/ }).click()
  await expect(page.getByText('Variáveis, condicionais, funções e primeiros exercícios.')).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/#\/turmas$/)
  await expect(page.getByRole('heading', { name: 'Olá, Marina.' })).toBeVisible()
  await page.getByRole('button', { name: '+ Criar turma' }).click()
  await expect(page.getByLabel('Nome da turma')).toBeVisible()
  await expect(page.getByLabel('Descrição')).toBeVisible()
  await noHorizontalOverflow(page)
})
