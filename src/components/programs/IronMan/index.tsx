import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  Tabs,
  Tab,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { Play, Square, Pause } from "lucide-react";

// import { generateTrainingReport } from "../../../services/ReportService";
import { useTimer } from "../../../hooks/useTimer";
import { IronManDescription } from "./IronManDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { ExerciseSelect } from "../../common/ExerciseSelect";
import { FileOperations } from "../../common/FileOperations";
import {
  EXERCISES,
  ProgramData,
  ExerciseKey,
  DayData,
  SetDataPoint,
} from "../../../services/types";
import { StorageService } from "../../../services/StorageService";
import { mergeData } from "../../../utils/mergeData";
import { formatDate } from "../../../utils/formatDate";

enum ActiveMode {
  DEFAULT = "default",
  PREPARING = "preparing",
  CHECK_MAX_WEIGHT = "check_max_weight",
  SET = "set",
  FINISH = "FINISH",
}

export const SET_TIME = 120 * 1000;
export const PREPARE_TIME = 10000;
export const CHECK_MAX_WEIGHT_TIME = 10000;
export const DEFAULT_TIME = 31536000000;
export const MAX_FEEDBACK_RECORDS = 200;

export const getStatusMessage = (
  mode: ActiveMode,
  isConnected: boolean
): string => {
  if (!isConnected) return "Подключите тренажер для начала тренировки";

  switch (mode) {
    case ActiveMode.PREPARING:
      return "Приготовьтесь, сначала измерим ваш максимальный вес";
    case ActiveMode.CHECK_MAX_WEIGHT:
      return "Измеряем ваш максимальный вес";
    case ActiveMode.SET:
      return "Удерживайте весь в диапазоне";
    case ActiveMode.DEFAULT:
      return "Если вы готовы, то выберите упражнение и нажмите на кнопку 'Начать упражнение'";
    case ActiveMode.FINISH:
      return "Тренировка завершена";
    default:
      return "";
  }
};

// Exercise groups
const LONG_EXERCISES: ExerciseKey[] = [
  "DEADLIFT",
  "BICEPS_CURL",
  "SHOULDER_PRESS",
];

const SHORT_EXERCISES: ExerciseKey[] = [
  "FRONT_SQUAT",
  "CALF_RAISE",
  "BENT_OVER_ROW",
];

const currentDay = Math.floor(new Date().setHours(0, 0, 0, 0));

const DEFAULT_IRON_MAN_DATA: ProgramData = {
  [currentDay]: [...LONG_EXERCISES, ...SHORT_EXERCISES].reduce(
    (acc, exercise) => {
      acc[exercise as ExerciseKey] = { 1: [] };
      return acc;
    },
    {} as DayData
  ),
};

const MODE_COLORS: Record<ActiveMode, string> = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.CHECK_MAX_WEIGHT]: "rgb(229, 67, 67)", // Red
  [ActiveMode.DEFAULT]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.FINISH]: "rgb(25, 167, 255)", // Blue
};

const exercises = [
  ...LONG_EXERCISES.map((ex) => ({ value: ex, label: EXERCISES[ex] })),
  ...SHORT_EXERCISES.map((ex) => ({ value: ex, label: EXERCISES[ex] })),
];
interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}


