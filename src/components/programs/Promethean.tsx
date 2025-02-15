import { Grid, Collapse, Button } from "@mui/material";
import { Container } from "@mui/material";
import { memo, useState } from "react";
import { InfoCard } from "../InfoCard";
import { Typography } from "@mui/material";

export const Promethean = memo(() => {
  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(true);

  // Функция для переключения видимости блока и текста кнопки
  const toggleContentVisibility = () => {
    setIsContentVisible((prevState) => !prevState);
  };

  // Обновляем данные для первого графика

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
        {isContentVisible ? "Скрыть программу The Promethean" : "Показать программу The Promethean"}
      </Button>

      {/* Плавное скрытие/показывание блока */}
      <Collapse in={isContentVisible} timeout="auto">
        <Grid container spacing={4} mb={8}>
          {/* Описание программы */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                О программе
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Прометей — это базовая программа тренировок, направленная на общее развитие силы и выносливости. Использует метод двойного прогресса в сочетании с режимом Timed Mode. Программа считается одной из самых эффективных для развития силы и мышечной массы, основанная на научно обоснованном подходе к тренировкам.
              </Typography>
            </InfoCard>
          </Grid>
          {/* Ключевые упражнения */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Ключевые упражнения
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Программа фокусируется на трех базовых упражнениях:
                • Deadlift (поднятие) — развивает силу нижней части тела и спины
                • Curl (удержание) — укрепляет бицепс и предплечья
                • Press (толчок) — работает на верхнюю часть тела, плечи и грудь
              </Typography>
            </InfoCard>
          </Grid>
          {/* Как выполнять */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Как выполнять
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Разминка: общая и специальная перед каждым упражнением
                2. Настройка: активируйте Timed Mode, установите Целевую Нагрузку (новичкам 50% от максимума)
                3. Выполнение: удерживайте нагрузку 6 секунд
                4. Отдых: 20 секунд между повторениями
                5. Цикл: стремитесь к 6 повторениям по 6 секунд
                6. Запись результатов в журнал
              </Typography>
            </InfoCard>
          </Grid>
          {/* Прогрессия */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Прогрессия
              </Typography>
              <Typography variant="body2" color="text.secondary">
                При успешном выполнении всех 6 повторений по 6 секунд, увеличьте Целевую Нагрузку на 5-10 фунтов для следующей тренировки. Программа сочетает точность изометрических тренировок с методами прогрессии, что делает ее идеальной для равномерного развития силы и выносливости.
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
});
