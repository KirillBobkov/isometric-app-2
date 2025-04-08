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

export function MilitaryPowerDescription() {
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
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={4} mb={8}>
            {/* О программе */}
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
                  О программе
                </Typography>
                <Typography style={{ whiteSpace: 'pre-line' }} variant="body2" color="text.secondary">
                  {`Солдатская мощь — это программа тренировки, направленная на развитие максимальной силы 
                  с помощью изометрических упражнений. 
                  
                  Программа работает с двумя основными упражнениями: 
                  становая тяга и жим плеч. 
                  
                  Во время тренировки вы выполняете 10 подходов каждого упражнения, 
                  с измерением и записью вашего максимального усилия. 
                  
                  Приложение в реальном времени 
                  показывает ваш прогресс, создает графики ваших усилий и позволяет сохранять результаты 
                  тренировок для последующего анализа.`}
                </Typography>
              </Card>
            </Grid>

            {/* Особенности программы */}
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
                        <TableCell>1</TableCell>
                        <TableCell>Становая тяга</TableCell>
                        <TableCell>10x1</TableCell>
                        <TableCell>1 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>Жим плеч</TableCell>
                        <TableCell>10x1</TableCell>
                        <TableCell>1 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>Становая тяга*</TableCell>
                        <TableCell>10x1</TableCell>
                        <TableCell>1 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>Жим плеч*</TableCell>
                        <TableCell>10x1</TableCell>
                        <TableCell>1 сек</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>5</TableCell>
                        <TableCell>Отдых</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>6</TableCell>
                        <TableCell>Отдых</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1, ml: 1 }}
                >
                  * выполняется под другим углом
                </Typography>
              </Card>
            </Grid>

            {/* Как выполнять */}
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
                  Как работать с приложением
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    1. Подключите тренажер и убедитесь, что на графике в разделе "Реалтайм показания" отображаются данные.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    2. Выберите упражнение из выпадающего списка (Становая тяга или Жим плеч).
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    3. Нажмите "Начать тренировку". Система даст вам 10 секунд на подготовку, затем начнется первый подход.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    4. Выполните подход с максимальным усилием в течение 6 секунд - система автоматически записывает все данные.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    5. После каждого подхода следует отдых 60 секунд. Всего выполняется 10 подходов.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    6. После завершения тренировки вы можете сохранить результаты в файл или сгенерировать текстовый отчет для анализа.
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Техника выполнения */}
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
                  Работа с данными
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Переключение вкладок позволяет видеть либо текущие показания в реальном времени, либо данные тренировки
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • График показывает силовые показатели для каждого подхода с возможностью выбора конкретного подхода
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Вы можете сохранить тренировку в формате JSON для последующего анализа
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Функция "Скачать текстовый отчет" создает детальный анализ тренировки с максимальными и средними значениями для каждого подхода
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Ранее сохраненные тренировки можно загрузить через кнопку "Восстановить тренировку"
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • В карточках справа от графика отображаются максимальные показатели для текущего подхода и всей тренировки
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