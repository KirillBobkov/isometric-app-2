import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; 
import {
  Grid,
  Collapse,
  Button,
  Container,
  Typography,
  CardContent,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { InfoCard } from "../InfoCard";
import { LineChart } from "@mui/x-charts";
import { formatTime } from "../../utils/formatTime";
import { ArrowLeftIcon, Play, Square } from 'lucide-react';
import { THROTTLE_TIME } from "../../services/BluetoothService";  
import { motion } from 'framer-motion';
import { saveTrainingData } from "../../services/FileService";

interface SetData {
  time: number;
  weight: number;
}

interface SetDataPoint {
  time: number;
  weight: number;
}

const REST_TIME = 60000;
const SET_TIME = 10000;

// Добавьте эти константы
const CIRCLE_SIZE = 200; // Размер круга
const CIRCLE_CENTER = CIRCLE_SIZE / 2;
const CIRCLE_RADIUS = 90; // Радиус круга
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Функция для расчета процента оставшегося времени
const calculateProgress = (currentTime: number, totalTime: number) => {
  // Убедимся, что значения не выходят за пределы
  const safeCurrentTime = Math.max(0, Math.min(currentTime, totalTime));
  const progress = 1 - (safeCurrentTime / totalTime);
  return CIRCLE_CIRCUMFERENCE * progress;
};

// Add this custom hook before the MilitaryPower component
const useTimer = (initialValue: number = 0) => {
  const [time, setTime] = useState(initialValue);
  const intervalRef = useRef<any>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1000);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    setTime(0);
  }, []);

  return { time, reset };
};

