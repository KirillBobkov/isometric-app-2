import { useState } from "react";
import { Grid, Collapse, Typography, Container, Button } from "@mui/material";
import { InfoCard } from "../InfoCard";

export function IronMan() {
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
                О программе
              </Typography>
              <Typography variant="body2" color="text.secondary">
                'Iron Man' — это интенсивная программа, направленная на развитие мышечной выносливости и работоспособности. Программа построена на двух сериях упражнений: первая серия выполняется 120 секунд, вторая — 60 секунд. В отличие от силовых тренировок, тренировки на выносливость можно выполнять чаще, постепенно уменьшая количество дней отдыха при хорошем восстановлении.
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
                • Использует режим Average Mode
                • Две серии упражнений разной длительности
                • Интенсивность: 20-40% от вашего 1-повторного максимума
                • Длительные удержания: 60 и 120 секунд
                • Отдых между подходами: 1 минута
                • Возможность постепенного увеличения частоты тренировок
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
                1. Выполните общую разминку для повышения температуры тела
                2. Специальная разминка перед упражнениями необязательна
                3. Активируйте режим Feedback Mode
                4. Поддерживайте усилие на уровне 20-40% от максимума
                5. Следите за временем удержания (60 или 120 секунд)
                6. После каждого подхода нажимайте кнопку AVG
                7. Записывайте время и среднюю нагрузку
              </Typography>
            </InfoCard>
          </Grid>
          {/* Прогрессия */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <Typography variant="h5" align="center" sx={{ p: 2, mb: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                Прогрессия и адаптация
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Не требуется намеренно увеличивать нагрузку или время
                • Средняя нагрузка будет расти автоматически с ростом выносливости
                • Отслеживайте качество восстановления
                • При отсутствии усталости и боли можно уменьшать дни отдыха
                • Прогрессируйте постепенно в частоте тренировок
                • Завершайте каждую тренировку заминкой
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Collapse>
    </Container>
  );
}
