// import { Button } from "@/components/ui/button"
// Page
import Page from "@/app/dashboard/page"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadVideoPage from "@/app/dashboard/upload-video-page.tsx";

// import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Page />} />
                <Route path="/home" element={<Page />} />
                <Route path="/uploadvideo" element={<UploadVideoPage />} />
            </Routes>
        </Router>
    )
}

export default App
