import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./assets/theme";
import { Header } from "./components/Header";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { ProgramList } from "./components/ProgramList";
import { NotificationProvider } from "./components/common/Notification";

import { Promethean } from "./components/programs/Promethean";
import { PrometheanMarkII } from "./components/programs/PrometheanMarkII";
import { IronMan } from "./components/programs/IronMan/index";
import { MockBluetoothService } from "./services/MockBluetoothService";
import { MilitaryPower } from "./components/programs/MilitaryPower/index";
import { ArrowLeftIcon } from "lucide-react";
import { useBluetoothConnection } from "./hooks/useBluetoothConnection";
import { BluetoothService } from "./services/BluetoothService";
import { useEffect } from "react";
import { soundService } from "./services/SoundService";

const bluetoothService = new BluetoothService();

export default function App() {
  const location = useLocation();

  // Initialize sound service once
  useEffect(() => {
    soundService.initialize();
  }, []);

  const { connected, message, handleConnect, handleDisconnect } =
    useBluetoothConnection(bluetoothService);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <NotificationProvider>
        <Box sx={{ flexGrow: 1 }}>
          <Header
            connected={connected}
            onToggleConnect={() =>
              !connected ? handleConnect() : handleDisconnect()
            }
          />
          <Container
            maxWidth="lg"
            sx={{
              mt: 20,
              mb: 4,
            }}
          >
            {location.pathname !== "/" && (
              <Link
                to="/"
                style={{
                  position: "absolute",
                  top: "90px",
                  left: "16px",
                  display: "flex",
                  alignItems: "center",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <ArrowLeftIcon style={{ marginRight: "5px" }} />
                НАЗАД
              </Link>
            )}

            <Routes>
              <Route path="/promethean" element={<Promethean />} />
              <Route path="/promethean-2" element={<PrometheanMarkII />} />
              <Route
                path="/military-power"
                element={
                  <MilitaryPower connected={connected} message={message} />
                }
              />
              <Route
                path="/iron-man"
                element={<IronMan connected={connected} message={message} />}
              />
              <Route path="*" element={<ProgramList />} />
            </Routes>
          </Container>
        </Box>
      </NotificationProvider>
    </ThemeProvider>
  );
}
