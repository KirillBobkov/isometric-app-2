import { useEffect, useState, useCallback } from "react";
import { Grid, Button, Container, Typography, Box } from "@mui/material";
import { Play, Square } from "lucide-react";

import { saveTrainingData } from "../../../services/FileService";
import { useTimer } from "../../../hooks/useTimer";
import { IronManDescription } from "./IronManDescription";
import { TrainingTimer } from "../../TrainingTimer";
import { ActiveMode } from "../../../types/militaryPower";
import { Chart } from "../../Chart";
import { soundService } from "../../../services/SoundService";
import { usePrevious } from "../../../hooks/usePrevious";
import { getStatusMessage } from "../../../utils/statusMessages";
import { ExerciseSelect } from "../../common/ExerciseSelect";
import { MetricCard } from "../../common/MetricCard";
import { formatTime } from "../../../utils/formatTime";

// Define constants specific to Iron Man program
const SET_COUNT = 6; // Total exercises (3 long + 3 short)
export const REST_TIME = 60000; // 1 minute rest between exercises
export const LONG_SET_TIME = 120000; // 2 minutes for long exercises
export const SHORT_SET_TIME = 60000; // 1 minute for short exercises
export const PREPARE_TIME = 10000; // 10 seconds preparation
export const FEEDBACK_TIME = 31536000000; // Large number for unlimited feedback time

// Exercise groups
const LONG_EXERCISES = ["ПОДЪЕМ ШТАНГИ С ПОЛА", "ГОЛЛАНДЦЫ", "ПРЕСС ОТ ГРУДИ"];
const SHORT_EXERCISES = ["ФРОНТАЛЬНЫЕ ВЫПАДЫ", "ПОДЪЕМЫ НА НОСКИ", "ГАНТЕЛЬНАЯ ТЯГА В НАКЛОНЕ"];

const MODE_COLORS: Record<ActiveMode, string> = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.REST]: "#4CAF50", // Green
  [ActiveMode.DEFAULT]: "rgb(25, 167, 255)", // Blue
};

// Combined exercise list for selection
const exercises = [
  ...LONG_EXERCISES.map(ex => ({ value: ex, label: ex })),
  ...SHORT_EXERCISES.map(ex => ({ value: ex, label: ex }))
];

interface ModeTimeline {
  mode: ActiveMode;
  startTime: number;
  endTime: number;
}

export interface SetDataPoint {
  time: number;
  weight: number;
}

export interface IronManProps {
  connected?: boolean;
  message?: string;
}

