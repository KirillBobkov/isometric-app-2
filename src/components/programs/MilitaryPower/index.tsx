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
import { useProgram } from "../../../hooks/useProgram";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { mergeData } from "../../../utils/mergeData";
import { formatDate } from "../../../utils/formatDate";
import {
  checkHasTrainingData,
  checkHasDataForDate,
} from "../../../utils/checkHasTrainingData";
import { limitArray } from "../../../utils/limitArray";

import { ExerciseSelect } from "../../common/ExerciseSelect";
import { FileOperations } from "../../common/FileOperations";
import { SetsTable } from "./SetsTable";
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
  pausedMode?: ActiveMode.REST | ActiveMode.SET;
  pausedRemainingTime?: number;
}

export const REST_TIME = 60000;
export const SET_TIME = 15000;
export const PREPARE_TIME = 15000;
export const DEFAULT_TIME = 31536000000;
export const MAX_FEEDBACK_RECORDS = 200;

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
    DEADLIFT_TOP: { 1: [] },
    DEADLIFT_MIDDLE: { 1: [] },
    DEADLIFT_BOTTOM: { 1: [] },
    SHOULDER_PRESS_TOP: { 1: [] },
    SHOULDER_PRESS_MIDDLE: { 1: [] },
    SHOULDER_PRESS_BOTTOM: { 1: [] },
  },
};

const SET_COUNT = 10;