export function MilitaryPower({ connected, message }: any) {
  const navigate = useNavigate(); // Получаем объект history

  const handleBack = () => {
    navigate('/');  // Перенаправляем на главную страницу
  };

  const { time: currentTime, reset: resetCurrentTime } = useTimer();

  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  const [waitingForStart, setWaitingForStart] = useState(false); // Состояние для отсчета времени

  const [currentSet, setCurrentSet] = useState(1);

  const [chartData, setChartData] = useState<Record<number, SetDataPoint[]>>({});
  const [currentData, setCurrentData] = useState<SetData[]>([]);

  const [selectedSet, setSelectedSet] = useState<number>(1);
 
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(REST_TIME);
  const [setTime, setSetTime] = useState(SET_TIME);
    // Функция для переключения видимости блока и текста кнопки
    const toggleContentVisibility = () => {
      setIsContentVisible((prevState) => !prevState);
    };

  // Заменяем useEffect для currentTime и currentData на один эффект
  useEffect(() => {
    if (!connected) {
      resetCurrentTime();
      setCurrentData([]);
      return;
    }

    if (!isTrainingActive) {
      setCurrentData(prev => {
        const newData = [...prev, {
          time: currentTime,
          weight: parseFloat(message),
        }];
        return newData;
      });
    }
// игнорим месседж, опираемся на время
  }, [currentTime, isTrainingActive, resetCurrentTime]);

  // Эффект для обновления данных графика
  useEffect(() => {
    if (!isTrainingActive || !connected) return;

    if (isResting) {
      return;
    }

    setChartData(prev => {
      const currentSetData = prev[currentSet] || [];
      const newSetData = [...currentSetData, {
        time: currentTime,
        weight: parseFloat(message)
      }]

      return {
        ...prev,
        [currentSet]: newSetData
      };
    });
    // игнорим месседж, опираемся на время
  }, [currentTime, isTrainingActive, isResting, connected, currentSet]);


  // Эффект для отслеживания времени подхода
  useEffect(() => {
    if (!isTrainingActive || !connected) return;

    const totalTimePerSet = SET_TIME + REST_TIME;
    const currentSetNumber = Math.floor(currentTime / totalTimePerSet) + 1;
    const timeWithinSet = currentTime % totalTimePerSet;
    
    // Обновляем номер текущего подхода
    if (currentSetNumber !== currentSet && currentSetNumber <= 10) {
      setCurrentSet(currentSetNumber);
      setSelectedSet(currentSetNumber);
    }

    // Проверяем, закончилась ли тренировка
    if (currentSetNumber > 10) {
      setIsTrainingActive(false);
      return;
    }

    // Определяем, в какой фазе находимся (подход или отдых)
    const isInRestPhase = timeWithinSet >= SET_TIME;
    setIsResting(isInRestPhase);

    // Обновляем оставшееся время для текущей фазы
    if (isInRestPhase) {
      setRestTime(totalTimePerSet - timeWithinSet);
    } else {
      setSetTime(SET_TIME - timeWithinSet);
    }
  }, [currentTime, isTrainingActive, connected, currentSet]);

  // Добавляем функцию для сохранения данных тренировки
  const saveTraining = async () => {
    if (Object.keys(chartData).length === 0) return;

    const maxWeightPerSet = Object.entries(chartData).reduce((acc, [set, data]) => {
      acc[Number(set)] = data.reduce((max, point) => Math.max(max, point.weight), 0);
      return acc;
    }, {} as Record<number, number>);

    const trainingData = {
      date: new Date().toISOString().split('T')[0],
      duration: currentTime,
      sets: chartData,
      maxWeight: getMaxWeight(),
      maxWeightPerSet
    };

    const saved = await saveTrainingData(trainingData);
    if (saved) {
      // Можно добавить уведомление об успешном сохранении
      console.log('Данные тренировки успешно сохранены');
    } else {
      console.error('Ошибка при сохранении данных тренировки');
    }
  };

  // Обновляем handleTrainingToggle
  const handleTrainingToggle = () => {
    if (!connected) {
      alert('Пожалуйста, подключите тренажер перед началом тренировки');
      return;
    }
    
    if (!isTrainingActive) {
      resetCurrentTime();
      setCurrentSet(1);
      setChartData({}); 
      setCurrentData([]);
      setSetTime(SET_TIME);
      setRestTime(REST_TIME);
      setIsResting(false);
      setSelectedSet(1);
    } else {
      // Сохраняем данные при остановке тренировки
      saveTraining();
      resetCurrentTime();
    }
 
    setIsTrainingActive(!isTrainingActive);
  };

  // Добавляем эффект для сохранения при завершении всех подходов
  useEffect(() => {
    if (currentSet === 10 && isTrainingActive) {
      saveTraining();
    }
  }, [currentSet, isTrainingActive]);

  // Определяем данные для отображения на графике
  const getChartData = () => {
    if (!isTrainingActive) {
      // Если тренировка не активна, показываем текущие данные
      const limitedCurrentData = currentData.slice(-50);
      return {
        xAxis: limitedCurrentData.map(data => data.time),
        yAxis: limitedCurrentData.map(data => data.weight),
        title: 'Текущие показания'
      };
    }
    
    // Если тренировка активна, показываем данные выбранного подхода
    const selectedSetData = chartData[selectedSet] || [];
    return {
      xAxis: selectedSetData.map(data => data.time),
      yAxis: selectedSetData.map(data => data.weight),
      title: `Подход ${selectedSet}`
    };
  };

  const { xAxis, yAxis, title } = getChartData();

  // Функция для получения максимального веса
  const getMaxWeight = () => {
    if (!isTrainingActive) return 0;
    
    return Object.values(chartData)
      .flat()
      .reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Функция для получения максимального веса выбранного подхода
  const getMaxWeightForSelectedSet = () => {
    if (!isTrainingActive) return 0;
    
    const setData = chartData[selectedSet] || [];
    return setData.reduce((max, point) => Math.max(max, point.weight), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      <Button
        variant="text" // Прозрачная кнопка
        color="inherit" // Цвет текста кнопки
        onClick={handleBack}
        sx={{ position: 'absolute', top: 90, left: 16, display: 'flex', alignItems: 'center' }} // Позиционируем кнопку
      >
        <ArrowLeftIcon /> {/* Иконка стрелки с отступом справа */}
        Вернуться
      </Button>

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
          mb: 3,
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
                бодибилдинг программами.{" "}
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
      </Collapse>

      {/* Добавляем кнопку после описания и перед графиками */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mb: 10,
        p: 2,
        mt: 12,
        gap: 2
      }}>
        {/* Существующая кнопка и таймер */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap',
          flexDirection: 'column',
          gap: 3
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={isTrainingActive ? <Square size={24} /> : <Play size={24} />}
            onClick={handleTrainingToggle}
            disabled={!connected}
            sx={{
              borderRadius: '28px',
              padding: '12px 32px',
              backgroundColor: isTrainingActive ? '#ff4444' : '#4CAF50',
              '&:hover': {
                backgroundColor: isTrainingActive ? '#ff0000' : '#45a049'
              }
            }}
          >
            {isTrainingActive ? 'Остановить тренировку' : 'Начать тренировку'}
          </Button>
 
          {isTrainingActive && (
            <>
              <Box
                sx={{
                  position: 'relative',
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <svg
                  width={CIRCLE_SIZE}
                  height={CIRCLE_SIZE}
                  viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
                  style={{
                    position: 'absolute',
                    transform: 'rotate(-90deg)', // Поворачиваем, чтобы начало было сверху
                  }}
                >
                  {/* Фоновый круг */}
                  <circle
                    cx={CIRCLE_CENTER}
                    cy={CIRCLE_CENTER}
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke="text.secondary"
                    strokeWidth="8"
                  />
                  {/* Прогресс */}
                  <motion.circle
                    cx={CIRCLE_CENTER}
                    cy={CIRCLE_CENTER}
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke={isResting ? "#9e9e9e" : "#1976d2"}
                    strokeWidth="8"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={calculateProgress(
                      isResting ? restTime : setTime,
                      isResting ? REST_TIME : SET_TIME
                    )}
                    strokeLinecap="round"
                    initial={false}
                    animate={{
                      strokeDashoffset: calculateProgress(
                        isResting ? restTime : setTime,
                        isResting ? REST_TIME : SET_TIME
                      )
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </svg>
                
                {/* Текст таймера в центре */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      color: isResting ? "text.secondary" : "text.primary",
                      fontWeight: "bold",
                      fontSize: "3.5rem",
                      textAlign: 'center',
                    }}
                  >
                    {isResting ? formatTime(restTime) : formatTime(setTime)}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: isResting ? "text.secondary" : "text.primary",
                      textAlign: 'center',
                    }}
                  >
                    {isResting ? "Отдых" : `Подход ${currentSet}`}
                  </Typography>
                </div>
              </Box>
            </>
          )}
        </Box>

        {/* Новое информационное сообщение */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: '600px',
            padding: '8px 16px',
            borderRadius: '8px',
            mb: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}
        >
          {!connected && 'Подключите тренажер для начала тренировки'}
          {connected && !isTrainingActive && 'Нажмите кнопку "Начать тренировку" для старта'}
          {connected && isTrainingActive && !isResting && 'Выполняйте упражнение с максимальным усилием'}
          {connected && isTrainingActive && isResting && 'Отдохните перед следующим подходом'}
        </Typography>
      </Box>

      <Grid container spacing={4} mb={4}>
        {/* Первая ячейка: Текущее время */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
            {isTrainingActive ? "Общее время тренировки" : "Режим обратной связи"}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {formatTime(currentTime)}
            </Typography>
          </InfoCard>
        </Grid>

        {/* Ячейка для максимального веса выбранного подхода */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
              Максимальный вес в подходе № {selectedSet}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${getMaxWeightForSelectedSet().toFixed(1)} кг`}
            </Typography>
          </InfoCard>
        </Grid>

        {/* Ячейка для максимального общего веса */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
              Максимальный вес за всю тренировку
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${getMaxWeight().toFixed(1)} кг`}
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
      {/* График */}
      <Grid item xs={12} md={3}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            transition: "all 0.3s ease",
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <Typography variant="subtitle1">График усилий</Typography>
              </div>
              {isTrainingActive && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="set-select-label">Выберите запись подхода</InputLabel>
                  <Select
                    labelId="set-select-label"
                    value={selectedSet}
                    label="Посмотреть запись подхода"
                    onChange={(e) => setSelectedSet(Number(e.target.value))}
                    size="small"
                  >
                    {new Array(10).fill(0).map((_, index) => (
                      <MenuItem key={index + 1} value={index + 1}>
                        Подход № {index + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </div>
            <LineChart
              xAxis={[
                {
                  id: "time",
                  data: xAxis,
                  scaleType: "band",
                  label: "Время",
                  valueFormatter: (value) => formatTime(parseInt(value)),
                  labelStyle: {
                    fontSize: 14,
                  },
                },
              ]}
              yAxis={[
                {
                  label: "Вес (кг)",
                  labelStyle: {
                    fontSize: 14,
                  },
                },
              ]}
              series={[
                {
                  data: yAxis,
                  label: title,
                  area: false,
                  color: "#6bc2ff",
                  showMark: false,
                },
              ]}
              height={500}
              margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
              slotProps={{
                legend: {
                  hidden: true
                }
              }}
              
            />
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}
