// components/Header.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Dumbbell, Bluetooth } from "lucide-react";

export const Header = ({
  connected,
  onToggleConnect,
}: any) => {
  const theme = useTheme();
  const mobile = useMediaQuery('(max-width:650px)');

  return (
    <AppBar
      position="fixed" color="transparent"
      sx={{ background: 'backgorund.default'  }}
    >
      <Toolbar sx={{ padding: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Dumbbell
          size={32}
          style={{ marginRight: "12px", color: theme.palette.primary.main }}
        />
        {!mobile ? <Typography variant={"h5"} component="div" sx={{ flexGrow: 1, fontWeight: '800' }}>
          Изометрический тренинг
        </Typography> : null}
        <Button
          startIcon={<Bluetooth size={20} />}
          onClick={() => onToggleConnect()}
          sx={{
            flexShrink: 0,
            borderRadius: "20px",
            border: "2px solid",
            color: connected ? 'success.main' : "text.secondary",
            borderColor: connected ? 'success.main' : "text.secondary",
            "&:hover": {
              borderColor:  connected ? 'success.main' : "text.secondary",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
          }}
        >
          {connected ? 'Подключено' : 'Подключить'}
        </Button>
      </Toolbar>

      {/* <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        textColor="primary"
        sx={{
          p: 1,
          "& .MuiTab-root": {
            minWidth: 150, // Минимальная ширина таба
            borderRadius: "50px", // BorderRadius для всех табов
            backgroundColor: "transparent", // Прозрачный фон для неактивных табов
            color: "#ffffff", // Белый текст для всех табов
            opacity: 0.7, // Прозрачность для неактивных табов
            transition: "background-color 0.3s ease, opacity 0.3s ease", // Плавный переход
          },
          "& .MuiTab-root.Mui-selected": {
            backgroundColor: "primary.main", // Подсветка активной табы
            opacity: 1, // Полная видимость для активной табы
            color: "#ffffff", // Белый текст для активной табы
          },
          "& .MuiTabs-indicator": {
            display: "none", // Скрываем стандартный индикатор
          },
        }}
      >
        <Tab disabled={!connected} label="Feedback mode" />
        <Tab disabled={!connected} label="Max mode" />
        <Tab disabled={!connected} label="Average mode" />
        <Tab  disabled={!connected} label="Timed mode" />
        <Tab  disabled={!connected} label="Load mode" />
      </Tabs> */}
    </AppBar>
  );
};
