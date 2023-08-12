import Footer from './react/footer'

function App () {
  const links = [
    {
      href: 'http://github.com/zxdong262',
      target: '_blank',
      rel: 'noreferrer',
      className: 'mg3r',
      text: 'GitHub'
    },
    {
      href: 'https://html5beta.com/page/timeline.html',
      target: '_blank',
      rel: 'noreferrer',
      text: 'Resume'
    }
  ]
  return (
    <div className='pd2'>
      <Footer
        links={links}
      />
    </div>
  )
}

export default App
