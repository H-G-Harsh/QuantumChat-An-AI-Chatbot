import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {createBrowserRouter,RouterProvider} from "react-router-dom";

import Homepage from "./routes/homepage/Homepage.jsx";
import Dashboard from "./routes/dashboard/dashboard.jsx";
import Chat from "./routes/chatpage/chat.jsx";
import RootLayout from "./layouts/rootlayout/rootlayout.jsx";
import Dashboardlayout from "./layouts/dashboardlayout/dashboardlayout.jsx";
import Signin from './routes/signinpage/signin';
import Signup from './routes/signuppage/signup';
import { ClerkProvider } from '@clerk/clerk-react';



const router = createBrowserRouter([
  {
    element:<RootLayout />,
    children:[
      {
        path:"/",
        element:<Homepage />,
      },
      {
        path:"/sign-in",
        element:<Signin />,
      },
      {
        path:"/sign-up/*",
        element:<Signup />,
      },
      {
        element:<Dashboardlayout/>,
        children:[
          {
            path:"/dashboard",
            element:<Dashboard/>,
          },
          {
            path:"/dashboard/chat/:id",
            element:<Chat/>,
          },
        ],
      },
      
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
   
  <RouterProvider router={router} />

  </React.StrictMode>,
)
