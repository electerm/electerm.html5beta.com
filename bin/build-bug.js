/**
 * build common files with react module in it
 */
import fs from 'fs/promises'
import pug from 'pug'

export const buildPug = async (from, to, data) => {
  const pugContent = await fs.readFile(from, 'utf8')
  const htmlContent = pug.render(pugContent, {
    filename: from,
    ...data
  })
  await fs.writeFile(to, htmlContent, 'utf8')
}
