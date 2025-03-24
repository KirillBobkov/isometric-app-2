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
import { InfoCard } from '../../InfoCard';

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
              <InfoCard>
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
                  Солдатская мощь — это архетипическая программа чистой силы. Она
                  сокращена, сосредоточиваясь только на двух упражнениях, но это
                  позволяет спортсмену вложить все свои ресурсы в эти упражнения,
                  как в плане тренировки, так и адаптации. Максимальные уровни
                  силы также развивают "навык силы" и усиленную дисциплину.
                  Поскольку общее время удержания низкое — всего 10 секунд на
                  тренировку — этот метод менее эффективен для наращивания
                  мышечной массы по сравнению с другими программами в этой главе.
                  Милитари Пауэр будет отлично работать для спортсмена, который
                  хочет построить превосходную силу, но с минимальным добавлением
                  мышечной массы. Изометрические упражнения легче
                  восстанавливаются, поэтому они также хорошо подойдут в качестве
                  силовой программы, выполняемой в сочетании с традиционными
                  бодибилдинг программами.
                </Typography>
              </InfoCard>
            </Grid>

            {/* Особенности программы */}
            <Grid item xs={12} md={6}>
              <InfoCard>
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
              </InfoCard>
            </Grid>

            {/* Как выполнять */}
            <Grid item xs={12} md={6}>
              <InfoCard>
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
                    2. Используйте общую разминку для повышения температуры тела (глава 11), а также специфическую разминку перед каждым упражнением (страницы 294-295). 
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    3. По готовности нажмите кнопку Начать тренировку, после чего следуйте инструкциям. Выполняйте каждое упражнение с максимальными усилиями. 
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    4. Плавно создавайте напряжение до максимума, поднимая ручку насколько возможно. Удерживайте это усилие около одной секунды, прежде чем расслабиться. 
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    5. Запись показателей для одного подхода длится 10 секунд, почле чего вы можете сделать перерыв 1 минуту. Отдыхайте одну минуту между повторениями, дышите плавно и расслабляйте мышцы. 
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    6. Повторяйте шаги 3-5 для всех повторений. По завершении сессии выполните охлаждение (глава 14).
                  </Typography>
                </Box>
              </InfoCard>
            </Grid>

            {/* Техника выполнения */}
            <Grid item xs={12} md={6}>
              <InfoCard>
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
                    • Меняйте положение рукоятки между тренировками
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Обеспечьте разницу в углах не менее 20 градусов от предыдущей тренировки
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Записывайте максимальную нагрузку после каждого повторения
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Следите за плавностью наращивания усилия
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Используйте глубокое дыхание между подходами
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • Завершайте тренировку заминкой
                  </Typography>
                </Box>
              </InfoCard>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </>
  );
} 