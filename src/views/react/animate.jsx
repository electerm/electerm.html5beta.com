import { useEffect } from 'react'

export default function Animate () {
  function init () {
    console.log('inited')
  }
  useEffect(() => {
    init()
  }, [])
  return null
}
