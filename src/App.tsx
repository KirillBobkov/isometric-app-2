import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import { appTheme } from "./assets/theme";
import { Header } from "./components/Header";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { ProgramList } from "./components/ProgramList";

import { Promethean } from "./components/programs/Promethean";
import { PrometheanMarkII } from "./components/programs/PrometheanMarkII";
import { SixBySix } from "./components/programs/SixBySix";
import { BurnCount } from "./components/programs/BurnCount";
import { OldSchool } from "./components/programs/OldSchool";
import { OneRepMax } from "./components/programs/OneRepMax";

import { ThreeDaysOn } from "./components/programs/ThreeDaysOn";
import { IronMan } from "./components/programs/IronMan/index";
import { MockBluetoothService } from "./services/MockBluetoothService";
import { BluetoothService } from "./services/BluetoothService.js";
import { soundService } from "./services/SoundService";
import { MilitaryPower } from "./components/programs/MilitaryPower/index";
import { ArrowLeftIcon } from "lucide-react";

const bluetoothService = new BluetoothService();

export default function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<string>("0");
  const location = useLocation();

  // Подключение к устройству
  const handleConnect = async () => {
    try {
      const notifications$ = bluetoothService.connect();
      notifications$.subscribe({
        next: (value: any) => {
          // console.log("value", value);
          setMessage(value);
        },
        error: (err: any) => {
          console.error("Ошибка при получении данных:", err);
        },
      });
    } catch (error) {
      console.error("Ошибка подключения:", error);
    }
  };

  // Отключение от устройства
  const handleDisconnect = () => {
    bluetoothService.disconnect();
  };

  // Обновление статуса подключения
  useEffect(() => {
    const interval = setInterval(() => {
      const status = bluetoothService.getStatus();
      if (connected !== status) {
        setConnected(status);
        const bodyElement = document.querySelector("body");
        if (bodyElement) {
          bodyElement.click();
        }

        soundService.play(status ? "connect" : "disconnect");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [connected]);


  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
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
            <Link to="/" style={{ 
              position: "absolute", 
              top: "90px", 
              left: "16px", 
              display: "flex", 
              alignItems: "center",
              color: "inherit",
              textDecoration: "none" 
            }}>
              <ArrowLeftIcon style={{ marginRight: "5px" }} />
              НАЗАД
            </Link>
          )}

          <Routes>
            <Route path="/promethean" element={<Promethean />} />
            <Route path="/promethean-2" element={<PrometheanMarkII />} />
            <Route path="/6x6" element={<SixBySix />} />
            <Route path="/burn-count" element={<BurnCount />} />
            <Route path="/old-school" element={<OldSchool />} />
            <Route path="/one-rep-max" element={<OneRepMax />} />
            <Route
              path="/military-power"
              element={
                <MilitaryPower connected={connected} message={message} />
              }
            />
            <Route path="/3-days-on" element={<ThreeDaysOn />} />
            <Route
              path="/iron-man"
              element={<IronMan connected={connected} message={message} />}
            />
            <Route path="*" element={<ProgramList />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
