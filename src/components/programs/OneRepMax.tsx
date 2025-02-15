import React, { useState } from "react";
import { Grid, Collapse, Button, Typography, Container } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function OneRepMax() {
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
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                О протоколе тестирования
              </Typography>
              <Typography variant="body2" color="text.secondary">
                'One-Rep Max' — это не тренировочный метод, а протокол тестирования максимального произвольного сокращения (MVC). Используется для определения максимальной силы, необходимой для расчета рабочих весов в других программах, а также для отслеживания прогресса. Тест выполняется в режиме Max Mode и дает надежные данные о ваших силовых показателях.
              </Typography>
            </InfoCard>
          </Grid>
          {/* Применение */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Когда использовать
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Для определения процентных показателей в программах типа '6 x 6'
                • Периодическое тестирование прогресса в базовых упражнениях
                • Оценка абсолютных силовых показателей
                • Установка начальных параметров для новых программ
                • Объективная оценка результатов тренировок
              </Typography>
            </InfoCard>
          </Grid>
          {/* Как выполнять */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Протокол тестирования
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Выполните общую разминку для повышения температуры тела
                2. Активируйте режим Feedback Mode
                3. Выполните три разминочных подхода с нарастающей интенсивностью:
                    • Легкий (лёгкое напряжение мышц)
                    • Средний (ощутимое жжение в мышцах)
                    • Интенсивный (около 75% от максимума)
                4. Отдых 30 секунд между разминочными подходами
              </Typography>
            </InfoCard>
          </Grid>
          {/* Тестирование */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Выполнение теста
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Выполните три максимальных попытки
                • Отдых 1 минута между максимальными попытками
                • После каждой попытки нажмите кнопку MAX
                • Запишите показатели каждой попытки
                • Сложите три максимальных результата и разделите на 3
                • Полученное число является вашим 1-повторным максимумом
                • Завершите тестирование заминкой
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
}
