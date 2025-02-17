import { useEffect, useState } from "react";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./theme.ts";
import { Header } from "./components/Header.tsx";
import { Routes, Route } from "react-router-dom";
import { ProgramList } from "./components/ProgramList.tsx";

import { Promethean } from "./components/programs/Promethean.tsx";
import { PrometheanMarkII } from "./components/programs/PrometheanMarkII.tsx";
import { SixBySix } from "./components/programs/SixBySix.tsx";
import { BurnCount } from "./components/programs/BurnCount.tsx";
import { OldSchool } from "./components/programs/OldSchool.tsx";
import { OneRepMax } from "./components/programs/OneRepMax.tsx";
import { MilitaryPower } from "./components/programs/MilitaryPower.tsx";
import { ThreeDaysOn } from "./components/programs/ThreeDaysOn.tsx";
import { IronMan } from "./components/programs/IronMan.tsx";
import { BluetoothService } from "./services/BluetoothService.js";
import { MockBluetoothService } from "./services/MockBluetoothService.ts";

const bluetoothService = new BluetoothService();

export default function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<string>("0");

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
    setConnected(false);
  };

  // Обновление статуса подключения
  useEffect(() => {
    const interval = setInterval(() => {
      const status = bluetoothService.getStatus();
      if (connected !== status) {
        setConnected(status);
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
          <Routes>
            <Route path="/promethean" element={<Promethean />} />

            <Route path="/promethean-2" element={<PrometheanMarkII />} />
            <Route path="/6x6" element={<SixBySix />} />
            <Route
              path="/burn-count"
              element={<BurnCount />}
            />
            <Route path="/old-school" element={<OldSchool />} />
            <Route path="/one-rep-max" element={<OneRepMax />} />
            <Route path="/military-power" element={<MilitaryPower connected={connected} message={message}/>} />
            <Route path="/3-days-on" element={<ThreeDaysOn />} />
            <Route path="/iron-man" element={<IronMan />} />
            <Route path="*" element={<ProgramList />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
