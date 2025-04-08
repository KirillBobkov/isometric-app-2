import { useState } from "react";
import { 
  Button, 
  Collapse, 
  Typography, 
  Box,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from "@mui/material";
import { Card } from "@mui/material";

export function IronManDescription() {
  const [isContentVisible, setIsContentVisible] = useState(false);

  const toggleContentVisibility = () => setIsContentVisible((prev) => !prev);

  return (
    <>
      <Button
        variant="text"
        color="inherit"
        onClick={toggleContentVisibility}
        sx={{
          display: "block",
          m: "0 auto",
          opacity: 0.5,
          mb: 3,
          borderRadius: "50",
          backgroundColor: "transparent",
          border: "none",
          justifyContent: "space-between",
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        {isContentVisible ? "Скрыть описание" : "Показать описание"}
      </Button>

      <Collapse in={isContentVisible} timeout="auto">
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={4} mb={8}>
            {/* О программе */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, p: 4 }}  >
                <Typography
                  variant="h5"
                  align="center"
                  sx={{
                    p: 2,
                    mb: 1,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  О программе
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Железный человек — это болезненный, но эффективный способ увеличения 
                  мышечной выносливости и работоспособности. Программа основана на двух 
                  сериях упражнений; одна серия выполняется в течение 120 секунд, а вторая — 
                  вдвое меньше времени. Тренировка выносливости может быть более эффективной 
                  при более высокой частоте тренировок по сравнению с силовыми или гипертрофическими 
                  нагрузками. Те, кто может выполнять эту программу и быстро восстанавливаться 
                  (без истощения, без боли в мышцах), могут постепенно экспериментировать с 
                  исключением дней отдыха.
                </Typography>
              </Card>
            </Grid>

            {/* Тренировочный план */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, p: 4 }}    >
                <Typography
                  variant="h5"
                  align="center"
                  sx={{
                    p: 2,
                    mb: 1,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Тренировочный план
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>День</TableCell>
                        <TableCell>Упражнение</TableCell>
                        <TableCell>Подходы</TableCell>
                        <TableCell>Длительность</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell rowSpan={3}>1</TableCell>
                        <TableCell>Подъем штанги с пола</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>120 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Голландцы</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>120 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Пресс от груди</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>120 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} align="center">Отдых</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell rowSpan={3}>2</TableCell>
                        <TableCell>Фронтальные выпады</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>60 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Подъемы на носки</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>60 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Гантельная тяга в наклоне</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>60 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} align="center">Отдых</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Протокол тренировки */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, p: 4 }}      >
                <Typography
                  variant="h5"
                  align="center"
                  sx={{
                    p: 2,
                    mb: 1,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Протокол тренировки
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    1. Убедитесь что тренажер подключен, и вы видите на графике изменение веса. 
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    2. Используйте общую разминку для повышения температуры тела (глава 11). Для каждого упражнения специальная разминка может не потребоваться.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    3. По готовности нажмите кнопку Начать тренировку, после чего следуйте инструкциям.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    4. Во время каждого повтора стремитесь к напряжению около 40–20% от вашего максимального веса на одно повторение в течение 60 или 120 секунд (в зависимости от упражнения).
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    5. Следите за часами или цифровым таймером и держите позу на протяжении 60–120 секунд (в зависимости от упражнения).
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    6. После каждого повтора система покажет среднюю нагрузку.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    7. Отдыхайте одну минуту между повторами, дышите ровно и расслабляйте мышцы.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    8. По завершении тренировки выполните охлаждение (глава 14).
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Важные нюансы */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, p: 4 }}>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{
                    p: 2,
                    mb: 1,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Важные нюансы
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    • По мере увеличения вашей работоспособности средняя нагрузка автоматически возрастет
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • В этом протоколе вам не нужно намеренно увеличивать какие-либо переменные — нагрузку, продолжительность повторов и т.д.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Записывайте среднюю нагрузку после каждого повторения
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Следите за стабильностью нагрузки в течение упражнения
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Используйте глубокое дыхание между подходами
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Те, кто быстро восстанавливается, могут экспериментировать с исключением дней отдыха
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </>
  );
} 