import { useEffect } from 'react'
import UniverseBg from 'universe-bg'

export default function Animate () {
  function init () {
    window.x = new UniverseBg({
      className: 'animate',
      // shootingStarCount: 150,
      // starCount: 1000,
      // starSize: 30,
      shootingStarSize: 0.4,
      shootingStarColor: 0x666666,
      starColor: 0x666666,
      bgColor: 0xffffff
      // starDistance: 80,
      // shootingStarDistance: 40
    })
  }
  useEffect(() => {
    init()
  }, [])
  return null
}