type ExerciseType = 
  | "DEADLIFT_TOP" 
  | "DEADLIFT_MIDDLE" 
  | "DEADLIFT_BOTTOM"
  | "SHOULDER_PRESS_TOP"
  | "SHOULDER_PRESS_MIDDLE"
  | "SHOULDER_PRESS_BOTTOM";
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
  const { programData, setProgramData } = useProgram(
    "MILITARY_POWER",
    DEFAULT_MILITARY_POWER_DATA
  );

  const [feedbackData, setFeedbackData] = useState<SetDataPoint[]>([]);
  const [tab, setTab] = useState<TabType>("feedback");
  const [set, setSet] = useState({
    current: 1,
    selected: 1,
  });
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseType>("DEADLIFT_TOP");

  // Refs for tracking previous values
  const prevConnected = useRef(connected);
  const prevTime = useRef(time);
  const prepareWarningPlayedRef = useRef(false);

  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });

  const savedSetsCount = useMemo(
    () =>
      Object.keys(programData[selectedDate]?.[selectedExercise] || {}).length,
    [programData, selectedDate, selectedExercise]
  );

  // Memoized callbacks
  const stopTraining = useCallback(async () => {
    await StorageService.saveProgramData("MILITARY_POWER", programData);

    setModeTimeline({
      mode: ActiveMode.FINISH,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });
  }, [programData, time]);

  const startTraining = useCallback(() => {
    setTab("training");
    setSelectedDate(currentDay);

    const exerciseData = programData[currentDay]?.[selectedExercise] || {};
    
    // Находим подходы с данными (непустые массивы)
    const setsWithData = Object.keys(exerciseData)
      .map(Number)
      .filter((setNum) => {
        const setData = exerciseData[setNum];
        return Array.isArray(setData) && setData.length > 0;
      });

    // Проверяем initial состояние: только подход 1 и он пустой
    const isInitialState = 
      Object.keys(exerciseData).length === 1 && 
      exerciseData[1] && 
      Array.isArray(exerciseData[1]) && 
      exerciseData[1].length === 0;

    // Определяем следующий подход
    let nextSet: number;
    if (isInitialState) {
      nextSet = 1;
    } else if (setsWithData.length > 0) {
      const lastSetWithData = Math.max(...setsWithData);
      nextSet = lastSetWithData + 1;
    } else {
      nextSet = 1;
    }

    // Если превысили лимит или начальное состояние - очищаем данные
    const shouldClearData = isInitialState || nextSet > SET_COUNT || setsWithData.length === 0;

    if (shouldClearData) {
      setProgramData((prev) => {
        const currentDayData = { ...(prev[currentDay] || {}) };
        delete currentDayData[selectedExercise];

        return {
          ...prev,
          [currentDay]: {
            ...currentDayData,
            [selectedExercise]: {
              1: [],
            },
          },
        };
      });
      nextSet = 1;
    }

    setSet({
      current: nextSet,
      selected: nextSet,
    });
    setModeTimeline({
      mode: ActiveMode.PREPARING,
      startTime: time,
      endTime: time + PREPARE_TIME,
    });
  }, [selectedExercise, time, programData]);

  const pauseTraining = useCallback(() => {
    if (
      modeTimeline.mode !== ActiveMode.SET &&
      modeTimeline.mode !== ActiveMode.REST
    ) {
      return;
    }

    const remainingTime = modeTimeline.endTime - time;
    setModeTimeline({
      mode: ActiveMode.PAUSED,
      startTime: modeTimeline.startTime,
      endTime: modeTimeline.endTime,
      pausedMode: modeTimeline.mode,
      pausedRemainingTime: remainingTime,
    });
  }, [modeTimeline, time]);

  const resumeTraining = useCallback(() => {
    if (
      modeTimeline.mode !== ActiveMode.PAUSED ||
      !modeTimeline.pausedMode ||
      modeTimeline.pausedRemainingTime === undefined
    ) {
      return;
    }

    setModeTimeline({
      mode: modeTimeline.pausedMode,
      startTime: time,
      endTime: time + modeTimeline.pausedRemainingTime,
    });
  }, [modeTimeline, time]);

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
  const dataForRender = useMemo(() => {
    return tab === "feedback"
      ? limitArray(feedbackData, MAX_FEEDBACK_RECORDS)
      : programData[selectedDate]?.[selectedExercise]?.[set.selected] || [];
  }, [
    tab,
    feedbackData,
    programData,
    selectedDate,
    selectedExercise,
    set.selected,
  ]);

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

  const isPaused = modeTimeline.mode === ActiveMode.PAUSED;

  const handleTrainingButton = useCallback(
    () => (trainigInProgress ? stopTraining() : startTraining()),
    [trainigInProgress, stopTraining, startTraining]
  );

  const hasTrainingData = useMemo(
    () => checkHasTrainingData(programData, selectedExercise),
    [programData, selectedExercise]
  );

  const timerProps = useMemo(() => {
    if (
      modeTimeline.mode === ActiveMode.PAUSED &&
      modeTimeline.pausedMode &&
      modeTimeline.pausedRemainingTime !== undefined
    ) {
      return {
        totalTime: getFullTimeForMode(modeTimeline.pausedMode),
        time: modeTimeline.pausedRemainingTime,
        color: MODE_COLORS[modeTimeline.pausedMode],
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
    modeTimeline.mode,
    modeTimeline.pausedMode,
    modeTimeline.pausedRemainingTime,
    modeTimeline.endTime,
    modeTimeline.startTime,
    time,
  ]);

  // Play sounds when mode changes
  useEffect(() => {
    switch (modeTimeline.mode) {
      case ActiveMode.REST:
        soundService.play("sound_rest_60_sec");
        prepareWarningPlayedRef.current = false; // Сбрасываем флаг при начале REST
        break;
      case ActiveMode.SET:
        soundService.play("sound_start_with_max");
        prepareWarningPlayedRef.current = false; // Сбрасываем флаг при начале SET
        break;
      case ActiveMode.PREPARING:
        soundService.play("sound_prepare");
        break;
      case ActiveMode.FINISH:
        soundService.play("sound_training_finish");
        break;
    }
  }, [modeTimeline.mode]);

  // Предупреждение за 10 секунд до начала подхода (для каждого из 10 подходов)
  useEffect(() => {
    if (!connected || prepareWarningPlayedRef.current) {
      return;
    }

    if (modeTimeline.mode !== ActiveMode.REST) {
      return;
    }

    const remainingTime = modeTimeline.endTime - time;

    // Если осталось 10 секунд или меньше, воспроизводим предупреждение
    if (remainingTime <= PREPARE_TIME && remainingTime > 0) {
      soundService.play("sound_prepare");
      prepareWarningPlayedRef.current = true;
    }
  }, [connected, modeTimeline.mode, modeTimeline.endTime, time]);

  // Reset state when disconnected
  useEffect(() => {
    if (!connected && prevConnected.current) {
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
    }
    prevConnected.current = connected;
  }, [connected, time, trainigInProgress, programData]);

  // Save data points when time changes and connected
  useEffect(() => {
    if (
      !connected ||
      time === prevTime.current ||
      modeTimeline.mode === ActiveMode.PAUSED
    ) {
      prevTime.current = time;
      return;
    }

    const weight = parseFloat(String(message));

    if (
      modeTimeline.mode === ActiveMode.DEFAULT ||
      modeTimeline.mode === ActiveMode.FINISH
    ) {
      setFeedbackData((prev) =>
        limitArray([...prev, { t: time, w: weight }], MAX_FEEDBACK_RECORDS)
      );
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

    prevTime.current = time;
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

  // Переходы между режимами
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
                { value: "DEADLIFT_TOP", label: "СТАНОВАЯ ТЯГА - Верхний уровень" },
                { value: "DEADLIFT_MIDDLE", label: "СТАНОВАЯ ТЯГА - Средний уровень" },
                { value: "DEADLIFT_BOTTOM", label: "СТАНОВАЯ ТЯГА - Нижний уровень" },
                { value: "SHOULDER_PRESS_TOP", label: "ЖИМ ПЛЕЧАМИ СТОЯ - Верхний уровень" },
                { value: "SHOULDER_PRESS_MIDDLE", label: "ЖИМ ПЛЕЧАМИ СТОЯ - Средний уровень" },
                { value: "SHOULDER_PRESS_BOTTOM", label: "ЖИМ ПЛЕЧАМИ СТОЯ - Нижний уровень" },
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
          flexDirection: "column",
          gap: 4,
          p: 4,
          mb: 2,
          borderRadius: 4,
        }}
      >
        {tab === "training" && hasTrainingData && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <FormControl disabled={trainigInProgress} sx={{ minWidth: 200 }}>
              <InputLabel id="date-select-label">Выберите дату</InputLabel>
              <Select
                labelId="date-select-label"
                value={selectedDate.toString()}
                label="Выберите дату"
                onChange={handleDateChange}
                size="small"
              >
                {Object.keys(programData)
                  .map(Number)
                  .filter((date) =>
                    checkHasDataForDate(programData, date, selectedExercise)
                  )
                  .map((date) => (
                    <MenuItem key={Number(date)} value={Number(date)}>
                      {formatDate(date)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {(() => {
              // Если выбрана текущая дата и идет тренировка, учитываем текущий подход
              // Иначе показываем только сохраненные подходы для выбранной даты
              const totalSetsCount =
                selectedDate === currentDay && trainigInProgress
                  ? Math.max(savedSetsCount, set.current)
                  : savedSetsCount;
              return (
                totalSetsCount > 1 && (
                  <FormControl disabled={trainigInProgress}>
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
                      {new Array(totalSetsCount).fill(0).map((_, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          Подход № {index + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )
              );
            })()}
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          {tab === "training" && hasTrainingData && (
            <Box sx={{ flex: "1 1 50%" }}>
              <SetsTable
                programData={programData}
                selectedDate={selectedDate}
                selectedExercise={selectedExercise}
                selectedSet={set.selected}
              />
            </Box>
          )}
          <Box
            sx={{
              flex:
                tab === "training" && hasTrainingData ? "1 1 50%" : "1 1 100%",
            }}
          >
            <Chart
              xAxis={chartData.xAxis}
              yAxis={chartData.yAxis}
              title={chartData.title}
            />
          </Box>
        </Box>
      </Card>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "center" },
          mb: 4,
        }}
      >
        <FileOperations
          programKey="MILITARY_POWER"
          disabled={trainigInProgress}
          onDataRestored={onRestore}
        />
      </Box>
    </Container>
  );
}
