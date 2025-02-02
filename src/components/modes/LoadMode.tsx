// components/tabs/TrainingProgramsTab.tsx
import { Grid, Typography } from "@mui/material";
import React from "react";
import { Container } from "@mui/material";
import InfoCard from "../InfoCard"; // Импортируем наш новый компонентexport 


export const LoadMode = () => {
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
          Режим нагрузки (Load mode)
        </Typography>
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
      </Container>
    );
  };