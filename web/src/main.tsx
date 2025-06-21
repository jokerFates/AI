import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./stores";
import "./index.css";
import { ConfigProvider } from "antd";

const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            fontSize: 16,
            colorPrimary: "#f28800",
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>
);
