// components/tabs/TrainingProgramsTab.tsx
import { Grid, Typography } from "@mui/material";
import React from "react";
import { Container } from "@mui/material";
import InfoCard from "../InfoCard"; // Импортируем наш новый компонентexport 

export const MaxMode = () => {
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
          Максимальный режим (Max mode)
        </Typography>
        {/* Блоки с информацией */}
        <Grid container spacing={4}>
          {/* Что делает */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Что делает"
              content="Показывает самую высокую силу, которую вы смогли приложить за время выполнения упражнения."
            />
          </Grid>
          {/* Зачем использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Зачем использовать"
              content="Максимальный режим помогает узнать свой личный рекорд в любом упражнении. Это мотивирует и помогает отслеживать прогресс."
            />
          </Grid>
          {/* Как использовать */}
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Как использовать"
              content="Выполните упражнение в любом режиме. После завершения нажмите кнопку 'MAX'. На экране появится ваш максимум."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Когда применять"
              content="Тестирование личных рекордов.
  Определение максимума на одно повторение.
  Конкурсы между спортсменами."
            />
          </Grid>
        </Grid>
      </Container>
    );
  };