export function IronMan({
  connected = false,
  message,
}: {
  connected: boolean;
  message: any;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const freezeTime = !connected || isPaused;
  const { time } = useTimer(0, freezeTime);

  const [programData, setProgramData] = useState<ProgramData>(DEFAULT_IRON_MAN_DATA);
  const [feedbackData, setFeedbackData] = useState<SetDataPoint[]>([]);
  const [tab, setTab] = useState<"feedback" | "training">("feedback");
  const [set, setSet] = useState({
    current: 1,
    selected: 1,
  });
  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey>("DEADLIFT");
  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });
  const [selectedDate, setSelectedDate] = useState<number>(currentDay);
  const [pausedTimeLeft, setPausedTimeLeft] = useState(0);
  const [elapsedTimeOffset, setElapsedTimeOffset] = useState(0); // Накопленное время до паузы

  // Refs for tracking previous values
  const prevConnectedRef = useRef(connected);
  const prevTimeRef = useRef(time);

  useEffect(() => {
    const loadProgramData = async () => {
      const storedData = await StorageService.getProgramData("IRON_MAN");
      setProgramData(mergeData(storedData, DEFAULT_IRON_MAN_DATA));
    };
    loadProgramData();
  }, []);

  const stopExercise = useCallback(async () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    setModeTimeline({
      mode: ActiveMode.FINISH,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });
    setIsPaused(false);
    setElapsedTimeOffset(0);

    await StorageService.saveProgramData("IRON_MAN", programData);
  }, [connected, time, programData]);

  const startTraining = useCallback(() => {
    if (!connected) return;

    setTab("training");
    setSelectedDate(currentDay);
    // Полностью перезаписываем данные для текущего упражнения на текущую дату
    setProgramData((prev) => {
      const currentDayData = { ...(prev[currentDay] || {}) };
      // Удаляем все старые данные для текущего упражнения (включая maxWeight)
      delete currentDayData[selectedExercise];
      
      return {
        ...prev,
        [currentDay]: {
          ...currentDayData,
          [selectedExercise]: {
            1: [], // Начинаем с чистого подхода 1
          },
        },
      };
    });
    setSet({
      current: 1,
      selected: 1,
    });
    setModeTimeline({
      mode: ActiveMode.PREPARING,
      startTime: time,
      endTime: time + PREPARE_TIME,
    });
    setIsPaused(false);
    setElapsedTimeOffset(0); // Сброс накопленного времени при начале упражнения
  }, [connected, time, selectedExercise]);

  const togglePause = useCallback(() => {
    if (!isPaused) {
      // Паузим - сохраняем оставшееся время и накапливаем прошедшее время
      const elapsed = time - modeTimeline.startTime;
      setElapsedTimeOffset((prev) => prev + elapsed);
      setPausedTimeLeft(modeTimeline.endTime - time);
      setIsPaused(true);
    } else {
      // Возобновляем - пересчитываем endTime и сбрасываем pausedTimeLeft
      setModeTimeline((prevTimeline) => ({
        ...prevTimeline,
        startTime: time,
        endTime: time + pausedTimeLeft,
      }));
      setIsPaused(false);
      setPausedTimeLeft(0);
    }
  }, [isPaused, modeTimeline.endTime, modeTimeline.startTime, time, pausedTimeLeft]);

  const handleDateChange = useCallback((event: SelectChangeEvent) => {
    setSelectedDate(Number(event.target.value));
    setSet((prev) => ({
      ...prev,
      selected: 1,
    }));
  }, []);

  const handleSetChange = useCallback((event: SelectChangeEvent) => {
    setSet((prev) => ({
      ...prev,
      selected: Number(event.target.value),
    }));
  }, []);

  const diapason = useMemo(
    () => (LONG_EXERCISES.includes(selectedExercise) ? 20 : 40),
    [selectedExercise]
  );

  const dataForRender = useMemo(
    () => {
      if (tab === "feedback") {
        // Показываем максимум последние N записей
        return feedbackData.length > MAX_FEEDBACK_RECORDS
          ? feedbackData.slice(-MAX_FEEDBACK_RECORDS)
          : feedbackData;
      }
      return programData[selectedDate]?.[selectedExercise]?.[set.selected] || [];
    },
    [tab, feedbackData, programData, selectedDate, selectedExercise, set.selected]
  );

  const chartData = useMemo(
    () => ({
      xAxis: dataForRender.map((data) => data.t),
      yAxis: dataForRender.map((data) => data.w),
      title: tab === "feedback" ? "Обратная связь" : `Подход ${set.selected}`,
    }),
    [dataForRender, tab, set.selected]
  );

  const trainigInProgress = useMemo(
    () =>
      modeTimeline.mode !== ActiveMode.DEFAULT &&
      modeTimeline.mode !== ActiveMode.FINISH,
    [modeTimeline.mode]
  );

  const setCount = useMemo(
    () =>
      Object.keys(programData[selectedDate]?.[selectedExercise] || {}).filter(
        (key) => key !== "maxWeight"
      ).length,
    [programData, selectedDate, selectedExercise]
  );

  const maxWeight = useMemo(
    () => programData[selectedDate]?.[selectedExercise]?.maxWeight || 0,
    [programData, selectedDate, selectedExercise]
  );

  const calculateAverageWeight = useCallback(() => {
    const currentSetData =
      programData[selectedDate]?.[selectedExercise]?.[set.selected] || [];
    return currentSetData.length > 0
      ? (
          currentSetData.reduce((acc, curr) => acc + curr.w, 0) /
          currentSetData.length
        ).toFixed(1)
      : 0;
  }, [programData, selectedDate, selectedExercise, set.selected]);

  const datesWithData = useMemo(() => {
    // Возвращаем список дат, где есть данные для текущего упражнения
    return Object.keys(programData)
      .map(Number)
      .filter((date) => {
        const exerciseData = programData[date]?.[selectedExercise];
        if (!exerciseData) return false;
        // Проверяем, есть ли хотя бы один подход с данными
        return Object.keys(exerciseData).some((key) => {
          if (key === "maxWeight") return false;
          const setData = exerciseData[Number(key)];
          return Array.isArray(setData) && setData.length > 0;
        });
      })
      .sort((a, b) => b - a); // Сортируем по убыванию (новые даты первыми)
  }, [programData, selectedExercise]);

  const hasTrainingData = useMemo(() => {
    return datesWithData.length > 0;
  }, [datesWithData]);

  // Автоматически выбираем первую доступную дату при смене упражнения
  // Но НЕ переключаем если идет тренировка или выбран текущий день
  useEffect(() => {
    if (
      trainigInProgress ||
      selectedDate === currentDay ||
      datesWithData.length === 0 ||
      datesWithData.includes(selectedDate)
    ) {
      return;
    }
    
    setSelectedDate(datesWithData[0]);
    setSet((prev) => ({ ...prev, selected: 1 }));
  }, [datesWithData, selectedDate, trainigInProgress]);

  const timerProps = useMemo(() => {
    // Определяем полное время для текущего режима
    const getFullTimeForMode = (mode: ActiveMode): number => {
      switch (mode) {
        case ActiveMode.SET:
          return diapason === 20 ? SET_TIME : SET_TIME / 2;
        case ActiveMode.CHECK_MAX_WEIGHT:
          return CHECK_MAX_WEIGHT_TIME;
        case ActiveMode.PREPARING:
          return PREPARE_TIME;
        default:
          return 0;
      }
    };

    if (isPaused && pausedTimeLeft > 0) {
      // Во время паузы показываем оставшееся время
      return {
        totalTime: getFullTimeForMode(modeTimeline.mode),
        time: pausedTimeLeft,
        color: MODE_COLORS[modeTimeline.mode],
      };
    }

    return {
      totalTime: getFullTimeForMode(modeTimeline.mode) || (modeTimeline.endTime - modeTimeline.startTime),
      time: modeTimeline.endTime - time,
      color: MODE_COLORS[modeTimeline.mode],
    };
  }, [
    isPaused,
    pausedTimeLeft,
    modeTimeline.mode,
    modeTimeline.endTime,
    modeTimeline.startTime,
    time,
    diapason,
  ]);

  // Звуки при смене режима
  useEffect(() => {
    if (isPaused) return;

    if (modeTimeline.mode === ActiveMode.PREPARING) {
      soundService.play("sound_prepare_with_max");
    } else if (modeTimeline.mode === ActiveMode.CHECK_MAX_WEIGHT) {
      soundService.play("sound_start_with_max");
    } else if (modeTimeline.mode === ActiveMode.SET) {
      if (diapason === 20) {
        soundService.play("sound_start_with_120_sec");
      } else {
        soundService.play("sound_start_with_60_sec");
      }
    } else if (modeTimeline.mode === ActiveMode.FINISH) {
      soundService.play("sound_exersise_finished");
    }
  }, [modeTimeline.mode, isPaused, diapason]);

  // Сброс при отключении
  useEffect(() => {
    if (!connected && prevConnectedRef.current) {
      // Сохраняем данные тренировки если она была в процессе
      if (trainigInProgress) {
        StorageService.saveProgramData("IRON_MAN", programData);
      }

      setSet({
        current: 1,
        selected: 1,
      });
      setModeTimeline({
        mode: ActiveMode.DEFAULT,
        startTime: 0,
        endTime: Date.now() + DEFAULT_TIME,
      });
      setFeedbackData([]); // Очищаем данные обратной связи при отключении
      setIsPaused(false);
      setElapsedTimeOffset(0);
    }
    prevConnectedRef.current = connected;
  }, [connected, trainigInProgress, programData]);

  // Обработка данных от тренажера
  useEffect(() => {
    if (
      !connected ||
      time === prevTimeRef.current ||
      isPaused
    ) {
      prevTimeRef.current = time;
      return;
    }

    const weight = parseFloat(String(message));
    // Используем накопленное время + текущее прошедшее время для корректной работы с паузой
    const totalElapsedTime = elapsedTimeOffset + (time - modeTimeline.startTime);

    if (modeTimeline.mode === ActiveMode.DEFAULT || modeTimeline.mode === ActiveMode.FINISH) {
      setFeedbackData((prev) => {
        const newData = [...prev, { t: time, w: weight }];
        // Храним максимум N последних записей чтобы не переполнять память
        return newData.length > MAX_FEEDBACK_RECORDS
          ? newData.slice(-MAX_FEEDBACK_RECORDS)
          : newData;
      });
    } else if (modeTimeline.mode === ActiveMode.CHECK_MAX_WEIGHT) {
      setProgramData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [selectedExercise]: {
            ...prev[selectedDate]?.[selectedExercise],
            maxWeight: Math.max(
              prev[selectedDate]?.[selectedExercise]?.maxWeight || 0,
              weight
            ),
          },
        },
      }));
    } else if (modeTimeline.mode === ActiveMode.SET) {
      const currentSetNumber = set.current;
      setProgramData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [selectedExercise]: {
            ...prev[selectedDate]?.[selectedExercise],
            [currentSetNumber]: [
              ...(prev[selectedDate]?.[selectedExercise]?.[currentSetNumber] || []),
              { t: totalElapsedTime, w: weight },
            ],
          },
        },
      }));
    }

    prevTimeRef.current = time;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, connected, isPaused, modeTimeline.mode, modeTimeline.startTime, elapsedTimeOffset, message, selectedDate, selectedExercise, set.current]);

  // Обработка переходов между режимами
  useEffect(() => {
    if (!connected || isPaused || time < modeTimeline.endTime) return;

    switch (modeTimeline.mode) {
      case ActiveMode.PREPARING:
        setModeTimeline({
          mode: ActiveMode.CHECK_MAX_WEIGHT,
          startTime: time,
          endTime: time + CHECK_MAX_WEIGHT_TIME,
        });
        setElapsedTimeOffset(0); // Сброс при переходе к новому режиму
        break;
      case ActiveMode.CHECK_MAX_WEIGHT:
        setModeTimeline({
          mode: ActiveMode.SET,
          startTime: time,
          endTime: time + (diapason === 20 ? SET_TIME : SET_TIME / 2),
        });
        setElapsedTimeOffset(0); // Сброс при переходе к подходу
        break;
      case ActiveMode.SET:
        stopExercise();
        break;
      default:
        break;
    }
  }, [time, connected, isPaused, modeTimeline.endTime, modeTimeline.mode, diapason, stopExercise]);

  // Звуковая обратная связь во время подхода
  useEffect(() => {
    if (isPaused || modeTimeline.mode !== ActiveMode.SET || maxWeight === 0 || !message) return;

    const currentValue = Math.round((Number(message) / maxWeight) * 100);

    if (currentValue !== 0) {
      if (currentValue > diapason + 10) {
        soundService.play("sound_go_high");
      } else if (currentValue < diapason - 10) {
        soundService.play("sound_go_low");
      }
    }
  }, [isPaused, modeTimeline.mode, maxWeight, message, diapason]);

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ p: "1 2", fontWeight: "bold", textTransform: "uppercase" }}
        gutterBottom
      >
        Железный человек (Iron Man)
      </Typography>
      <IronManDescription />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          gap: 2,
          mb: 2,
        }}
      >
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "center" },
            justifyContent: "center",
            gap: 2,
            flex: { xs: "1 1 100%", md: 2 },
            p: 4,
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "center" },
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <ExerciseSelect
              disabled={trainigInProgress}
              exercises={exercises}
              value={selectedExercise}
              onChange={(value) => {
                setSelectedExercise(value as ExerciseKey);
                setTab("training");
              }}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={
                trainigInProgress ? <Square size={24} /> : <Play size={24} />
              }
              onClick={() => {
                if (modeTimeline.mode === ActiveMode.SET) {
                  stopExercise();
                } else {
                  startTraining();
                }
              }}
              disabled={
                !connected ||
                modeTimeline.mode === ActiveMode.PREPARING ||
                modeTimeline.mode === ActiveMode.CHECK_MAX_WEIGHT ||
                !selectedExercise
              }
              sx={{
                borderRadius: "28px",
                padding: "12px 32px",
                backgroundColor: trainigInProgress ? "#ff4444" : "#4CAF50",
                "&:hover": {
                  backgroundColor: trainigInProgress ? "#ff0000" : "#45a049",
                },
              }}
            >
              {trainigInProgress ? "Завершить" : "Начать"}
            </Button>

            {trainigInProgress && !isPaused && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Pause size={24} />}
                onClick={togglePause}
                disabled={!connected}
                sx={{
                  borderRadius: "28px",
                  padding: "12px 32px",
                  backgroundColor: "#FFA726",
                  "&:hover": {
                    backgroundColor: "#FB8C00",
                  },
                }}
              >
                Пауза
              </Button>
            )}

            {isPaused && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Play size={24} />}
                onClick={togglePause}
                disabled={!connected}
                sx={{
                  borderRadius: "28px",
                  padding: "12px 32px",
                  backgroundColor: "#4CAF50",
                  "&:hover": {
                    backgroundColor: "#45a049",
                  },
                }}
              >
                Продолжить
              </Button>
            )}
          </Box>

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
            {getStatusMessage(modeTimeline.mode, connected)}
          </Typography>

          {trainigInProgress && (
            <TrainingTimer
              totalTime={timerProps.totalTime}
              time={timerProps.time}
              color={timerProps.color}
            />
          )}
        </Card>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: { xs: "1 1 100%", md: 1 },
            maxWidth: { xs: "100%", md: "380px" },
          }}
        >
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              transition: "all 0.3s ease",
              p: 4,
              flexGrow: 1,
              background: (() => {
                if (modeTimeline.mode !== ActiveMode.SET) 
                  return "linear-gradient(135deg, rgba(25, 167, 255, 0.1) 0%, rgba(25, 167, 255, 0.05) 100%)";

                const currentValue =
                  maxWeight > 0
                    ? Math.round((Number(message) / maxWeight) * 100)
                    : 0;

                if (currentValue === 0) 
                  return "linear-gradient(135deg, rgba(25, 167, 255, 0.1) 0%, rgba(25, 167, 255, 0.05) 100%)";
                
                return Math.abs(currentValue - diapason) > 10
                  ? "rgb(120, 18, 18)"
                  : "rgb(35, 142, 39)";
              })(),
            }}
          >
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 1 }}
            >
              Диапазон
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${
                maxWeight > 0 && modeTimeline.mode === ActiveMode.SET
                  ? Math.round((Number(message) / maxWeight) * 100)
                  : "0"
              } %`}
            </Typography>
          </Card>

          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              transition: "all 0.3s ease",
              p: 4,
              flexGrow: 1,
              background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
            }}
          >
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 1 }}
            >
              Измеренный максимум
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${maxWeight > 0 ? maxWeight.toFixed(1) : 0} кг`}
            </Typography>
          </Card>

          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              transition: "all 0.3s ease",
              p: 4,
              flexGrow: 1,
              background: "linear-gradient(135deg, rgba(229, 67, 67, 0.1) 0%, rgba(229, 67, 67, 0.05) 100%)",
            }}
          >
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 1 }}
            >
              Среднее значение
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${calculateAverageWeight()} кг`}
            </Typography>
          </Card>
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        aria-label="График тренировки"
        sx={{
          mb: 2,
        }}
      >
        <Tab
          label="Текущие показания"
          value="feedback"
          disabled={trainigInProgress}
          sx={{
            fontSize: "16px",
            textTransform: "none",
            fontWeight: 500,
          }}
        />
        <Tab
          label="Записи тренировок"
          value="training"
          disabled={trainigInProgress}
          sx={{
            fontSize: "16px",
            textTransform: "none",
            fontWeight: 500,
          }}
        />
      </Tabs>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "column" },
          gap: 0,
          p: 2,
          mb: 4,
          borderRadius: 4,
        }}
      >
        <Box sx={{ flex: 1 }}>
          {tab === "training" && (
            <>
              {hasTrainingData && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel id="date-select-label">
                        Выберите дату
                      </InputLabel>
                      <Select
                        labelId="date-select-label"
                        value={selectedDate.toString()}
                        label="Выберите дату"
                        onChange={handleDateChange}
                        size="small"
                      >
                        {datesWithData.map((date) => (
                          <MenuItem key={date} value={date}>
                            {formatDate(date)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {setCount > 1 && (
                      <FormControl>
                        <InputLabel id="set-select-label">
                          Выберите запись подхода
                        </InputLabel>
                        <Select
                          labelId="set-select-label"
                          value={set.selected.toString()}
                          label="Посмотреть запись подхода"
                          onChange={handleSetChange}
                          size="small"
                        >
                          {new Array(setCount).fill(0).map((_, index) => (
                            <MenuItem key={index + 1} value={index + 1}>
                              Подход № {index + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </Box>
              )}
              <Chart
                xAxis={chartData.xAxis}
                yAxis={chartData.yAxis}
                title={chartData.title}
              />
            </>
          )}
          {tab === "feedback" && (
            <Chart
              xAxis={chartData.xAxis}
              yAxis={chartData.yAxis}
              title={chartData.title}
            />
          )}
        </Box>
        {tab !== "feedback" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "center" },
              flex: { xs: "1 1 100%", md: 1 },
              mt: { xs: 3, md: 0 },
              mb: 2,
            }}
          >
            <FileOperations
              programKey="IRON_MAN"
              disabled={trainigInProgress}
              onDataRestored={(data) => {
                setTab("training");
                setProgramData(mergeData(data, DEFAULT_IRON_MAN_DATA));
              }}
            />
          </Box>
        )}
      </Card>
    </Container>
  );
}
