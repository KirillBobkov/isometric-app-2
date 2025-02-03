// components/tabs/TrainingProgramsTab.tsx
import { Grid, Typography, Collapse, Button } from "@mui/material";
import React, { useState } from "react";
import { Container } from "@mui/material";
import { InfoCard } from "../InfoCard"; // Импортируем наш новый компонентexport

export const TimedMode = () => {
  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Функция для переключения видимости блока и текста кнопки
  const toggleContentVisibility = () => {
    setIsContentVisible((prevState) => !prevState);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 1 } }}>
      {/* Главный заголовок */}
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ p: "1 2", fontWeight: "bold", textTransform: "uppercase" }}
        gutterBottom
      >
        Режим времени (Timed mode)
      </Typography>

      {/* Кнопка показать/скрыть описание */}
      <Button
        variant="text" // Прозрачная кнопка
        color="inherit"
        onClick={toggleContentVisibility}
        sx={{
          display: "block",
          m: "0 auto",
          opacity: 0.5,
          mb: 4,
          borderRadius: "50",
          backgroundColor: "transparent", // Прозрачный фон
          border: "none", // Убираем рамку
          justifyContent: "space-between", // Размещаем текст и иконку по разные стороны
          "&:hover": {
            backgroundColor: "transparent", // Прозрачный фон
          },
        }}
      >
        {/* Текст кнопки */}
        {isContentVisible ? "Скрыть описание" : "Показать описание"}
      </Button>

      {/* Плавное скрытие/показывание блока */}
      <Collapse in={isContentVisible} timeout="auto">
        {/* Блоки с информацией */}
        <Grid container spacing={4}>
          {/* Что делает */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Что делает"
              content="Показывает изменяющуюся силу в реальном времени и пищит, когда достигается целевая нагрузка. Если вы её удерживаете или превышаете, устройство пищит раз в секунду."
            />
          </Grid>
          {/* Зачем использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Зачем использовать"
              content="Режим времени помогает узнать, сколько времени вы удерживали заданную нагрузку. Это научно доказанный способ развития силы через изометрические упражнения."
            />
          </Grid>
          {/* Как использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Как использовать"
              content="Нажмите кнопку 'TIME', чтобы активировать режим. Установите целевое время (от 2 до 999 секунд) и целевую нагрузку. Когда вы достигнете цели, устройство начнёт пищать."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Когда применять"
              content="Тренировки на развитие силы.
  Научные методы тренировок.
  Удержание нагрузки в течение конкретного времени (например, 6 секунд)."
            />
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
};
