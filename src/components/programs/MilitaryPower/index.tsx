import { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { Play, Square } from "lucide-react";

import { saveTrainingData } from "../../../services/FileService";
import { generateTrainingReport } from "../../../services/ReportService";
import { useTimer } from "../../../hooks/useTimer";
import { MilitaryPowerDescription } from "./MilitaryPowerDescription";
import { TrainingTimer } from "../../TrainingTimer";
import {
  ActiveMode,
  SetDataPoint,
  MilitaryPowerProps,
} from "../../../types/militaryPower";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { usePrevious } from "../../../hooks/usePrevious";
import { getStatusMessage } from "../../../utils/statusMessages";
import { ExerciseSelect } from "../../common/ExerciseSelect";
import { MetricCard } from "../../common/MetricCard";
import { FileOperations } from "../../common/FileOperations";
import { InfoCard } from "../../InfoCard";

const SET_COUNT = 10;
export const REST_TIME = 60000;
export const SET_TIME = 6000;
export const PREPARE_TIME = 10000;
export const DEFAULT_TIME = 31536000000;

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

interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}

const DEFAULT_TRAINING_DATA = {
  ["СТАНОВАЯ ТЯГА"]: {
    1: [],
  },
  ["ЖИМ ПЛЕЧ"]: {
    1: [],
  },
};

export function MilitaryPower({
  connected = false,
  message,
}: MilitaryPowerProps) {
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

  // Сохранение тренировки
  const saveTraining = async () => {
    if (Object.keys(trainingData).length === 0) return;

    saveTrainingData(trainingData);
  };

  const stopTraining = async () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    await Promise.all([saveTraining(), generateTrainingReport(trainingData)]);

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
      soundService.play("start");
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

      <InfoCard sx={{
        mb: 4,
        p: 2,
      }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              justifyContent: "center",
              gap: 2,
              flex: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center",  md: "flex-start" },
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
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              flex: { xs: "1 1 100%", md: 1 },
              mt: { xs: 3, md: 0 },
            }}
          >
            <FileOperations
              disabled={!connected || modeTimeline.mode !== ActiveMode.DEFAULT}
              trainingData={trainingData}
              hasData={trainingData[selectedExercise]?.[1]?.length > 0}
              onDataRestored={(data) => {
                setTab("training");
                setTrainingData(data);
              }}
            />
          </Box>
        </Box>
      </InfoCard>

      <Box sx={{ borderBottom: 0, borderColor: "divider", mb: 2 }}>
        <Tabs 
          value={tab} 
          onChange={(_, newValue) => setTab(newValue)}
          sx={{
            "& .MuiTabs-indicator": {
              display: "none"
            }
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
              }
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
              }
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
        {tab === "training" && (
          <Grid container spacing={2} sx={{ flex: 1 }}>
            <Grid item xs={12} md={12}>
              <MetricCard
                title={`${`Максимальный вес, поднятый в подходе № ${set.selected}`}`}
                value={maxWeight.toFixed(1)}
                unit="кг"
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <MetricCard
                title="Максимальный вес, поднятый за всю тренировку"
                value={maxWeightForAllSets.toFixed(1)}
                unit="кг"
              />
            </Grid>
          </Grid>
        )}

        <Box sx={{ flex: 2 }}>
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
