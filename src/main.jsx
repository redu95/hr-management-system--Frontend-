import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import App from "./App.jsx"

// Custom theme for Chakra UI
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: "#e6f3ff",
      100: "#b3d9ff",
      200: "#80bfff",
      300: "#4da6ff",
      400: "#1a8cff",
      500: "#0066cc",
      600: "#0052a3",
      700: "#003d7a",
      800: "#002952",
      900: "#001429",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
      },
    }),
  },
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </StrictMode>,
)
