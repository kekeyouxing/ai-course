import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {routes} from "@/router.tsx";

import './App.css';

function App() {
    return (
        <RouterProvider router={createBrowserRouter(routes)}/>
    )
}

export default App
