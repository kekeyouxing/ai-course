import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {routes} from "@/router.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

import './App.css';

function App() {
    return (
        <div>
            <RouterProvider router={createBrowserRouter(routes)}/>
            <Toaster richColors position="top-center"/>
        </div>

    )
}

export default App
