// components/tabs/TrainingProgramsTab.tsx
import { Grid, Typography, Collapse, Button } from "@mui/material";
import React, { useState } from "react";
import { Container } from "@mui/material";
import { InfoCard } from "../InfoCard"; // Импортируем наш новый компонентexport

export const LoadMode = () => {
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
        Режим нагрузки (Load mode)
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
              content="Показывает изменяющуюся силу в реальном времени и пищит, когда вы достигаете заранее установленной целевой нагрузки."
            />
          </Grid>
          {/* Зачем использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Зачем использовать"
              content="Режим нагрузки позволяет точно контролировать, сколько 'лежит на штанге'. Это особенно полезно для тех, кто предпочитает традиционные подходы к тренировкам."
            />
          </Grid>
          {/* Как использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Как использовать"
              content="Нажмите кнопку 'LOAD', чтобы активировать режим. Установите целевую нагрузку (в кг или фунтах). Когда вы достигнете её, устройство начнёт пищать раз в секунду."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Когда применять"
              content="Тренировки по классическим методам.
  Сеты и повторения.
  Программы, где важен контроль за весом."
            />
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
};
