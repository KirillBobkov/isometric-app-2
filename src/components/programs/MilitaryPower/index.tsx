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
} from "@mui/material";
import { Play, Square } from "lucide-react";

import { generateTrainingReport } from "../../../services/ReportService";
import { useTimer } from "../../../hooks/useTimer";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { usePrevious } from "../../../hooks/usePrevious";

import { ExerciseSelect } from "../../common/ExerciseSelect";
import { FileOperations } from "../../common/FileOperations";

enum ActiveMode {
  DEFAULT = "default",
  REST = "rest",
  SET = "set",
  PREPARING = "preparing",
}

interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}

type SetDataPoint = {
  time: number;
  weight: number;
};

const SET_COUNT = 10;
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
};

const exercises = [
  { value: "СТАНОВАЯ ТЯГА", label: "СТАНОВАЯ ТЯГА" },
  { value: "ЖИМ ПЛЕЧ", label: "ЖИМ ПЛЕЧ" },
];

const DEFAULT_TRAINING_DATA = {
  ["СТАНОВАЯ ТЯГА"]: {
    1: [],
  },
  ["ЖИМ ПЛЕЧ"]: {
    1: [],
  },
};

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
        opacity: 1
      }
    }
  },
  "& .MuiSwitch-thumb": {
    width: 26,
    height: 26,
    backgroundColor: "#fff"
  },
  "& .MuiSwitch-track": {
    borderRadius: 24,
    backgroundColor: "#323232",
    opacity: 1
  }
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

  const [trainingData, setTrainingData] = useState<
    Record<string, Record<number, SetDataPoint[]>>
  >(DEFAULT_TRAINING_DATA);

  const [feedbackData, setFeedbackData] = useState<SetDataPoint[]>([]);

  const [tab, setTab] = useState<"feedback" | "training">("feedback");

  const [set, setSet] = useState({
    current: 1,
    selected: 1,
  });

  const [selectedExercise, setSelectedExercise] = useState<string>("");

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

    await generateTrainingReport(trainingData, "Солдатская мощь");

    await soundService.play("finish");

    setModeTimeline({
      mode: ActiveMode.DEFAULT,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });
  };

  const startTraining = () => {
    if (!connected) return;

    setTab("training");
    setTrainingData(DEFAULT_TRAINING_DATA);
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
      : trainingData[selectedExercise]?.[set.selected] || [];

  const maxWeight =
    dataForRender.length > 0
      ? dataForRender.reduce((max, point) => Math.max(max, point.weight), 0)
      : 0;

  const maxWeightForAllSets =
    Object.values(trainingData)
      .flatMap((sets) => Object.values(sets))
      .flat().length > 0
      ? Object.values(trainingData)
          .flatMap((sets) => Object.values(sets))
          .flat()
          .reduce((max, point) => Math.max(max, point.weight), 0)
      : 0;

  // Получение данных для графика
  const getTrainingChartData = () => {
    const limitedData = dataForRender.slice(-50);
    return {
      xAxis: limitedData.map((data) => data.time),
      yAxis: limitedData.map((data) => data.weight),
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
    // Обработка данных от тренажера
    if (modeTimeline.mode === ActiveMode.DEFAULT) {
      setFeedbackData((prev) => [
        ...prev,
        { time, weight: parseFloat(message) },
      ]);
    } else if (modeTimeline.mode === ActiveMode.SET) {
      setTrainingData((prev) => ({
        ...prev,
        [selectedExercise]: {
          ...prev[selectedExercise],
          [set.current]: [
            ...(prev[selectedExercise][set.current] || []),
            { time, weight: parseFloat(message) },
          ],
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
              mode: ActiveMode.DEFAULT,
              startTime: time,
              endTime: time + DEFAULT_TIME,
            });
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
          trainingData={trainingData}
          hasData={Object.values(trainingData).some((exercise) =>
            Object.values(exercise).some((set) => set.length > 0)
          )}
          onDataRestored={(data) => {
            setTab("training");
            setTrainingData(data);
          }}
          name="Солдатская мощь"
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
              disabled={modeTimeline.mode !== ActiveMode.DEFAULT || !connected}
              value={selectedExercise}
              onChange={setSelectedExercise}
              exercises={exercises}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={
                modeTimeline.mode !== ActiveMode.DEFAULT ? (
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
                  modeTimeline.mode !== ActiveMode.DEFAULT
                    ? "#ff4444"
                    : "#4CAF50",
                "&:hover": {
                  backgroundColor:
                    modeTimeline.mode !== ActiveMode.DEFAULT
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

          {modeTimeline.mode !== ActiveMode.DEFAULT && (
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

      <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2, alignItems: "center" }}>
        <Typography sx={{ color: tab === "feedback" ? "#323232" : "#666" }}>
          Обратная связь
        </Typography>
        <StyledSwitch
          disabled={!connected}
          checked={tab === "training"}
          onChange={(e) => setTab(e.target.checked ? "training" : "feedback")}
        />
        <Typography sx={{ color: tab === "training" ? "#323232" : "#666" }}>
          Тренировка
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        <Box sx={{ flex: 1 }}>
          {tab === "training" && (
            <Chart
              xAxis={xAxis}
              yAxis={yAxis}
              title={title}
              sets={
                Object.keys(trainingData[selectedExercise] ?? {})?.length ?? 1
              }
              selectedSet={set.selected}
              onSetChange={(set) =>
                setSet((prev) => ({ ...prev, selected: set }))
              }
            />
          )}
          {tab === "feedback" && (
            <Chart
              xAxis={feedbackData.map((d) => d.time)}
              yAxis={feedbackData.map((d) => d.weight)}
              title="Обратная связь"
              sets={1}
              selectedSet={1}
              onSetChange={() => {}}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
}
