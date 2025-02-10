import { useState } from "react";
import { Grid, Collapse, Button, Container, Typography } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function MilitaryPower() {
  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Функция для переключения видимости блока и текста кнопки
  const toggleContentVisibility = () => {
    setIsContentVisible((prevState) => !prevState);
  };

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      {/* Главный заголовок */}
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ p: "1 2", fontWeight: "bold", textTransform: "uppercase" }}
        gutterBottom
      >
        Солдатская мощь (Military Power)
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
              content="'Military Power' — это архетипичная программа чистой силы. Сфокусирована всего на двух упражнениях, что позволяет направить все ресурсы на их развитие. Программа развивает не только максимальную силу, но и 'силовое мастерство' вместе с дисциплиной. Идеально подходит для атлетов, стремящихся к развитию силы с минимальным набором мышечной массы."
            />
          </Grid>
          {/* Особенности программы */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Ключевые особенности"
              content="• Фокус только на двух упражнениях
• Использует режим Feedback Mode
• Короткие удержания (около 1 секунды)
• Общее время под нагрузкой всего 10 секунд за тренировку
• Варьирование углов в упражнениях между тренировками
• Отлично сочетается с традиционными программами бодибилдинга"
            />
          </Grid>
          {/* Как выполнять */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Протокол тренировки"
              content="1. Начните с общей разминки для повышения температуры тела
2. Выполните специальную разминку перед каждым упражнением
3. Активируйте режим Feedback Mode
4. Плавно наращивайте усилие до максимума
5. Удерживайте максимальное усилие около 1 секунды
6. После каждого повторения нажимайте кнопку MAX
7. Отдыхайте 1 минуту между повторениями"
            />
          </Grid>
          {/* Техника выполнения */}
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Важные нюансы"
              content="• Меняйте положение рукоятки между тренировками
• Обеспечьте разницу в углах не менее 20 градусов от предыдущей тренировки
• Записывайте максимальную нагрузку после каждого повторения
• Следите за плавностью наращивания усилия
• Используйте глубокое дыхание между подходами
• Завершайте тренировку заминкой"
            />
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
}
