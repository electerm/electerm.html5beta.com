import { useEffect, useState } from 'react'
import CanvasShapesBg from 'canvas-shapes-bg'
import UniverseBg from 'universe-bg'

export default function Animate () {
  const [on, setOn] = useState(true)
  const [shape, setShape] = useState(window.initShape || 'bubble')
  const pool = ['star', 'bubble', 'heart', 'light', 'balloon']
  const len = pool.length
  function toggle () {
    if (on) {
      window.shapesInst.stop()
    } else {
      window.shapesInst.start()
    }
    setOn(!on)
  }
  function init () {
    const x = new UniverseBg({
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
    x.renderer.domElement.classList.add('animate')
    const options = {
      shapeCount: 20, // how many shapes to draw, optional
      timer: 100, // render animation frame for every {timer} ms, optional
      step: 3, // animation step px, optional
      minSize: 50, // shape size min, optional
      maxSize: 150, // shape size max, optional
      shapesPool: [shape] // what shape you want draw, inside there are 'star', 'bubble', 'heart', 'light', 'balloon', optional, default is ['star']
    }
    const shapesInst = new CanvasShapesBg(
      document.getElementById('ca'),
      options
    )
    shapesInst.start()
    window.shapesInst = shapesInst
  }
  function change () {
    const index = pool.findIndex(d => d === shape)
    const next = (index + 1) % len
    const nextShape = pool[next]
    setShape(nextShape)
    window.shapesInst.shapesPool = [nextShape]
    window.shapesInst.stop()
    window.shapesInst.start()
  }
  useEffect(() => {
    init()
  }, [])
  return (
    <div className='pd2y'>
      <span
        className='mg2r pointer'
        onClick={toggle}
      >
        {on ? 'Stop animation' : 'Start animation'}
      </span>
      <span
        onClick={change}
        className='pointer'
      >
        Change animation shapes
      </span>
    </div>
  )
}
