import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Loading = () => {

  const navigate = useNavigate()
  useEffect(()=>{
    const timeout = setTimeout(()=>{
      navigate('/')
    },8000)
    return () => clearTimeout(timeout)
  },[])
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-black">
      <div className="flex space-x-3">
        <span className="w-4 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-4 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-4 h-4 bg-purple-600 rounded-full animate-bounce"></span>
      </div>
    </div>
  )
}

export default Loading
