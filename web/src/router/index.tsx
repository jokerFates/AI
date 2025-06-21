import Intercept from "@/components/404";
import { Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Layout from "@/pages/layout";
import AuthRoute from "./AuthRoute";

const route = [
  {
    path: "/",
    redirect: "login",
    element: <Navigate to={"/login"}></Navigate>,
  },
  {
    exact: true,
    path: "login",
    element: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    ),
  },
  {
    exact: true,
    path: "layout",
    element: (
      <AuthRoute>
        <Layout />
      </AuthRoute>
    ),
  },
  {
    path: "*",
    exact: true,
    element: <Intercept />,
  },
];

export { route };
