import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  Switch,
  styled,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { Play, Square } from "lucide-react";

// import { generateTrainingReport } from "../../../services/ReportService";
import { useTimer } from "../../../hooks/useTimer";
import { IronManDescription } from "./IronManDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { usePrevious } from "../../../hooks/usePrevious";
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

const StyledSwitch = styled(Switch)(() => ({
  width: 70,
  height: 48,
  padding: 8,
  "& .MuiSwitch-switchBase": {
    padding: 11,
    "&.Mui-checked": {
      transform: "translateX(22px)",
      "& + .MuiSwitch-track": {
        backgroundColor: "#323232",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
  },
  "& .MuiSwitch-track": {
    borderRadius: 24,
    backgroundColor: "#323232",
    opacity: 1,
  },
}));

export function IronMan({
  connected = false,
  message,
}: {
  connected: boolean;
  message: any;
}) {
  const freezeTime = !connected;
  const { time } = useTimer(0, freezeTime);

  const [programData, setProgramData] = useState<ProgramData>(DEFAULT_IRON_MAN_DATA);

  useEffect(() => {
    const loadProgramData = async () => {
      const storedData = await StorageService.getProgramData("IRON_MAN");
      setProgramData(mergeData(storedData, DEFAULT_IRON_MAN_DATA));
    };
    loadProgramData();
  }, []);

  const [feedbackData, setFeedbackData] = useState<SetDataPoint[]>([]);

  const [tab, setTab] = useState<"feedback" | "training">("feedback");

  const [set, setSet] = useState({
    current: 1,
    selected: 1,
  });

  const [selectedExercise, setSelectedExercise] = useState<
    | "DEADLIFT"
    | "BICEPS_CURL"
    | "SHOULDER_PRESS"
    | "FRONT_SQUAT"
    | "CALF_RAISE"
    | "BENT_OVER_ROW"
  >("DEADLIFT");

  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });

  const [selectedDate, setSelectedDate] = useState<number>(currentDay);

  const stopExercise = async () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    setModeTimeline({
      mode: ActiveMode.FINISH,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });

    StorageService.saveProgramData("IRON_MAN", programData);
  };

  const startTraining = () => {
    if (!connected) return;

    setTab("training");
    setSelectedDate(currentDay);
    setProgramData((prev) => ({
      ...prev,
      [currentDay]: {
        ...(prev[currentDay] || {}),
        [selectedExercise]: {
          1: [],
        },
      },
    }));
    setSet({
      current: 1,
      selected: 1,
    });
    setModeTimeline({
      mode: ActiveMode.PREPARING,
      startTime: time,
      endTime: time + PREPARE_TIME,
    });
  };

  const handleDateChange = (event: SelectChangeEvent) => {
    setSelectedDate(Number(event.target.value));
    setSet((prev) => ({
      ...prev,
      selected: 1,
    }));
  };

  const handleSetChange = (event: SelectChangeEvent) => {
    setSet((prev) => ({
      ...prev,
      selected: Number(event.target.value),
    }));
  };

  const dataForRender =
    tab === "feedback"
      ? feedbackData
      : programData[selectedDate]?.[selectedExercise]?.[set.selected] || [];

  // Получение данных для графика
  const getTrainingChartData = () => {
    return {
      xAxis: dataForRender.map((data) => data.t),
      yAxis: dataForRender.map((data) => data.w),
      title: `Подход ${set.selected}`,
    };
  };

  const { xAxis, yAxis, title } = getTrainingChartData();

  useEffect(() => {
    soundService.initialize();
  }, []);

  const diapason = LONG_EXERCISES.includes(selectedExercise) ? 20 : 40;

  useEffect(() => {
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
  }, [modeTimeline.mode, diapason]);

  const previousConnected = usePrevious(connected);

  if (!connected && previousConnected !== connected) {
    setSet({
      current: 1,
      selected: 1,
    });
    setModeTimeline({
      mode: ActiveMode.DEFAULT,
      startTime: 0,
      endTime: time + DEFAULT_TIME,
    });
    setFeedbackData([]);
  }

  const previousTime = usePrevious(time);

  if (time !== previousTime && connected) {
    // Обработка данных от тренажера
    if (modeTimeline.mode === ActiveMode.DEFAULT) {
      setFeedbackData((prev) => [...prev, { t: time, w: parseFloat(message) }]);
    } else if (modeTimeline.mode === ActiveMode.CHECK_MAX_WEIGHT) {
      setProgramData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [selectedExercise]: {
            ...prev[selectedDate]?.[selectedExercise],
            maxWeight: Math.max(
              prev[selectedDate]?.[selectedExercise]?.maxWeight || 0,
              parseFloat(message)
            ),
          },
        },
      }));
    } else if (modeTimeline.mode === ActiveMode.SET) {
      setProgramData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [selectedExercise]: {
            ...prev[selectedDate]?.[selectedExercise],
            [set.current]: [
              ...(prev[selectedDate]?.[selectedExercise]?.[set.current] || []),
              { t: time, w: parseFloat(message) },
            ],
          },
        },
      }));
    }
    // Обработка перехода между режимами
    if (time >= modeTimeline.endTime && connected) {
      switch (modeTimeline.mode) {
        case ActiveMode.PREPARING:
          setModeTimeline({
            mode: ActiveMode.CHECK_MAX_WEIGHT,
            startTime: time,
            endTime: time + CHECK_MAX_WEIGHT_TIME,
          });
          break;
        case ActiveMode.CHECK_MAX_WEIGHT:
          setModeTimeline({
            mode: ActiveMode.SET,
            startTime: time,
            endTime: time + (diapason === 20 ? SET_TIME : SET_TIME / 2),
          });
          break;

        case ActiveMode.SET:
          stopExercise();
          break;

        default:
          break;
      }
    }
  }

  const trainigInProgress =
    modeTimeline.mode !== ActiveMode.DEFAULT &&
    modeTimeline.mode !== ActiveMode.FINISH;

  const setCount = Object.keys(
    programData[selectedDate]?.[selectedExercise] || {}
  ).filter((key) => key !== "maxWeight").length;

  const maxWeight =
    programData[selectedDate]?.[selectedExercise]?.maxWeight || 0;

  const calculateAverageWeight = () => {
    const currentSetData =
      programData[selectedDate]?.[selectedExercise]?.[set.selected] || [];
    return currentSetData.length > 0
      ? (
          currentSetData.reduce((acc, curr) => acc + curr.w, 0) /
          currentSetData.length
        ).toFixed(1)
      : 0;
  };

  // Moving sound logic to useEffect to prevent excessive calls during render
  useEffect(() => {
    if (modeTimeline.mode === ActiveMode.SET && maxWeight > 0 && message) {
      const currentValue = Math.round((Number(message) / maxWeight) * 100);

      if (currentValue !== 0) {
        if (currentValue > (diapason + 10)) {
          soundService.play("sound_go_high");
        } 
        if (currentValue < (diapason - 10)) {
          soundService.play("sound_go_low");
        }
      }
    }
  }, [modeTimeline.mode, maxWeight, message, diapason]);

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
              {trainigInProgress ? "Завершить упражнение" : "Начать упражнение"}
            </Button>
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
              totalTime={modeTimeline.endTime - modeTimeline.startTime}
              time={modeTimeline.endTime - time}
              color={MODE_COLORS[modeTimeline.mode]}
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
              backgroundColor: (() => {
                if (modeTimeline.mode !== ActiveMode.SET) return "none";

                const currentValue =
                  maxWeight > 0
                    ? Math.round((Number(message) / maxWeight) * 100)
                    : 0;

                if (currentValue === 0) return "none";
                return Math.abs(currentValue - diapason) > 10
                  ? "rgb(120, 18, 18)"
                  : "rgb(35, 142, 39)";
              })(),
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
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
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
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
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
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

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography sx={{ color: tab === "feedback" ? "#323232" : "#666" }}>
          Обратная связь
        </Typography>
        <StyledSwitch
          checked={tab === "training"}
          onChange={(e) => setTab(e.target.checked ? "training" : "feedback")}
        />
        <Typography sx={{ color: tab === "training" ? "#323232" : "#666" }}>
          Записи тренировок
        </Typography>
      </Box>
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
              <Box sx={{ display: "flex", gap: 2 }}>
                {selectedExercise && (
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
                )}
              </Box>
            </>
          )}
          <Chart
            xAxis={xAxis}
            yAxis={yAxis}
            title={tab === "feedback" ? "Обратная связь" : title}
          />
        </Box>
      </Card>
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "center" },
          flex: { xs: "1 1 100%", md: 1 },
          mt: { xs: 3, md: 0 },
          mb: 6,
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
    </Container>
  );
}
