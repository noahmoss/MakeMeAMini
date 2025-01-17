// import { useState } from 'react'
import "./App.css";
import Game from "../Game";
import { createTheme, MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";

const theme = createTheme({});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Game />;
    </MantineProvider>
  );
}

export default App;
