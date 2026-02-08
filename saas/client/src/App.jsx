import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Layout from './pages/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WriteArticle from './pages/WriteArticle.jsx'
import GenerateImage from './pages/GenerateImages.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import RemoveObject from './pages/RemoveObject.jsx'
import ReviewResume from './pages/ReviewResume.jsx'
import Community from './pages/Community.jsx'
import ContentRepurposer from './pages/ContentRepurposer.jsx'
import DataVisualizer from './pages/DataVisualizer.jsx'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import {Toaster} from 'react-hot-toast'
import ConceptComposer from './components/ConceptComposer';
import AIVisualMoodboard from './components/AIVisualMoodboard';
import AIVisualStoryGenerator from './components/AIVisualStoryGenerator';

const App = () => {

  const {getToken} = useAuth()
  useEffect(()=>{
    getToken().then((token)=>console.log(token))
  },[])

  return (
    <div>
      <Toaster/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/ai' element={<Layout/>} >
            <Route index element={<Dashboard/>} />
            <Route path='write-article' element={<WriteArticle/>} />
            <Route path='remove-background' element={<RemoveBackground/>} />
            <Route path='remove-object' element={<RemoveObject/>} />
            <Route path='review-resume' element={<ReviewResume/>} />
            <Route path='generate-images' element={<GenerateImage/>} />
            <Route path='content-repurposer' element={<ContentRepurposer/>} />
            <Route path='data-visualizer' element={<DataVisualizer/>} />
            <Route path='community' element={<Community/>} />
            <Route path='concept-composer' element={<ConceptComposer/>} />
            <Route path='ai-visual-moodboard' element={<AIVisualMoodboard/>} />
            <Route path='ai-visual-story-generator' element={<AIVisualStoryGenerator/>} />
        </Route>
        
      </Routes>
    </div>
  )
}

export default App
