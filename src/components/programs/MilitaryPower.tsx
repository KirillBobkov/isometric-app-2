import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Collapse,
  Button,
  Container,
  Typography,
  Box,
} from "@mui/material";
import { InfoCard } from "../InfoCard";
import { formatTime } from "../../utils/formatTime";
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
import { soundService } from "../../services/SoundService";

const SET_COUNT = 10;

export function MilitaryPower({ connected, message }: MilitaryPowerProps) {
  // Инициализируем звуки при монтировании компонента
  useEffect(() => {
    soundService.initialize();
  }, []);

  const navigate = useNavigate(); // Получаем объект history

  const handleBack = () => {
    navigate("/"); // Перенаправляем на главную страницу
  };

  const { time, resetTime } = useTimer();

  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  const [currentSet, setCurrentSet] = useState(1);

  const [trainingData, setTrainingData] = useState<
    Record<number, SetDataPoint[]>
  >({});
  const [feedbackData, setFeedbackData] = useState<SetData[]>([]);

  const [selectedSet, setSelectedSet] = useState<number>(1);

  const [activeMode, setActiveMode] = useState<ActiveMode>(ActiveMode.FEEDBACK);

  const [isResting, setIsResting] = useState(false);

  const [restTime, setRestTime] = useState(-1);
  const [setTime, setSetTime] = useState(-1);
  const [prepareTime, setPrepareTime] = useState(-1);
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

    if (activeMode === ActiveMode.TRAINING) {
      // Если отдых, то не добавляем данные
      if (isResting) {
        return;
      }
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
  }, [time, activeMode, isResting, connected, currentSet]);

  // Эффект для отслеживания времени подхода/отдыха между подходами
  useEffect(() => {
    if (!connected) return;

    if (activeMode === ActiveMode.TRAINING) {
      const totalTimePerSet = SET_TIME + REST_TIME;
      const currentSetNumber = Math.floor(time / totalTimePerSet) + 1;
      const timeWithinSet = time % totalTimePerSet;

      if (currentSetNumber !== currentSet && currentSetNumber <= SET_COUNT) {
        setCurrentSet(currentSetNumber);
        setSelectedSet(currentSetNumber);
      }

      // озвучка при переходе от отдыха к подходу
      const isInRestPhase = timeWithinSet >= SET_TIME;

      if (currentSetNumber === SET_COUNT && isInRestPhase) {
        saveTraining();
        setActiveMode(ActiveMode.FEEDBACK);
        soundService.play("finish");
        return;
      }

      setIsResting(isInRestPhase);

      if (isInRestPhase) {
        setRestTime(totalTimePerSet - timeWithinSet);
      } else {
        setSetTime(SET_TIME - timeWithinSet);
      }
    }
  }, [time, activeMode, connected, currentSet]);

  useEffect(() => {
    if (restTime === REST_TIME) {
      soundService.play("rest");
    }
  }, [restTime]);

  useEffect(() => {
    if (setTime === SET_TIME) {
      soundService.play("start");
    }
  }, [setTime]);

  useEffect(() => {
    if (prepareTime === PREPARE_TIME) {
      soundService.play("prepare");
    }
  }, [prepareTime]);

  // Эффект для отслеживания времени подготовки
  useEffect(() => {
    if (!connected) return;

    if (activeMode === ActiveMode.PREPARING) {
      // Вычисляем оставшееся время подготовки
      const remainingPrepareTime = PREPARE_TIME - time;
      setPrepareTime(remainingPrepareTime);

      // Когда время подготовки истекло
      if (remainingPrepareTime <= 0) {
        setSetTime(SET_TIME);
        setActiveMode(ActiveMode.TRAINING);
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
      setPrepareTime(PREPARE_TIME);
      setIsResting(false);
      setActiveMode(ActiveMode.PREPARING);
      return;
    }

    // Если режим тренировки, то сохраняем данные и переходим в режим обратной связи
    if (activeMode === ActiveMode.TRAINING) {
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
    if (activeMode !== ActiveMode.TRAINING) return 0;

    return Object.values(trainingData)
      .flat()
      .reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Функция для получения максимального веса выбранного подхода
  const getMaxWeightForSelectedSet = () => {
    if (activeMode !== ActiveMode.TRAINING) return 0;

    const setData = trainingData[selectedSet] || [];
    return setData.reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Обновляем информационное сообщение
  const getStatusMessage = () => {
    if (!connected) return "Подключите тренажер для начала тренировки";
    switch (activeMode) {
      case ActiveMode.PREPARING:
        return "Приготовьтесь, тренировка сейчас начнется";
      case ActiveMode.TRAINING:
        return isResting
          ? `Подход № ${currentSet} закончен, отдохните перед подходом № ${
              currentSet + 1
            }`
          : "Выполняйте упражнение с максимальным усилием";
      case ActiveMode.FEEDBACK:
        return "Если вы готовы, то нажмите на кнопку 'Начать тренировку'";
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
            flexWrap: "wrap",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={
              activeMode === ActiveMode.TRAINING ||
              activeMode === ActiveMode.PREPARING ? (
                <Square size={24} />
              ) : (
                <Play size={24} />
              )
            }
            onClick={handleTrainingToggle}
            disabled={!connected || activeMode === ActiveMode.PREPARING}
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor:
                activeMode === ActiveMode.TRAINING ? "#ff4444" : "#4CAF50",
              "&:hover": {
                backgroundColor:
                  activeMode === ActiveMode.TRAINING ? "#ff0000" : "#45a049",
              },
            }}
          >
            {activeMode === ActiveMode.TRAINING
              ? "Остановить тренировку"
              : "Начать тренировку"}
          </Button>

          {activeMode !== ActiveMode.FEEDBACK && (
            <>
              <TrainingTimer
                totalTime={
                  activeMode === ActiveMode.TRAINING
                    ? isResting
                      ? REST_TIME
                      : SET_TIME
                    : PREPARE_TIME
                }
                time={
                  activeMode === ActiveMode.TRAINING
                    ? isResting
                      ? restTime
                      : setTime
                    : prepareTime
                }
                color={
                  activeMode === ActiveMode.TRAINING
                    ? isResting
                      ? "#4CAF50"
                      : "rgb(229, 67, 67)"
                    : "rgb(25, 167, 255)"
                }
              />
            </>
          )}
        </Box>

        {/* Новое информационное сообщение */}
        <Typography
          variant="h6"
          sx={{
            color: "text.primary",
            textAlign: "center",
            maxWidth: "600px",
            padding: "8px 16px",
            borderRadius: "8px",
            mb: 2,
            backgroundColor: "rgba(0, 0, 0, 0.03)",
          }}
        >
          {getStatusMessage()}
        </Typography>
      </Box>

      <Grid container spacing={4} mb={4}>
        {/* Первая ячейка: Текущее время */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
              {activeMode === ActiveMode.TRAINING
                ? "Общее время тренировки"
                : "Режим обратной связи"}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {formatTime(time)}
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
        <Chart
          xAxis={xAxis}
          yAxis={yAxis}
          title={title}
          isTrainingActive={activeMode === ActiveMode.TRAINING}
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
        />
      </Grid>
    </Container>
  );
}
