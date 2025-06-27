import { createBrowserRouter, type RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import BusquedaFolios from "../pages/BusquedaFolios";
import ReporteExcel from "../pages/ReporteExcel";



const routes: RouteObject[] = [
    {
        path:'/',
        element:<Layout/>,
        children:[
            {
                index:true,
                element:<BusquedaFolios/>
            },
            {
                path:'*',
                element:<div> 404 Not Found </div>
            },
             {
                path: 'ReporteExcel',
                element: <ReporteExcel/>
             },
        ]
    }
]


export const router = createBrowserRouter(routes);