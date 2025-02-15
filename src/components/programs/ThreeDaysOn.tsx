import { useState } from "react";
import { Grid, Collapse, Typography, Button, Container } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function ThreeDaysOn() {
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
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                О программе
              </Typography>
              <Typography variant="body2" color="text.secondary">
                '3 Days On' — это изометрический вариант классического бодибилдинг-сплита. Программа охватывает все тело: верхняя часть тела в День 1 и 3, нижняя часть тела в День 2. Высокоинтенсивная тренировка с доведением мышц до отказа в течение 20-45 секунд, что соответствует времени истощения АТФ-КФ системы, crucial для роста мышц.
              </Typography>
            </InfoCard>
          </Grid>
          {/* Структура программы */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Структура тренировок
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • День 1: Верхняя часть тела
                • День 2: Нижняя часть тела
                • День 3: Верхняя часть тела
                • Режим: Average Mode
                • Длительность подходов: 20-45 секунд до отказа
                • Отдых между подходами: 20-30 секунд
                • Рекомендуется чередовать с программами, использующими фиксированные нагрузки
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
                3. Активируйте режим Feedback Mode
                4. Поддерживайте максимальное усилие до мышечного отказа
                5. Нажимайте кнопку AVG после каждого подхода
                6. Отдыхайте 20-30 секунд между подходами
                7. Записывайте время удержания и среднюю нагрузку
              </Typography>
            </InfoCard>
          </Grid>
          {/* Особенности выполнения */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Важные нюансы
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Не требуется намеренно увеличивать нагрузку или время — прогресс происходит автоматически
                • При сложностях с восстановлением добавьте дни отдыха
                • Возможно выполнение по схеме ПН-СР-ПТ
                • Следите за ощущениями в мышцах
                • Средняя нагрузка будет расти по мере увеличения мышечной выносливости
                • Завершайте каждую тренировку заминкой
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
}
