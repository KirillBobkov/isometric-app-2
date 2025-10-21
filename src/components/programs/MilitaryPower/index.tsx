import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import { Play, Square, Pause } from "lucide-react";

import { useTimer } from "../../../hooks/useTimer";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { mergeData } from "../../../utils/mergeData";
import { formatDate } from "../../../utils/formatDate";

import { ExerciseSelect } from "../../common/ExerciseSelect";
import { FileOperations } from "../../common/FileOperations";
import { ProgramData, SetDataPoint } from "../../../services/types";
import { StorageService } from "../../../services/StorageService";

enum ActiveMode {
  DEFAULT = "default",
  REST = "rest",
  SET = "set",
  PREPARING = "preparing",
  FINISH = "finish",
  PAUSED = "paused",
}

interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}

interface PausedState {
  pausedMode: ActiveMode.REST | ActiveMode.SET;
  remainingTime: number;
}

export const REST_TIME = 60000;
export const SET_TIME = 6000;
export const PREPARE_TIME = 10000;
export const DEFAULT_TIME = 31536000000;
export const MAX_FEEDBACK_RECORDS = 200;

const getStatusMessage = (mode: ActiveMode, isConnected: boolean): string => {
  if (!isConnected) return "Подключите тренажер для начала тренировки";

  switch (mode) {
    case ActiveMode.PREPARING:
      return "Приготовьтесь, тренировка сейчас начнется";
    case ActiveMode.REST:
      return "Подход закончен, отдохните перед следующим подходом";
    case ActiveMode.SET:
      return "Выполняйте упражнение с максимальным усилием";
    case ActiveMode.PAUSED:
      return "Тренировка на паузе. Нажмите 'Продолжить' для возобновления";
    case ActiveMode.DEFAULT:
      return "Если вы готовы, то выберите упражнение и нажмите на кнопку 'Начать'";
    case ActiveMode.FINISH:
        return "Если вы готовы, то выберите упражнение и нажмите на кнопку 'Начать'";
      
    
    default:
      return "";
  }
};

const MODE_COLORS: Record<ActiveMode, string> = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.REST]: "#4CAF50", // Green
  [ActiveMode.PAUSED]: "#FFA726", // Orange
  [ActiveMode.DEFAULT]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.FINISH]: "rgb(25, 167, 255)", // Blue
};

const currentDay = Math.floor(new Date().setHours(0, 0, 0, 0));

const DEFAULT_MILITARY_POWER_DATA: ProgramData = {
  [currentDay]: {
    DEADLIFT: { 1: [] },
    SHOULDER_PRESS: { 1: [] },
  },
};

const SET_COUNT = 10;

// Helper functions
const calculateMaxWeight = (data: SetDataPoint[]): number => {
  return data.length > 0
    ? data.reduce((max, point) => Math.max(max, point.w), 0)
    : 0;
};

type ExerciseType = "SHOULDER_PRESS" | "DEADLIFT";
type TabType = "feedback" | "training";

interface MilitaryPowerProps {
  connected: boolean;
  message: string | number;
}

