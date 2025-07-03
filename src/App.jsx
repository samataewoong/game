import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ImageSplitter from './ImageSpliter'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ImageSplitter></ImageSplitter>
    </>
  )
}

export default App
