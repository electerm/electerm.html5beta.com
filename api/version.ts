import type { VercelRequest, VercelResponse } from '@vercel/node'
import log from '../src/api/mongo.js'
import { nanoid } from 'nanoid'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import model from '../src/api/model.js'

const cwd = process.cwd()

const ver = readFileSync(resolve(cwd, 'public/version.txt'), 'utf-8')

function convert (q: Object) {
  return Object.keys(q).reduce((p, k) => {
    return {
      ...p,
      [k]: model[k](q[k])
    }
  }, {})
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const {
    method = '',
    query
  } = req
  const arr = ['GET']
  if (!arr.includes(method)) {
    return res.status(404).send('404 not found')
  }
  if (query && query.n) {
    const id = nanoid()
    const data = convert(query)
    await log(id, data)
  }
  res.send(ver)
}
