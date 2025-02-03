import { useEffect, useState } from "react";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "./theme.ts";
import { Header } from "./components/Header.tsx";
import { Feedback } from "./components/modes/Feedback.tsx";
import { MaxMode } from "./components/modes/MaxMode.tsx";
import { AverageMode } from "./components/modes/AverageMode.tsx";
import { TimedMode } from "./components/modes/TimedMode.tsx";
import { LoadMode } from "./components/modes/LoadMode.tsx";
import { BluetoothService } from "./BluetoothService.ts";

const bluetoothService = new BluetoothService();

export default function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<string>('0');

    // Подключение к устройству
    const handleConnect = async () => {
      try {
        const notifications$ = bluetoothService.connect();
        // notifications$.subscribe({
          notifications$.subscribe({
          next: (value: any) => {
            console.log('value', value)
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
    
  const onToggleConnect = () => {
    return !connected ? handleConnect() : handleDisconnect();
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

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: // Feedback mode
        return <Feedback message={message} />;
      case 1: // Max mode
        return <MaxMode />;
      case 2: // Average mode
        return <AverageMode />;
      case 3: // Timed mode
        return <TimedMode />;
      case 4: // Load mode
        return <LoadMode />;
      default:
        return <Feedback message={message} />; // Default fallback
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <Header
          connected={connected}
          onToggleConnect={onToggleConnect}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <Container
          maxWidth="lg"
          sx={{
            mt: 22,
            mb: 4,
            pointerEvents: connected ? "auto" : "none",
            opacity: connected ? 1 : 0.3,
          }}
        >
          {renderTabContent()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
