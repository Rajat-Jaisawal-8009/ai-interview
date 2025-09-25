import { useState } from 'react'

import './App.css'

import AiInterviewPage from './components/AiInterviewPage.jsx'

function App() {
const [start , setstart] = useState(false)

const startHandle = ()=>{
   setstart(!start)
}

  return (
    <>
      <AiInterviewPage />
    </>
  )
}

export default App
