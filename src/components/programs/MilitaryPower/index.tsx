import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { Play, Square } from "lucide-react";

import { useTimer } from "../../../hooks/useTimer";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { usePrevious } from "../../../hooks/usePrevious";

import { ExerciseSelect } from "../../common/ExerciseSelect";
import { FileOperations } from "../../common/FileOperations";
import {
  ProgramData,
  SetDataPoint,
  ExerciseData,
} from "../../../services/FileService";
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

export const getStatusMessage = (
  mode: ActiveMode,
  isConnected: boolean
): string => {
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

const defaultMilitaryPowerData: ProgramData = {
  [currentDay]: {
    MILITARY_DEADLIFT: { 1: [] },
    MILITARY_SHOULDER_PRESS: { 1: [] },
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
  const [programData, setProgramData] = useState<ProgramData>(() => {
    const storedData = StorageService.getProgramData("MILITARY_POWER");
    return Object.keys(storedData || {}).length > 0
      ? storedData
      : defaultMilitaryPowerData;
  });

  const [feedbackData, setFeedbackData] = useState<SetDataPoint[]>([]);
  const [tab, setTab] = useState<"feedback" | "training">("feedback");
  const [set, setSet] = useState({
    current: 1,
    selected: 1,
  });
  const [selectedExercise, setSelectedExercise] = useState<
    "MILITARY_DEADLIFT" | "MILITARY_SHOULDER_PRESS" | ""
  >("");

  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });

  const stopTraining = async () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    StorageService.updateProgramData("MILITARY_POWER", programData);

    setModeTimeline({
      mode: ActiveMode.FINISH,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });
  };

  const startTraining = () => {
    if (!connected) return;

    setTab("training");
    setProgramData(defaultMilitaryPowerData);
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

  const dataForRender =
    tab === "feedback"
      ? feedbackData
      : selectedExercise !== ""
      ? programData[selectedDate]?.[selectedExercise]?.[set.selected] || []
      : [];

  const maxWeight =
    dataForRender.length > 0
      ? dataForRender.reduce(
          (max: number, point: SetDataPoint) => Math.max(max, point.weight),
          0
        )
      : 0;

  const exerciseData =
    selectedExercise !== ""
      ? programData[selectedDate]?.[selectedExercise] || {}
      : ({} as ExerciseData);
  const allSetData: SetDataPoint[] = Object.values(exerciseData).reduce(
    (acc: SetDataPoint[], dataSet: SetDataPoint[]) => {
      return acc.concat(dataSet);
    },
    []
  );

  const maxWeightForAllSets =
    allSetData.length > 0
      ? allSetData.reduce(
          (max: number, point: SetDataPoint) => Math.max(max, point.weight),
          0
        )
      : 0;

  // Получение данных для графика
  const getTrainingChartData = () => {
    const limitedData = dataForRender.slice(-50);
    return {
      xAxis: limitedData.map((data: SetDataPoint) => data.time),
      yAxis: limitedData.map((data: SetDataPoint) => data.weight),
      title: `Подход ${set.selected}`,
    };
  };

  const { xAxis, yAxis, title } = getTrainingChartData();

  useEffect(() => {
    soundService.initialize();
  }, []);

  const currentSet = set.current;
  useEffect(() => {
    if (modeTimeline.mode === ActiveMode.REST) {
      soundService.play("rest");
    } else if (modeTimeline.mode === ActiveMode.SET) {
      soundService.play("start_with_max");
    } else if (modeTimeline.mode === ActiveMode.PREPARING) {
      soundService.play("prepare");
    } else if (modeTimeline.mode === ActiveMode.FINISH) {
      soundService.play("finish");
    }
  }, [modeTimeline.mode, currentSet]);

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
      setFeedbackData((prev) => [
        ...prev,
        { time, weight: parseFloat(message) },
      ]);
    } else if (modeTimeline.mode === ActiveMode.SET && selectedExercise) {
      setProgramData((prev) => {
        const currentExercise = prev[selectedDate]?.[selectedExercise] || {};
        const currentSet = currentExercise[set.current] || [];

        return {
          ...prev,
          [selectedDate]: {
            ...prev[selectedDate],
            [selectedExercise]: {
              ...currentExercise,
              [set.current]: [
                ...currentSet,
                { time, weight: parseFloat(message) },
              ],
            },
          },
        };
      });
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
            StorageService.updateProgramData("MILITARY_POWER", programData);
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
          justifyContent: { xs: "center", md: "center" },
          flex: { xs: "1 1 100%", md: 1 },
          mt: { xs: 3, md: 0 },
          mb: 6,
        }}
      >
        <FileOperations
          disabled={modeTimeline.mode !== ActiveMode.DEFAULT}
          programData={programData}
          hasData={Object.values(programData || {}).some(
            (exercise: Record<string, any>) =>
              exercise &&
              Object.values(exercise).some(
                (setData: any[]) => setData && setData.length > 0
              )
          )}
          onDataRestored={(data) => {
            setTab("training");
            setSelectedExercise(
              "" as "" | "MILITARY_DEADLIFT" | "MILITARY_SHOULDER_PRESS"
            );
            setProgramData(data);
          }}
          programKey="MILITARY_POWER"
        />
      </Box>

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
              disabled={
                modeTimeline.mode !== ActiveMode.DEFAULT &&
                modeTimeline.mode !== ActiveMode.FINISH
              }
              value={selectedExercise}
              onChange={(value) =>
                setSelectedExercise(
                  value as "" | "MILITARY_DEADLIFT" | "MILITARY_SHOULDER_PRESS"
                )
              }
              exercises={[
                { value: "MILITARY_DEADLIFT", label: "СТАНОВАЯ ТЯГА" },
                { value: "MILITARY_SHOULDER_PRESS", label: "ЖИМ ПЛЕЧ" },
              ]}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={
                modeTimeline.mode !== ActiveMode.DEFAULT &&
                modeTimeline.mode !== ActiveMode.FINISH ? (
                  <Square size={24} />
                ) : (
                  <Play size={24} />
                )
              }
              onClick={() => {
                if (
                  modeTimeline.mode === ActiveMode.SET ||
                  modeTimeline.mode === ActiveMode.REST
                ) {
                  stopTraining();
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
                backgroundColor:
                  modeTimeline.mode !== ActiveMode.DEFAULT &&
                  modeTimeline.mode !== ActiveMode.FINISH
                    ? "#ff4444"
                    : "#4CAF50",
                "&:hover": {
                  backgroundColor:
                    modeTimeline.mode !== ActiveMode.DEFAULT &&
                    modeTimeline.mode !== ActiveMode.FINISH
                      ? "#ff0000"
                      : "#45a049",
                },
              }}
            >
              {modeTimeline.mode !== ActiveMode.DEFAULT
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

          {modeTimeline.mode !== ActiveMode.DEFAULT &&
            modeTimeline.mode !== ActiveMode.FINISH && (
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
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
              <Typography
                variant="h1"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {`${maxWeight.toFixed(1)} кг`}
              </Typography>
            </CardContent>
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
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
              <Typography
                variant="h1"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {`${maxWeightForAllSets.toFixed(1)} кг`}
              </Typography>
            </CardContent>
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
          Тренировка
        </Typography>
      </Box>

      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "column" },
          gap: 0,
          p: 2,
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
                        value={selectedDate}
                        label="Выберите дату"
                        onChange={(e) =>
                          setSelectedDate(Number(e.target.value))
                        }
                        size="small"
                      >
                        {Object.keys(programData)
                          .map(Number)
                          .map((date) => (
                            <MenuItem key={date} value={date}>
                              {new Date(date).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    {Object.keys(
                      programData[selectedDate]?.[selectedExercise] || {}
                    ).length > 1 && (
                      <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="set-select-label">
                          Выберите запись подхода
                        </InputLabel>
                        <Select
                          labelId="set-select-label"
                          value={set.selected}
                          label="Посмотреть запись подхода"
                          onChange={(e) =>
                            setSet((prev) => ({
                              ...prev,
                              selected: Number(e.target.value),
                            }))
                          }
                          size="small"
                        >
                          {new Array(
                            Object.keys(
                              programData[selectedDate]?.[selectedExercise] ||
                                {}
                            ).length
                          )
                            .fill(0)
                            .map((_, index) => (
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
            <Chart
              xAxis={feedbackData.map((d) => d.time)}
              yAxis={feedbackData.map((d) => d.weight)}
              title="Обратная связь"
            />
          )}
        </Box>
      </Card>
    </Container>
  );
}
