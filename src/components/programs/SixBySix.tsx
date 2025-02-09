import React, { useState } from "react";
import { Grid, Collapse, Container, Typography, Button } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function SixBySix() {
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
      <Collapse in={isContentVisible} timeout="auto">
        <Grid container spacing={4} mb={8}>
          {/* О программе */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="О программе"
              content="'6 x 6' — это программа, похожая на The Promethean, но с особым акцентом на идеальное сочетание длительности (6 секунд) и количества повторений (6). Программа использует немного сниженную интенсивность для поддержания этих идеальных показателей. Отлично подходит для общего развития силы на любом уровне подготовки."
            />
          </Grid>
          {/* Особенности программы */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Ключевые особенности"
              content="• Фиксированное количество повторений: 6
• Фиксированная длительность удержания: 6 секунд
• Целевая нагрузка: 70% от вашего 1-повторного максимума
• Сниженная интенсивность для поддержания идеальной техники
• Регулярное тестирование максимума каждые 2-4 недели"
            />
          </Grid>
          {/* Как выполнять */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Протокол тренировки"
              content="1. Начните с общей разминки для повышения температуры тела
2. Выполните специальную разминку перед каждым упражнением
3. Активируйте Timed Mode и установите Целевую Нагрузку (70% от максимума)
4. Наращивайте усилие до достижения Целевой Нагрузки
5. Удерживайте нагрузку 6 секунд
6. Отдыхайте 20 секунд между повторениями"
            />
          </Grid>
          {/* Прогрессия */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Прогрессия и корректировка"
              content="• Записывайте в журнал Целевую Нагрузку, количество повторений и их длительность
• Если не удается выполнить все 6 повторений по 6 секунд, уменьшите Целевую Нагрузку на 10%
• Каждые 2-4 недели проводите повторное тестирование максимума
• Корректируйте целевой вес в соответствии с новым максимумом
• Завершайте тренировку заминкой"
            />
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
}
