
import Animate from './animate'

function renderLink (link) {
  const { text, ...args } = link
  return (
    <a {...args} key={text}>{text}</a>
  )
}

export default function Footer (props) {
  return (
    <div className='mg3y pd3y'>
      <div>
        <a
          href='https://html5beta.com'
          className='mg3r'
        >
          © ZHAO Xudong
        </a>
        {
          (props.links || []).map(renderLink)
        }
      </div>
      {
        props.noAnimate
          ? null
          : (
            <Animate />
            )
      }
    </div>
  )
}
