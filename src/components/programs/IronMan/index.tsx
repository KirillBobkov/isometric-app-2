import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
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

enum ActiveMode {
  DEFAULT = "default",
  PREPARING = "preparing",
  CHECK_MAX_WEIGHT = "check_max_weight",
  SET = "set",
  FINISHED = "finished",
}

export const SET_TIME = 12 * 1000;
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
    case ActiveMode.FINISHED:
      return "Тренировка завершена";
    default:
      return "";
  }
};

// Exercise groups
const LONG_EXERCISES = [
  "ПОДЪЕМ ШТАНГИ С ПОЛА (DEADLIFT)",
  "ПОДЕМ НА БИЦЕПС (BICEPS CURL)",
  "ПРЕСС ОТ ГРУДИ (SHOULDER PRESS)",
];
const SHORT_EXERCISES = [
  "ФРОНТАЛЬНЫЕ ВЫПАДЫ (FRONT SQUAT)",
  "ПОДЪЕМЫ НА НОСКИ (CALF RAISE)",
  "ГАНТЕЛЬНАЯ ТЯГА В НАКЛОНЕ (BENT-OVER ROW)",
];

const DEFAULT_TRAINING_DATA = [...LONG_EXERCISES, ...SHORT_EXERCISES].reduce(
  (acc, exercise) => {
    acc[exercise] = { 1: [] };
    return acc;
  },
  {} as Record<string, Record<number, any[]>>
);

const MODE_COLORS: Record<ActiveMode, string> = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.CHECK_MAX_WEIGHT]: "rgb(229, 67, 67)", // Red
  [ActiveMode.DEFAULT]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.FINISHED]: "rgb(25, 167, 255)", // Blue
};

const exercises = [
  ...LONG_EXERCISES.map((ex) => ({ value: ex, label: ex })),
  ...SHORT_EXERCISES.map((ex) => ({ value: ex, label: ex })),
];
interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}

type SetDataPoint = {
  time: number;
  weight: number;
};

export function IronMan({
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

  const [maxWeights, setMaxWeights] = useState<Record<string, number>>({});

  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + DEFAULT_TIME,
  });

  const stopExercise = async () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    setModeTimeline({ 
      mode: ActiveMode.DEFAULT,
      startTime: time,
      endTime: time + DEFAULT_TIME,
    });

    // await generateTrainingReport(trainingData, 'Железный человек');

    setMaxWeights((prev) => {
      const newMaxWeights = { ...prev };
      delete newMaxWeights[selectedExercise];
      return newMaxWeights;
    });

    await soundService.play("exersise_finished");
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
      : trainingData[selectedExercise]?.[1] || [];

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

  const diapason = LONG_EXERCISES.includes(selectedExercise) ? 20 : 40;

  useEffect(() => {
    if (modeTimeline.mode === ActiveMode.PREPARING) {
      soundService.play("prepare_with_max");
    } else if (modeTimeline.mode === ActiveMode.CHECK_MAX_WEIGHT) {
      soundService.play("start_with_max");
    } else if (modeTimeline.mode === ActiveMode.SET) {
      if (diapason === 20) {
        soundService.play("start_with_120_sec");
      } else {
        soundService.play("start_with_60_sec");
      }
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
      setFeedbackData((prev) => [
        ...prev,
        { time, weight: parseFloat(message) },
      ]);
    } else if (modeTimeline.mode === ActiveMode.CHECK_MAX_WEIGHT) {
      setMaxWeights((prev) => ({
        ...prev,
        [selectedExercise]: Math.max(
          prev[selectedExercise] || 0,
          parseFloat(message)
        ),
      }));
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
          justifyContent: { xs: "center", md: "center" },
          flex: { xs: "1 1 100%", md: 1 },
          mt: { xs: 3, md: 0 },
          mb: 6,
        }}
      >
        <FileOperations
          disabled={modeTimeline.mode !== ActiveMode.DEFAULT}
          trainingData={trainingData}
          hasData={Object.values(trainingData).some(exercise => Object.values(exercise).some(set => set.length > 0))}
          onDataRestored={(data) => {
            setTab("training");
            setTrainingData(data);
          }}
          name="Железный человек"
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
                modeTimeline.mode !== ActiveMode.DEFAULT 
              }
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
                ? "Завершить упражнение"
                : "Начать упражнение"}
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
              backgroundColor: (() => {
                if (modeTimeline.mode !== ActiveMode.SET)
                  return "none";

                const currentValue = maxWeights[selectedExercise]
                  ? Math.round(
                      (Number(message) / maxWeights[selectedExercise]) * 100
                    )
                  : 0;
                  
                if (currentValue === 0) return "none";
                return Math.abs(currentValue - diapason) > 5
                  ? "rgb(120, 18, 18)"
                  : "rgb(35, 142, 39)";
              })(),
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
                Диапазон
              </Typography>
              <Typography
                variant="h1"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {`${
                  maxWeights[selectedExercise] &&
                  modeTimeline.mode === ActiveMode.SET
                    ? Math.round(
                        (Number(message) / maxWeights[selectedExercise]) *
                          100
                      )
                    : "0"
                } %`}
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
                Измеренный максимум
              </Typography>
              <Typography
                variant="h1"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {`${maxWeights[selectedExercise]?.toFixed(1) || 0} кг`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 0, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            disabled={!connected}
            label="Реалтайм показания"
            value="feedback"
            sx={{
              borderRadius: "28px",
              marginRight: 1,
              transition: "background-color 0.3s",
              "&.Mui-selected": {
                backgroundColor: "#323232",
                color: "white",
              },
              "&:not(.Mui-selected)": {
                backgroundColor: "transparent",
              },
            }}
          />
          <Tab
            disabled={!connected}
            label="Данные тренировки"
            value="training"
            sx={{
              borderRadius: "28px",
              transition: "background-color 0.3s",
              "&.Mui-selected": {
                backgroundColor: "#323232",
                color: "white",
              },
              "&:not(.Mui-selected)": {
                backgroundColor: "transparent",
              },
            }}
          />
        </Tabs>
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
