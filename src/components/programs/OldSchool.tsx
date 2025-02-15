import { useState } from "react";
import { Grid, Collapse, Typography, Container, Button } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function OldSchool() {
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
      {isContentVisible ? "Скрыть программу" : "Показать программу"}
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
              'Old School' — это изометрическая программа, построенная по классическому принципу подходов и повторений вместо длительных удержаний. Программа включает 3 упражнения за тренировку, каждое выполняется в 4 подходах по 10 повторений с коротким (1 секунда) удержанием. Идеально подходит для атлетов, привыкших к традиционным методам тренировок в зале.
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
              • Классическая схема: 4 подхода по 10 повторений
              • Короткие удержания около 1 секунды
              • Использует режим Load Mode
              • Отдых 30 секунд между подходами
              • Интуитивная прогрессия нагрузки
              • Отлично подходит как смена темпа после программ с длительными удержаниями
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
              4. Достигните Целевой Нагрузки, удерживайте 1 секунду
              5. Расслабьтесь и сразу повторите
              6. Стремитесь к 10 повторений в подходе
              7. Отдыхайте 30 секунд между подходами
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
              • Записывайте в журнал Целевую Нагрузку, количество подходов и повторений
              • Отмечайте субъективную сложность тренировки
              • Увеличивайте вес на 2-10 фунтов, когда чувствуете готовность
              • Прогрессия основана на интуитивном подходе
              • Увеличивайте нагрузку только при уверенном выполнении 4х10
              • Завершайте тренировку заминкой
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
    </Collapse>
    </Container>
  );
}
