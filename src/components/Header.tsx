// components/Header.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  Box,
} from "@mui/material";
import { Dumbbell, Bluetooth, HelpCircle } from "lucide-react";
import chromeImg from '../assets/images/chrome.png';
import React from "react";

export const Header = ({ connected, onToggleConnect }: any) => {
  const theme = useTheme();
  const mobile = useMediaQuery("(max-width:650px)");

  return (
    <AppBar
      position="fixed"
      color="transparent"
      sx={{ background: "backgorund.default" }}
    >
      <Toolbar
        sx={{ padding: 2, display: "flex", justifyContent: "space-between" }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Dumbbell
            size={32}
            style={{ marginRight: "12px", color: theme.palette.primary.main }}
          />
          {!mobile ? (
            <Typography
              variant={"h5"}
              component="div"
              sx={{ fontWeight: "800" }}
            >
              Изометрический тренинг
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip
            placement="bottom-end"
            enterTouchDelay={0}
            leaveTouchDelay={5000}
            componentsProps={{
              tooltip: {
                sx: {
                  maxWidth: '700px',
                  '& .MuiTooltip-tooltip': {
                    width: '700px',
                    padding: 0,
                  }
                }
              }
            }}
            title={
              <Box sx={{ p: 1 }}>
                <Typography sx={{ mb: 2}} variant="body2">
                   Если при клике на кнопку у вас не появляется окно подключения к устроствам BLuetooth:
                   <br/>
                   <br/>
                   1) Откройте страницу <b  style={{color: "#6bc2ff"}}>chrome://flags</b> в браузерной строке  <br/>
                   2) Включите настройку <b  style={{color: "#6bc2ff"}}>Web Bluetooth confirm pairing support</b> и установите значение <b style={{color: "#6bc2ff"}}>Enabled</b>
                   <br/>
                   <br/>
                   Эта настройка позволяет подключаться к устройствам Bluetooth из браузера. 
                         <br/>
                               <br/>
                   Если хотите подключиться к через смартфон, то используте браузер <b  style={{color: "#6bc2ff"}}>Bluefy</b> (или любой другой с поддержкой Bluetooth Low Energy)
                </Typography>
                <img
                  src={chromeImg}
                  alt="Bluetooth Connection"
                  style={{
                    width: "100%",
                    height: "auto",
                    marginBottom: "8px",
                  }}
                />
              </Box>
            }
          >
            <Box>
              <HelpCircle size={30} style={{ color: theme.palette.text.secondary, cursor: 'help' }} />
            </Box>
          </Tooltip>
          <Button
            startIcon={<Bluetooth size={20} />}
            onClick={() => onToggleConnect()}
            sx={{
              flexShrink: 0,
              borderRadius: "20px",
              border: "2px solid",
              color: connected ? "success.main" : "text.secondary",
              borderColor: connected ? "success.main" : "text.secondary",
              "&:hover": {
                borderColor: connected ? "success.main" : "text.secondary",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            {connected ? "Подключено" : "Подключить"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
