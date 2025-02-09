import React, { useState } from "react";
import { Grid, Collapse, Typography, Button } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function PrometheanMarkII() {
    // Состояние для управления видимостью блока
    const [isContentVisible, setIsContentVisible] = useState(false);

    // Функция для переключения видимости блока и текста кнопки
    const toggleContentVisibility = () => {
      setIsContentVisible((prevState) => !prevState);
    };

  return (
    <Collapse in={isContentVisible} timeout="auto">
              {/* Главный заголовок */}
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ p: "1 2", fontWeight: "bold", textTransform: "uppercase" }}
        gutterBottom
      >
        Прометей ("The Promethean")
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
      <Grid container spacing={4} mb={8}>
        {/* О программе */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="О программе"
            content="'The Promethean Mark II' — это расширенная версия базовой программы Promethean, использующая метод двойного прогресса в режиме Timed Mode. Программа разделена на две последовательные тренировочные сессии с днём отдыха на третий день. Идеально подходит для продвинутых атлетов и спортсменов, которым требуется больше времени на восстановление."
          />
        </Grid>
        {/* Особенности программы */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Особенности программы"
            content="• Те же длительности повторений и принципы прогрессии, что и в базовой версии
• Добавлены новые упражнения для нижней части тела, тяги и толчка
• Увеличенное общее время тренировок
• Больше времени на восстановление между повторением упражнений
• Подходит для атлетов с высокими рабочими весами"
          />
        </Grid>
        {/* Как выполнять */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Протокол тренировки"
            content="1. Общая разминка для повышения температуры тела
2. Специальная разминка перед каждым упражнением
3. Активация Timed Mode, установка Целевой Нагрузки (новичкам 50% от максимума)
4. Удержание нагрузки 6 секунд при достижении целевого веса
5. Отдых 20 секунд между повторениями
6. Цель: 6 повторений по 6 секунд на каждое упражнение"
          />
        </Grid>
        {/* Прогрессия */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Прогрессия и запись"
            content="• Записывайте в журнал тренировок Целевую Нагрузку, количество повторений и их длительность
• При успешном выполнении всех 6 повторений по 6 секунд увеличьте Целевую Нагрузку на 5-10 фунтов
• Завершайте каждую сессию заминкой
• Соблюдайте день отдыха после двух тренировочных дней"
          />
        </Grid>
      </Grid>
    </Collapse>
  );
}
