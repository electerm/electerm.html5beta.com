import model from './model.js'
import { Mongoose } from 'mongoose'

export default async function log (id: String, data: Object | undefined): Promise<void> {
  const mongoose = new Mongoose()
  mongoose.set('autoIndex', false)
  const {
    DB_PREFIX = '',
    DB_URL = ''
  } = process.env
  await mongoose.connect(DB_URL)
  const sch = new mongoose.Schema(
    {
      _id: {
        type: String
      },
      ...model
    },
    { timestamps: true }
  )
  const dbRealName = DB_PREFIX + 'Log'
  const Mod = mongoose.model(dbRealName, sch)
  if (data) {
    await Mod.create({
      _id: id,
      ...data
    })
  }
}
