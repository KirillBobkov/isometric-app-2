import { Grid, Collapse, Button } from "@mui/material";
import { Container } from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { InfoCard } from "../InfoCard";
import { Card, CardContent, Typography } from "@mui/material";
import { formatTime } from "../../utils/formatTime";

export const Feedback = memo(({ message, connected }: any) => {


  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Функция для переключения видимости блока и текста кнопки
  const toggleContentVisibility = () => {
    setIsContentVisible((prevState) => !prevState);
  };



  // Обновляем данные для первого графика

  useEffect(() => {
    // Обновляем данные для второго графика (например, удвоенное значение)
    setChartData((prev) => [
      ...prev, // Ограничиваем количество точек до 10
      { time: formatTime(currentTime * 1000), message },
    ]);
  }, [currentTime]);

  // Преобразование данных для MUI X Charts
  const xAxisData = chartData.map((item) => item.time); // Метки времени для оси X
  const yAxisData = chartData.map((item) => item.message); // Значения для оси Y

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
        Режим обратной связи (Feedback mode)
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
        <Grid container spacing={4} mb={8}>
          {/* Что делает */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Что делает"
              content="Показывает изменяющуюся силу, которую вы прикладываете к ручке Isochain, прямо во время выполнения упражнения. На экране отображается уровень силы (как вес), который постоянно меняется в зависимости от того, как сильно вы толкаете или тянете штангу."
            />
          </Grid>
          {/* Зачем использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Зачем использовать"
              content="Режим обратной связи позволяет вам видеть, сколько усилий вы прилагаете в любой момент времени. Это помогает понять, как работает ваше тело в реальном времени и оптимизировать ваши тренировки."
            />
          </Grid>
          {/* Как использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Как использовать"
              content="Этот режим автоматически активируется при включении устройства. Используйте его для разминки перед тренировкой, калибровки техники выполнения упражнений и экспериментов с различными хватами и стойками."
            />
          </Grid>
          {/* Когда применять */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Когда применять"
              content="Разминка перед тренировкой.
Калибровка техники выполнения упражнений.
Эксперименты с различными хватами и стойками.
Режим обратной связи помогает понять, как работает ваше тело в реальном времени. Например, если вы хотите проверить, какой хват лучше всего подходит для конкретного упражнения, этот режим покажет точные цифры. Он также отлично подходит для разминки перед серьёзными нагрузками."
            />
          </Grid>
        </Grid>
      </Collapse>

    </Container>
  );
});
