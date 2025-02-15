import React, { useState } from "react";
import { Grid, Collapse, Container, Button, Typography } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function BurnCount() {
    // Состояние для управления видимостью блока
    const [isContentVisible, setIsContentVisible] = useState(false);

    // Функция для переключения видимости блока и текста кнопки
    const toggleContentVisibility = () => {
      setIsContentVisible((prevState) => !prevState);
    };

    
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 1 } }}> 

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
          <InfoCard>
            <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
              О программе
            </Typography>
            <Typography variant="body2" color="text.secondary">
              'The Burn Count' — это программа, основанная на методе прогрессивного увеличения времени удержания фиксированной нагрузки. Использует режим Load Mode для точного контроля веса. Программа эффективна как для развития силы, так и для наращивания мышечной массы благодаря длительным удержаниям под высокой нагрузкой.
            </Typography>
          </InfoCard>
        </Grid>
        {/* Особенности программы */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
              Ключевые особенности
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Использует режим Load Mode вместо Timed Mode
              • Фокус на длительных удержаниях (целевое время 45 секунд)
              • Небольшое количество повторений из-за высокой интенсивности
              • Длительный отдых между подходами (1 минута)
              • Подходит для развития как силы, так и мышечной массы
            </Typography>
          </InfoCard>
        </Grid>
        {/* Как выполнять */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
              Протокол тренировки
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Начните с общей разминки для повышения температуры тела
              2. Выполните специальную разминку перед каждым упражнением
              3. Активируйте Load Mode и установите Целевую Нагрузку
              4. Наращивайте усилие до достижения Целевой Нагрузки
              5. Удерживайте нагрузку, начиная с 20 секунд
              6. Отдыхайте 1 минуту между повторениями
            </Typography>
          </InfoCard>
        </Grid>
        {/* Прогрессия */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
              Прогрессия и запись
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Записывайте в журнал Целевую Нагрузку и длительность каждого удержания
              • При достижении 45 секунд удержания в обоих повторениях увеличьте вес на 5-10 фунтов
              • Начните новый цикл с более коротких удержаний на повышенном весе
              • Следите за техникой выполнения, особенно при длительных удержаниях
              • Завершайте тренировку заминкой
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
    </Collapse>
    </Container>
  );
}
