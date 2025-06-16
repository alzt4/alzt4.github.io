import { Routes, Route } from "react-router-dom";
import IntroDocument from "./components/IntroDocument";
import Space from "./Space";
import { WebGLContextProvider } from "./webGLFunctions/webGLContext";
export default function App() {
  return (
    <WebGLContextProvider>
      <Routes>
        <Route path="/" element={<IntroDocument />}></Route>
        <Route path="/Space" element={<Space />}></Route>
      </Routes>
  </WebGLContextProvider>
  )
}

