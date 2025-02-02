// components/tabs/TrainingProgramsTab.tsx
import { Grid, Typography } from "@mui/material";
import React from "react";
import { Container } from "@mui/material";
import InfoCard from "../InfoCard"; // Импортируем наш новый компонентexport 

export const TimedMode = () => {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Главный заголовок */}
        <Typography
          variant="h3"
          component="h1"
          align="center"
          sx={{ p: 2, mb: 3, fontWeight: "bold", textTransform: "uppercase" }}
          gutterBottom
        >
          Режим времени (Timed mode)
        </Typography>
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
      </Container>
    );
  };