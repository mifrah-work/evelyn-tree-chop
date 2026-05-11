import { useState } from 'react'
import { GameProvider } from './context/GameContext'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ShopPage } from './pages/ShopPage'
import { HomeDecorationPage } from './pages/HomeDecorationPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'quiz':
        return <QuizPage onNavigate={setCurrentPage} />
      case 'shop':
        return <ShopPage onNavigate={setCurrentPage} />
      case 'home-decoration':
        return <HomeDecorationPage onNavigate={setCurrentPage} />
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  return (
    <GameProvider>
      <div className="app-container">
        {renderPage()}
      </div>
    </GameProvider>
  )
}

export default App

