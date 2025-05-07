import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  Switch,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import { Play, Square } from "lucide-react";

import { useTimer } from "../../../hooks/useTimer";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { usePrevious } from "../../../hooks/usePrevious";
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
}

interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}

export const REST_TIME = 60000;
export const SET_TIME = 6000;
export const PREPARE_TIME = 10000;
export const DEFAULT_TIME = 31536000000;

const getStatusMessage = (mode: ActiveMode, isConnected: boolean): string => {
  if (!isConnected) return "Подключите тренажер для начала тренировки";

  switch (mode) {
    case ActiveMode.PREPARING:
      return "Приготовьтесь, тренировка сейчас начнется";
    case ActiveMode.REST:
      return "Подход закончен, отдохните перед следующим подходом";
    case ActiveMode.SET:
      return "Выполняйте упражнение с максимальным усилием";
    case ActiveMode.DEFAULT:
      return "Если вы готовы, то выберите упражнение и нажмите на кнопку 'Начать тренировку'";
    default:
      return "";
  }
};

const MODE_COLORS: Record<ActiveMode, string> = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.REST]: "#4CAF50", // Green
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

export function MilitaryPower({
  connected = false,
  message,
}: {
  connected: boolean;
  message: any;
}) {
  const freezeTime = !connected;
  const { time } = useTimer(0, freezeTime);

  const [selectedDate, setSelectedDate] = useState<number>(currentDay);
  const [programData, setProgramData] = useState<ProgramData>(DEFAULT_MILITARY_POWER_DATA);

  useEffect(() => {
    const loadProgramData = async () => {
      const storedData = await StorageService.getProgramData("MILITARY_POWER");
      setProgramData(mergeData(storedData, DEFAULT_MILITARY_POWER_DATA));
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
    "SHOULDER_PRESS" | "DEADLIFT"
  >("DEADLIFT");

  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });

  const stopTraining = async () => {
    if (!connected) {
      return;
    }

    StorageService.saveProgramData("MILITARY_POWER", programData);

    setModeTimeline({
      mode: ActiveMode.FINISH,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });
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

  const handleExerciseChange = (value: string) => {
    setSelectedExercise(value as "SHOULDER_PRESS" | "DEADLIFT");
    setTab("training");
  };

  const handleTrainingButton = () =>
    trainigInProgress ? stopTraining() : startTraining();

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTab(event.target.checked ? "training" : "feedback");
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

  const onRestore = (data: ProgramData) => {
    setTab("training");
    setProgramData(mergeData(data, DEFAULT_MILITARY_POWER_DATA));
  };

  const dataForRender =
    tab === "feedback"
      ? feedbackData
      : programData[selectedDate]?.[selectedExercise]?.[set.selected] || [];

  const maxWeight =
    dataForRender.length > 0
      ? dataForRender.reduce(
          (max: number, point: SetDataPoint) => Math.max(max, point.w),
          0
        )
      : 0;

  const exerciseData = programData[selectedDate]?.[selectedExercise] || {};

  const allSetData: SetDataPoint[] = Object.values(exerciseData).reduce(
    (acc: SetDataPoint[], dataSet: SetDataPoint[]) => {
      return acc.concat(dataSet);
    },
    []
  );

  const maxWeightForAllSets =
    allSetData.length > 0
      ? allSetData.reduce(
          (max: number, point: SetDataPoint) => Math.max(max, point.w),
          0
        )
      : 0;

  // Получение данных для графика
  const getTrainingChartData = () => {
    return {
      xAxis: dataForRender.map((data: SetDataPoint) => data.t),
      yAxis: dataForRender.map((data: SetDataPoint) => data.w),
      title: `Подход ${set.selected}`,
    };
  };

  const { xAxis, yAxis, title } = getTrainingChartData();

  useEffect(() => {
    soundService.initialize();
  }, []);

  useEffect(() => {
    if (modeTimeline.mode === ActiveMode.REST) {
      soundService.play("sound_rest_60_sec");
    } else if (modeTimeline.mode === ActiveMode.SET) {
      soundService.play("sound_start_with_max");
    } else if (modeTimeline.mode === ActiveMode.PREPARING) {
      soundService.play("sound_prepare");
    } else if (modeTimeline.mode === ActiveMode.FINISH) {
      soundService.play("sound_training_finish");
    }
  }, [modeTimeline.mode]);

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
    if (modeTimeline.mode === ActiveMode.DEFAULT) {
      setFeedbackData((prev) => [...prev, { t: time, w: parseFloat(message) }]);
    } else if (modeTimeline.mode === ActiveMode.SET) {
      setProgramData((prev) => ({
        ...prev,
        [selectedDate]: {
          ...(prev[selectedDate] || {}),
          [selectedExercise]: {
            ...(prev[selectedDate]?.[selectedExercise] || {}),
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
            mode: ActiveMode.SET,
            startTime: time,
            endTime: time + PREPARE_TIME,
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
    }
  }

  const trainigInProgress =
    modeTimeline.mode !== ActiveMode.DEFAULT &&
    modeTimeline.mode !== ActiveMode.FINISH;

  const setCount = Object.keys(
    programData[selectedDate]?.[selectedExercise] || {}
  ).length;

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
              {trainigInProgress
                ? "Остановить тренировку"
                : "Начать тренировку"}
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
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 1 }}
            >
              Максимальный вес, поднятый в подходе № {set.selected}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${maxWeight.toFixed(1)} кг`}
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
              Максимальный вес, поднятый за всю тренировку
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${maxWeightForAllSets.toFixed(1)} кг`}
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
        <Typography sx={{ color: tab === "feedback" ? "#ffffff" : "#666" }}>
          Обратная связь
        </Typography>
        <StyledSwitch checked={tab === "training"} onChange={handleTabChange} />
        <Typography sx={{ color: tab === "training" ? "#ffffff" : "#666" }}>
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
                )}
              </Box>
              <Chart xAxis={xAxis} yAxis={yAxis} title={title} />
            </>
          )}
          {tab === "feedback" && (
            <Chart xAxis={xAxis} yAxis={yAxis} title="Обратная связь" />
          )}
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
          programKey="MILITARY_POWER"
          disabled={trainigInProgress}
          onDataRestored={onRestore}
        />
      </Box>
    </Container>
  );
}
