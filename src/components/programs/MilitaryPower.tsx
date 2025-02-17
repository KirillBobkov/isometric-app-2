import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Collapse,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { InfoCard } from "../InfoCard";
import { ArrowLeftIcon, Play, Square } from "lucide-react";

import { saveTrainingData } from "../../services/FileService";
import {
  PREPARE_TIME,
  REST_TIME,
  SET_TIME,
} from "../../constants/militaryPower";
import { useTimer } from "../../hooks/useTimer";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../TrainingTimer";
import {
  ActiveMode,
  SetData,
  SetDataPoint,
  MilitaryPowerProps,
} from "../../types/militaryPower";
import { Chart } from "../Chart";
import { SoundService, soundService } from "../../services/SoundService";

const SET_COUNT = 10;

const MODE_COLORS = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.REST]: "#4CAF50", // Green
  [ActiveMode.FEEDBACK]: "rgb(25, 167, 255)", // Blue
} as const;

const exercises = [
  { value: "СТАНОВАЯ ТЯГА", label: "СТАНОВАЯ ТЯГА" },
  { value: "ЖИМ ПЛЕЧ", label: "ЖИМ ПЛЕЧ" },
];

export function MilitaryPower({ connected, message }: MilitaryPowerProps) {
  const soundServiceRef = useRef<SoundService | null>(null);

  // Инициализируем звуки при монтировании компонента
  useEffect(() => {
    soundServiceRef.current = new SoundService();

    soundServiceRef.current?.initialize();
  }, []);

  const navigate = useNavigate(); // Получаем объект history

  const handleBack = () => {
    navigate("/"); // Перенаправляем на главную страницу
  };

  const { time, resetTime } = useTimer();

  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  const [trainingData, setTrainingData] = useState<
    Record<number, SetDataPoint[]>
  >({});
  const [feedbackData, setFeedbackData] = useState<SetData[]>([]);

  const [selectedSet, setSelectedSet] = useState<number>(1);
  const [currentSet, setCurrentSet] = useState(1);

  const [activeMode, setActiveMode] = useState<ActiveMode>(ActiveMode.FEEDBACK);

  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const [counterTime, setCounterTime] = useState<{
    remaining: number;
    max: number;
  }>({
    remaining: 0,
    max: 0,
  });

  // Функция для переключения видимости блока и текста кнопки
  const toggleContentVisibility = () =>
    setIsContentVisible((prevState) => !prevState);

  // Эффект для обновления данных во время обратной связи
  useEffect(() => {
    if (!connected) {
      return;
    }

    if (activeMode === ActiveMode.FEEDBACK) {
      setFeedbackData((prev) => {
        const newData = [
          ...prev,
          {
            time,
            weight: parseFloat(message),
          },
        ];
        return newData;
      });
    }
  }, [time, activeMode, connected, resetTime]);

  // Эффект для обновления данных во время  подготовки
  useEffect(() => {
    if (!connected) {
      setFeedbackData([]);
      return;
    }
  }, [time, activeMode, connected, resetTime]);

  // Эффект для обновления данных во время тренировки
  useEffect(() => {
    if (!connected) return;

    if (activeMode === ActiveMode.SET) {
      setTrainingData((prev) => {
        const currentSetData = prev[currentSet] || [];
        const newSetData = [
          ...currentSetData,
          {
            time,
            weight: parseFloat(message),
          },
        ];

        return {
          ...prev,
          [currentSet]: newSetData,
        };
      });
    }
  }, [time, activeMode, connected, currentSet]);
  useEffect(() => {
    // most browsers disallow autoplaying audio/video files without user action triggering it by default and your website/app should probably honor it. If you really need a sound consistently playing in browsers, figure out a way to make the user click and start it in the callback.
    const bodyElement = document.querySelector("body");
    if (bodyElement) {
      bodyElement.click();
    }

    if (activeMode === ActiveMode.REST) {
      soundService.play("rest");
      return;
    }
    if (activeMode === ActiveMode.SET) {
      soundService.play("start");
      return;
    }
    if (activeMode === ActiveMode.PREPARING) {
      soundService.play("prepare");
      return;
    }
  }, [activeMode]);

  useEffect(() => {
    if (!connected) return;

    if (activeMode === ActiveMode.SET) {
      const remainingSetTime = SET_TIME - time;
      setCounterTime({
        remaining: remainingSetTime,
        max: SET_TIME,
      });

      // Когда время подготовки истекло
      if (remainingSetTime <= 0) {
        setCounterTime({
          remaining: SET_TIME,
          max: SET_TIME,
        });

        if (currentSet >= SET_COUNT) {
          saveTraining();
          setActiveMode(ActiveMode.FEEDBACK);
          soundService.play("finish");
          return;
        } else {
          setActiveMode(ActiveMode.REST);
          setCounterTime({
            remaining: REST_TIME,
            max: REST_TIME,
          });
          resetTime(); // Сбрасываем время для начала тренировки
        }
      }
    }
  }, [time, connected, activeMode, resetTime]);

  useEffect(() => {
    if (!connected) return;

    if (activeMode === ActiveMode.REST) {
      // Вычисляем оставшееся время подготовки
      const remainingPrepareTime = REST_TIME - time;
      setCounterTime({
        remaining: remainingPrepareTime,
        max: REST_TIME,
      });

      // Когда время подготовки истекло
      if (remainingPrepareTime <= 0) {
        setCurrentSet((prev) => prev + 1);
        setSelectedSet((prev) => prev + 1);

        setCounterTime({
          remaining: SET_TIME,
          max: SET_TIME,
        });
        setActiveMode(ActiveMode.SET);
        resetTime(); // Сбрасываем время для начала тренировки
      }
    }
  }, [time, connected, activeMode, resetTime]);

  // Эффект для отслеживания времени подготовки
  useEffect(() => {
    if (!connected) return;

    if (activeMode === ActiveMode.PREPARING) {
      // Вычисляем оставшееся время подготовки
      const remainingPrepareTime = PREPARE_TIME - time;
      setCounterTime({
        remaining: remainingPrepareTime,
        max: PREPARE_TIME,
      });

      // Когда время подготовки истекло
      if (remainingPrepareTime <= 0) {
        setCounterTime({
          remaining: SET_TIME,
          max: SET_TIME,
        });
        setActiveMode(ActiveMode.SET);
        resetTime(); // Сбрасываем время для начала тренировки
      }
    }
  }, [time, connected, activeMode, resetTime]);

  // Добавляем функцию для сохранения данных тренировки
  const saveTraining = async () => {
    if (Object.keys(trainingData).length === 0) return;

    const saved = await saveTrainingData({
      trainingData,
      time,
      selectedExercise,
    });

    if (saved) {
      console.log("Данные тренировки успешно сохранены");
    } else {
      console.error("Ошибка при сохранении данных тренировки");
    }
  };

  // Обновляем handleTrainingToggle
  const handleTrainingToggle = () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    // Если режим обратной связи, то сбрасываем все данные и переходим в режим подготовки
    if (activeMode === ActiveMode.FEEDBACK) {
      resetTime();
      setCurrentSet(1);
      setSelectedSet(1);
      setTrainingData({});
      setFeedbackData([]);
      setCounterTime({
        remaining: PREPARE_TIME,
        max: PREPARE_TIME,
      });
      setActiveMode(ActiveMode.PREPARING);
      return;
    }

    // Если режим тренировки, то сохраняем данные и переходим в режим обратной связи
    if (activeMode === ActiveMode.SET || activeMode === ActiveMode.REST) {
      soundService.play("finish");
      saveTraining();
      resetTime();
      setActiveMode(ActiveMode.FEEDBACK);
      return;
    }
  };

  // Определяем данные для отображения на графике
  const gettrainingData = () => {
    if (activeMode === ActiveMode.FEEDBACK) {
      const limitedfeedbackData = feedbackData.slice(-50);
      return {
        xAxis: limitedfeedbackData.map((data) => data.time),
        yAxis: limitedfeedbackData.map((data) => data.weight),
        title: "Текущие показания",
      };
    }

    const selectedSetData = trainingData[selectedSet] || [];
    return {
      xAxis: selectedSetData.map((data) => data.time),
      yAxis: selectedSetData.map((data) => data.weight),
      title: `Подход ${selectedSet}`,
    };
  };

  // Функция для получения максимального веса
  const getMaxWeight = () => {
    if (activeMode !== ActiveMode.SET && activeMode !== ActiveMode.REST)
      return 0;

    return Object.values(trainingData)
      .flat()
      .reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Функция для получения максимального веса выбранного подхода
  const getMaxWeightForSelectedSet = () => {
    if (activeMode !== ActiveMode.SET && activeMode !== ActiveMode.REST)
      return 0;

    const setData = trainingData[selectedSet] || [];
    return setData.reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Обновляем информационное сообщение
  const getStatusMessage = () => {
    if (!connected) return "Подключите тренажер для начала тренировки";
    switch (activeMode) {
      case ActiveMode.PREPARING:
        return "Приготовьтесь, тренировка сейчас начнется";
      case ActiveMode.REST:
        return `Подход № ${currentSet} закончен, отдохните перед подходом № ${
          currentSet + 1
        }`;
      case ActiveMode.SET:
        return "Выполняйте упражнение с максимальным усилием";
      case ActiveMode.FEEDBACK:
        return "Если вы готовы, то выберите упражнение и нажмите на кнопку 'Начать тренировку'";
      default:
        return "";
    }
  };

  const { xAxis, yAxis, title } = gettrainingData();

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      <Button
        variant="text" // Прозрачная кнопка
        color="inherit" // Цвет текста кнопки
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: 90,
          left: 16,
          display: "flex",
          alignItems: "center",
        }} // Позиционируем кнопку
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
        <MilitaryPowerDescription />
      </Collapse>

      {/* Добавляем кнопку после описания и перед графиками */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 10,
          p: 2,
          mt: 12,
          gap: 2,
        }}
      >
        {/* Существующая кнопка и таймер */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <FormControl
            sx={{ minWidth: 250, width: "auto" }}
            disabled={activeMode !== ActiveMode.FEEDBACK || !connected}
          >
            {selectedExercise ? (
              <InputLabel id="exercise-select-label">
                ТЕКУЩЕЕ УПРАЖНЕНИЕ
              </InputLabel>
            ) : (
              <InputLabel id="exercise-select-label">
                ВЫБЕРИТЕ УПРАЖНЕНИЕ
              </InputLabel>
            )}
            <Select
              labelId="exercise-select-label"
              id="exercise-select"
              key={selectedExercise}
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              label="ВЫБЕРИТЕ УПРАЖНЕНИЕ"
              sx={{
                backgroundColor: "background.paper",
                borderRadius: "28px",
                "& .MuiSelect-select": {
                  padding: "15px 32px",
                },
              }}
            >
              <MenuItem value="">Не выбрано</MenuItem>
              {exercises.map((exercise) => (
                <MenuItem key={exercise.value} value={exercise.value}>
                  {exercise.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            startIcon={
              activeMode === ActiveMode.SET ||
              activeMode === ActiveMode.REST ||
              activeMode === ActiveMode.PREPARING ? (
                <Square size={24} />
              ) : (
                <Play size={24} />
              )
            }
            onClick={handleTrainingToggle}
            disabled={
              !connected ||
              activeMode === ActiveMode.PREPARING ||
              !selectedExercise
            }
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor:
                activeMode === ActiveMode.SET ||
                activeMode === ActiveMode.REST ||
                activeMode === ActiveMode.PREPARING
                  ? "#ff4444"
                  : "#4CAF50",
              "&:hover": {
                backgroundColor:
                  activeMode === ActiveMode.SET ||
                  activeMode === ActiveMode.REST ||
                  activeMode === ActiveMode.PREPARING
                    ? "#ff0000"
                    : "#45a049",
              },
            }}
          >
            {activeMode === ActiveMode.SET ||
            activeMode === ActiveMode.REST ||
            activeMode === ActiveMode.PREPARING
              ? "Остановить тренировку"
              : "Начать тренировку"}
          </Button>
        </Box>
        {/* Новое информационное сообщение */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            textAlign: "center",
            fontSize: "20px",
            maxWidth: "600px",
            padding: "8px 16px",
            borderRadius: "8px",
            mb: 2,
            backgroundColor: "rgba(0, 0, 0, 0.03)",
          }}
        >
          {getStatusMessage()}
        </Typography>

        {activeMode !== ActiveMode.FEEDBACK && (
          <>
            <TrainingTimer
              totalTime={counterTime.max}
              time={counterTime.remaining}
              color={MODE_COLORS[activeMode]}
            />
          </>
        )}
      </Box>

      <Grid container spacing={4} mb={4}>
        {/* Ячейка для максимального веса выбранного подхода */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <Typography
              sx={{ mb: "10px" }}
              align="center"
              variant="body2"
              color="text.secondary"
            >
              Максимальный вес, поднятый в текущем подходе № {selectedSet}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${getMaxWeightForSelectedSet().toFixed(1)} кг`}
            </Typography>
          </InfoCard>
        </Grid>

        {/* Ячейка для максимального общего веса */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <Typography
              sx={{ mb: "10px" }}
              align="center"
              variant="body2"
              color="text.secondary"
            >
              Максимальный вес, поднятый за всю тренировку
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${getMaxWeight().toFixed(1)} кг`}
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
      {/* График */}
      <Grid item xs={12} md={3}>
        <Chart
          xAxis={xAxis}
          yAxis={yAxis}
          title={title}
          isTrainingActive={
            activeMode === ActiveMode.SET || activeMode === ActiveMode.REST
          }
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
        />
      </Grid>
    </Container>
  );
}
