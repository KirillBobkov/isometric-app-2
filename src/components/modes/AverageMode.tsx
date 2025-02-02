// components/tabs/TrainingProgramsTab.tsx
import { Grid, Typography } from "@mui/material";
import React from "react";
import { Container } from "@mui/material";
import InfoCard from "../InfoCard"; // Импортируем наш новый компонентexport 

export const AverageMode = () => {
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
          Режим среднего значения (Average mode)
        </Typography>
        {/* Блоки с информацией */}
        <Grid container spacing={4}>
          {/* Что делает */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Что делает"
              content="Показывает среднюю силу, которую вы приложили за время выполнения упражнения."
            />
          </Grid>
          {/* Зачем использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Зачем использовать"
              content="Среднезначение режим идеально подходит для тех, кто хочет выполнять долгие упражнения, где сила может снижаться со временем."
            />
          </Grid>
          {/* Как использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Как использовать"
              content="Выполните упражнение в любом режиме. После завершения нажмите кнопку 'AVG'. На экране появится среднее значение."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Когда применять"
              content="Тренировки без строгих временных рамок.
  Техники бодибилдинга, связанные с длительным временем под нагрузкой (TUT).
  Тренировки до отказа."
            />
          </Grid>
        </Grid>
      </Container>
    );
  };