export function IronMan({
  connected = false,
  message = "0",
}: IronManProps) {
  const { time } = useTimer(0, !connected);

  const [trainingData, setTrainingData] = useState<
    Record<number, SetDataPoint[]>
  >({});

  const [set, setSet] = useState({
    current: -1,
    selected: -1,
  });

  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [modeTimeline, setModeTimeline] = useState<ModeTimeline>({
    mode: ActiveMode.DEFAULT,
    startTime: 0,
    endTime: Date.now() + FEEDBACK_TIME,
  });

  // Save training data
  const saveTraining = async (type: "normal" | "emergency" = "normal") => {
    if (Object.keys(trainingData).length === 0) return;

    if (type === "normal") {
      await soundService.play("finish");
    }

    const saved = await saveTrainingData({
      trainingData,
      time,
      selectedExercise,
    });

    if (saved) {
      console.log("Данные тренировки успешно сохранены");
    } else {
      console.error("Ошибка при сохранении данных тренировки");
    }
  };

  // Handle training button click
  const handleTrainingToggle = () => {
    if (!connected) {
      alert("Пожалуйста, подключите тренажер перед началом тренировки");
      return;
    }

    if (modeTimeline.mode === ActiveMode.FEEDBACK) {
      setSet({
        current: 1,
        selected: 1,
      });
      setTrainingData({});
      setModeTimeline({
        mode: ActiveMode.PREPARING,
        startTime: time,
        endTime: time + PREPARE_TIME,
      });
      return;
    }

    if (
      modeTimeline.mode === ActiveMode.SET ||
      modeTimeline.mode === ActiveMode.REST
    ) {
      saveTraining();
      setSet((prev) => ({
        ...prev,
        selected: -1,
      }));
      setModeTimeline({
        mode: ActiveMode.FEEDBACK,
        startTime: time,
        endTime: time + FEEDBACK_TIME,
      });
      return;
    }
  };

  // Get average weight for a set (Iron Man focuses on average, not max)
  const getAverageWeight = (setNumber: number) => {
    const setData = trainingData[setNumber] || [];
    if (setData.length === 0) return 0;
    
    const sum = setData.reduce((acc, point) => acc + point.weight, 0);
    return sum / setData.length;
  };

  // Get average weight for all sets
  const getOverallAverageWeight = () => {
    const allSetNumbers = Object.keys(trainingData).map(Number);
    if (allSetNumbers.length === 0 || allSetNumbers.includes(-1)) return 0;
    
    const averages = allSetNumbers.map(setNum => getAverageWeight(setNum));
    const sum = averages.reduce((acc, avg) => acc + avg, 0);
    return sum / averages.length;
  };

  // Get average weight for selected set
  const getSelectedSetAverageWeight = () => {
    return getAverageWeight(set.selected);
  };

  // Get current exercise based on set number
  const getCurrentExercise = (setNumber: number) => {
    if (setNumber <= 3) {
      return LONG_EXERCISES[setNumber - 1];
    } else {
      return SHORT_EXERCISES[setNumber - 4];
    }
  };

  // Get set duration based on set number
  const getSetDuration = (setNumber: number) => {
    return setNumber <= 3 ? LONG_SET_TIME : SHORT_SET_TIME;
  };

  // Get chart data
  const getChartData = () => {
    const data = trainingData[set.selected] || [];
    const limitedData = data.slice(-50);

    const title = set.selected === -1 
      ? "Текущие показания" 
      : `${getCurrentExercise(set.selected)} (Подход ${set.selected})`;

    return {
      xAxis: limitedData.map((data) => data.time),
      yAxis: limitedData.map((data) => data.weight),
      title,
    };
  };

  const { xAxis, yAxis, title } = getChartData();

  // Initialize sound service
  useEffect(() => {
    soundService.initialize();
  }, []);

  // Play sounds on mode changes
  const currentSet = set.current;
  useEffect(() => {
    if (modeTimeline.mode === ActiveMode.REST) {
      playSound("rest");
    } else if (modeTimeline.mode === ActiveMode.SET) {
      playSound("start");
    } else if (modeTimeline.mode === ActiveMode.PREPARING) {
      playSound("prepare");
    }
  }, [modeTimeline.mode, currentSet, playSound]);

  // Handle connection state changes
  const previousConnected = usePrevious(connected);
  useEffect(() => {
    if (!connected && previousConnected) {
      setTrainingData({});
      setSet({
        current: -1,
        selected: -1,
      });
      setModeTimeline({
        mode: ActiveMode.FEEDBACK,
        startTime: 0,
        endTime: time + FEEDBACK_TIME,
      });
    }
  }, [connected, previousConnected, time]);

  // Main training logic and state management
  const previousTime = usePrevious(time);
  useEffect(() => {
    if (time !== previousTime && connected) {
      // Process device data
      if (modeTimeline.mode === ActiveMode.FEEDBACK) {
        setTrainingData((prev) => ({
          ...prev,
          [-1]: [...(prev[-1] || []), { time, weight: parseFloat(message) }],
        }));
      } else if (modeTimeline.mode === ActiveMode.SET) {
        setTrainingData((prev) => ({
          ...prev,
          [set.current]: [
            ...(prev[set.current] || []),
            { time, weight: parseFloat(message) },
          ],
        }));
      }

      // Handle mode transitions
      if (time >= modeTimeline.endTime && connected) {
        switch (modeTimeline.mode) {
          case ActiveMode.PREPARING:
            setModeTimeline({
              mode: ActiveMode.SET,
              startTime: time,
              endTime: time + getSetDuration(set.current),
            });
            break;

          case ActiveMode.SET:
            if (set.current >= SET_COUNT) {
              setModeTimeline({
                mode: ActiveMode.FEEDBACK,
                startTime: time,
                endTime: time + FEEDBACK_TIME,
              });
              saveTraining();
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
              endTime: time + getSetDuration(set.current + 1),
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
  }, [time, previousTime, connected, message, modeTimeline.endTime, modeTimeline.mode, set.current]);

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
          flexDirection: "column",
          alignItems: "center",
          mb: 10,
          p: 2,
          mt: 12,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <ExerciseSelect
            disabled={modeTimeline.mode !== ActiveMode.FEEDBACK || !connected}
            value={selectedExercise}
            onChange={setSelectedExercise}
            exercises={exercises}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={
              modeTimeline.mode !== ActiveMode.FEEDBACK ? (
                <Square size={24} />
              ) : (
                <Play size={24} />
              )
            }
            onClick={handleTrainingToggle}
            disabled={
              !connected ||
              modeTimeline.mode === ActiveMode.PREPARING ||
              !selectedExercise
            }
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor:
                modeTimeline.mode !== ActiveMode.FEEDBACK
                  ? "#ff4444"
                  : "#4CAF50",
              "&:hover": {
                backgroundColor:
                  modeTimeline.mode !== ActiveMode.FEEDBACK
                    ? "#ff0000"
                    : "#45a049",
              },
            }}
          >
            {modeTimeline.mode !== ActiveMode.FEEDBACK
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
          {modeTimeline.mode === ActiveMode.SET && ` - ${getCurrentExercise(set.current)}`}
        </Typography>

        {modeTimeline.mode !== ActiveMode.FEEDBACK && (
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
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        <Grid container spacing={2} sx={{ flex: 1 }}>
          <Grid item xs={12} md={12}>
            <MetricCard
              title={`${
                set.selected === -1
                  ? "Средний вес в режиме обратной связи"
                  : `Средний вес в подходе № ${set.selected}`
              }`}
              value={getSelectedSetAverageWeight().toFixed(1)}
              unit="кг"
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <MetricCard
              title="Средний вес за всю тренировку"
              value={getOverallAverageWeight().toFixed(1)}
              unit="кг"
            />
          </Grid>
        </Grid>

        <Box sx={{ flex: 2 }}>
          <Chart
            xAxis={xAxis}
            yAxis={yAxis}
            title={title}
            isTrainingActive={
              modeTimeline.mode === ActiveMode.SET ||
              modeTimeline.mode === ActiveMode.REST
            }
            selectedSet={set.selected}
            onSetChange={(set) =>
              setSet((prev) => ({ ...prev, selected: set }))
            }
          />
        </Box>
      </Box>
    </Container>
  );
} 