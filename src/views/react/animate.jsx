import { useEffect } from 'react'
import UniverseBg from 'universe-bg'

export default function Animate () {
  function init () {
    console.log('inited')
  }
  useEffect(() => {
    init()
  }, [])
  return null
}