export function MilitaryPower({
  connected = false,
  message,
}: MilitaryPowerProps) {
  const freezeTime = !connected;
  const { time } = useTimer(0, freezeTime);

  const [selectedDate, setSelectedDate] = useState<number>(currentDay);
  const [programData, setProgramData] = useState<ProgramData>(
    DEFAULT_MILITARY_POWER_DATA
  );

  useEffect(() => {
    const loadProgramData = async () => {
      const storedData = await StorageService.getProgramData("MILITARY_POWER");
      setProgramData(mergeData(storedData, DEFAULT_MILITARY_POWER_DATA));
    };
    loadProgramData();
  }, []);

  const [feedbackData, setFeedbackData] = useState<SetDataPoint[]>([]);
  const [tab, setTab] = useState<TabType>("feedback");
  const [set, setSet] = useState({
    current: 1,
    selected: 1,
  });
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseType>("DEADLIFT");

  // Refs for tracking previous values
  const prevConnectedRef = useRef(connected);
  const prevTimeRef = useRef(time);

  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });

  const [pausedState, setPausedState] = useState<PausedState | null>(null);

  // Memoized callbacks
  const stopTraining = useCallback(async () => {
    if (!connected) return;

    await StorageService.saveProgramData("MILITARY_POWER", programData);

    setModeTimeline({
      mode: ActiveMode.FINISH,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });
    setPausedState(null);
  }, [connected, programData, time]);

  const startTraining = useCallback(() => {
    if (!connected) return;

    setTab("training");
    setSelectedDate(currentDay);
    // Полностью перезаписываем данные для текущего упражнения на текущую дату
    setProgramData((prev) => {
      const currentDayData = { ...(prev[currentDay] || {}) };
      // Удаляем все старые данные для текущего упражнения
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
  }, [connected, selectedExercise, time]);

  const pauseTraining = useCallback(() => {
    if (
      modeTimeline.mode !== ActiveMode.SET &&
      modeTimeline.mode !== ActiveMode.REST
    ) {
      return;
    }

    const remainingTime = modeTimeline.endTime - time;
    setPausedState({
      pausedMode: modeTimeline.mode,
      remainingTime,
    });
    setModeTimeline((prev) => ({
      ...prev,
      mode: ActiveMode.PAUSED,
    }));
  }, [modeTimeline.mode, modeTimeline.endTime, time]);

  const resumeTraining = useCallback(() => {
    if (!pausedState) return;

    setModeTimeline({
      mode: pausedState.pausedMode,
      startTime: time,
      endTime: time + pausedState.remainingTime,
    });
    setPausedState(null);
  }, [pausedState, time]);

  const handleExerciseChange = useCallback((value: string) => {
    setSelectedExercise(value as ExerciseType);
    setTab("training");
  }, []);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: TabType) => {
      setTab(newValue);
    },
    []
  );

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

  const onRestore = useCallback((data: ProgramData) => {
    setTab("training");
    setProgramData(mergeData(data, DEFAULT_MILITARY_POWER_DATA));
  }, []);

  // Memoized computed values
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
    [
      tab,
      feedbackData,
      programData,
      selectedDate,
      selectedExercise,
      set.selected,
    ]
  );

  const exerciseData = useMemo(
    () => programData[selectedDate]?.[selectedExercise] || {},
    [programData, selectedDate, selectedExercise]
  );

  // Находим лучший и худший подходы
  const bestAndWorstSets = useMemo(() => {
    const setNumbers = Object.keys(exerciseData).map(Number);
    
    if (setNumbers.length === 0) {
      return { best: null, worst: null };
    }

    let bestSet = { number: 0, weight: 0 };
    let worstSet = { number: 0, weight: Infinity };

    setNumbers.forEach((setNumber) => {
      const setData = exerciseData[setNumber];
      const maxWeightInSet = calculateMaxWeight(setData);

      if (maxWeightInSet > bestSet.weight) {
        bestSet = { number: setNumber, weight: maxWeightInSet };
      }

      if (maxWeightInSet < worstSet.weight && maxWeightInSet > 0) {
        worstSet = { number: setNumber, weight: maxWeightInSet };
      }
    });

    return {
      best: bestSet.weight > 0 ? bestSet : null,
      worst: worstSet.weight !== Infinity ? worstSet : null,
    };
  }, [exerciseData]);

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

  const canPause = useMemo(
    () =>
      modeTimeline.mode === ActiveMode.SET ||
      modeTimeline.mode === ActiveMode.REST,
    [modeTimeline.mode]
  );

  const isPaused = useMemo(
    () => modeTimeline.mode === ActiveMode.PAUSED,
    [modeTimeline.mode]
  );

  const handleTrainingButton = useCallback(
    () => (trainigInProgress ? stopTraining() : startTraining()),
    [trainigInProgress, stopTraining, startTraining]
  );

  const setCount = useMemo(
    () => Object.keys(exerciseData).length,
    [exerciseData]
  );

  const hasTrainingData = useMemo(() => {
    // Проверяем, есть ли хотя бы одна запись с данными для выбранного упражнения
    return Object.keys(programData).some((date) => {
      const exerciseData = programData[Number(date)]?.[selectedExercise];
      if (!exerciseData) return false;
      // Проверяем, есть ли хотя бы один подход с данными
      return Object.values(exerciseData).some(
        (setData) => Array.isArray(setData) && setData.length > 0
      );
    });
  }, [programData, selectedExercise]);

  const timerProps = useMemo(() => {
    // Определяем полное время для текущего режима
    const getFullTimeForMode = (mode: ActiveMode): number => {
      switch (mode) {
        case ActiveMode.SET:
          return SET_TIME;
        case ActiveMode.REST:
          return REST_TIME;
        case ActiveMode.PREPARING:
          return PREPARE_TIME;
        default:
          return 0;
      }
    };

    if (isPaused && pausedState) {
      return {
        totalTime: getFullTimeForMode(pausedState.pausedMode),
        time: pausedState.remainingTime,
        color: MODE_COLORS[pausedState.pausedMode],
      };
    }

    return {
      totalTime:
        getFullTimeForMode(modeTimeline.mode) ||
        modeTimeline.endTime - modeTimeline.startTime,
      time: modeTimeline.endTime - time,
      color: MODE_COLORS[modeTimeline.mode],
    };
  }, [
    isPaused,
    pausedState,
    modeTimeline.mode,
    modeTimeline.endTime,
    modeTimeline.startTime,
    time,
  ]);

  // Initialize sound service once
  useEffect(() => {
    soundService.initialize();
  }, []);

  // Play sounds when mode changes
  useEffect(() => {
    switch (modeTimeline.mode) {
      case ActiveMode.REST:
        soundService.play("sound_rest_60_sec");
        break;
      case ActiveMode.SET:
        soundService.play("sound_start_with_max");
        break;
      case ActiveMode.PREPARING:
        soundService.play("sound_prepare");
        break;
      case ActiveMode.FINISH:
        soundService.play("sound_training_finish");
        break;
    }
  }, [modeTimeline.mode]);

  // Reset state when disconnected
  useEffect(() => {
    if (!connected && prevConnectedRef.current) {
      // Сохраняем данные тренировки если она была в процессе
      if (trainigInProgress) {
        StorageService.saveProgramData("MILITARY_POWER", programData);
      }
      
      setSet({
        current: 1,
        selected: 1,
      });
      setFeedbackData([]); // Очищаем данные обратной связи при отключении
      setModeTimeline({
        mode: ActiveMode.DEFAULT,
        startTime: 0,
        endTime: time + DEFAULT_TIME,
      });
      // feedbackData НЕ очищаем - сохраняем данные
      setPausedState(null);
    }
    prevConnectedRef.current = connected;
  }, [connected, time, trainigInProgress, programData]);

  // Save data points when time changes and connected
  useEffect(() => {
    if (
      !connected ||
      time === prevTimeRef.current ||
      modeTimeline.mode === ActiveMode.PAUSED
    ) {
      prevTimeRef.current = time;
      return;
    }

    const weight = parseFloat(String(message));

    if (modeTimeline.mode === ActiveMode.DEFAULT || modeTimeline.mode === ActiveMode.FINISH) {
      setFeedbackData((prev) => {
        const newData = [...prev, { t: time, w: weight }];
        // Храним максимум N последних записей чтобы не переполнять память
        return newData.length > MAX_FEEDBACK_RECORDS
          ? newData.slice(-MAX_FEEDBACK_RECORDS)
          : newData;
      });
    } else if (modeTimeline.mode === ActiveMode.SET) {
      setProgramData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...(prev[selectedDate] || {}),
          [selectedExercise]: {
            ...(prev[selectedDate]?.[selectedExercise] || {}),
            [set.current]: [
              ...(prev[selectedDate]?.[selectedExercise]?.[set.current] || []),
              { t: time, w: weight },
            ],
          },
        },
      }));
    }

    prevTimeRef.current = time;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    time,
    connected,
    message,
    modeTimeline.mode,
    selectedDate,
    selectedExercise,
    set.current,
  ]);

  // Handle mode transitions when time exceeds endTime
  useEffect(() => {
    if (
      !connected ||
      time < modeTimeline.endTime ||
      modeTimeline.mode === ActiveMode.PAUSED
    ) {
      return;
    }

    switch (modeTimeline.mode) {
      case ActiveMode.PREPARING:
        setModeTimeline({
          mode: ActiveMode.SET,
          startTime: time,
          endTime: time + SET_TIME,
        });
        break;

      case ActiveMode.SET:
        if (set.current >= SET_COUNT) {
          setModeTimeline({
            mode: ActiveMode.FINISH,
            startTime: time,
            endTime: time + DEFAULT_TIME,
          });
          StorageService.saveProgramData("MILITARY_POWER", programData);
        } else {
          setModeTimeline({
            mode: ActiveMode.REST,
            startTime: time,
            endTime: time + REST_TIME,
          });
        }
        break;

      case ActiveMode.REST:
        setModeTimeline({
          mode: ActiveMode.SET,
          startTime: time,
          endTime: time + SET_TIME,
        });
        setSet((prev) => ({
          ...prev,
          current: prev.current + 1,
          selected: prev.current + 1,
        }));
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    time,
    connected,
    modeTimeline.mode,
    modeTimeline.endTime,
    set.current,
    programData,
  ]);

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ p: "1 2", fontWeight: "bold", textTransform: "uppercase" }}
        gutterBottom
      >
        Солдатская мощь (Military Power)
      </Typography>
      <MilitaryPowerDescription />

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
              value={selectedExercise}
              onChange={handleExerciseChange}
              exercises={[
                { value: "DEADLIFT", label: "СТАНОВАЯ ТЯГА" },
                { value: "SHOULDER_PRESS", label: "ЖИМ ПЛЕЧАМИ СТОЯ" },
              ]}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={
                trainigInProgress ? <Square size={24} /> : <Play size={24} />
              }
              onClick={handleTrainingButton}
              disabled={
                !connected ||
                modeTimeline.mode === ActiveMode.PREPARING ||
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

            {canPause && !isPaused && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Pause size={24} />}
                onClick={pauseTraining}
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
                onClick={resumeTraining}
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
              background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
            }}
          >
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 1 }}
            >
               Лучший подход
            </Typography>
            {bestAndWorstSets.best ? (
              <>
                <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
                  {`${bestAndWorstSets.best.weight.toFixed(1)} кг`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Подход № {bestAndWorstSets.best.number}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" align="center" sx={{ color: "text.secondary" }}>
                Нет данных
              </Typography>
            )}
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
               Худший подход
            </Typography>
            {bestAndWorstSets.worst ? (
              <>
                <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
                  {`${bestAndWorstSets.worst.weight.toFixed(1)} кг`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Подход № {bestAndWorstSets.worst.number}
                </Typography>
              </>
            ) : (
              <Typography  variant="body2" align="center" sx={{ color: "text.secondary" }}>
                Нет данных
              </Typography>
            )}
          </Card>
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={handleTabChange}
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
          borderRadius: 4
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
                        {Object.keys(programData)
                          .map(Number)
                          .map((date) => (
                            <MenuItem key={Number(date)} value={Number(date)}>
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
              programKey="MILITARY_POWER"
              disabled={trainigInProgress}
              onDataRestored={onRestore}
            />
          </Box>
        )}
      </Card>
    </Container>
  );
}
