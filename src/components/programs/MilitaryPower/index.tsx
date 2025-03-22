import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Button, Container, Typography, Box } from "@mui/material";
import { ArrowLeftIcon } from "lucide-react";

import { saveTrainingData } from "../../../services/FileService";
import { useTimer } from "../../../hooks/useTimer";
import { MilitaryPowerDescription } from "./components/MilitaryPowerDescription";
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
import { TrainingControlButton } from "../../common/TrainingControlButton";
import { StatusMessage } from "../../common/StatusMessage";
import { MetricCard } from "../../common/MetricCard";
import { formatTime } from "../../../utils/formatTime";

const SET_COUNT = 10;
export const REST_TIME = 60000;
export const SET_TIME = 10000;
export const PREPARE_TIME = 10000;

const MODE_COLORS: Record<ActiveMode, string> = {
  [ActiveMode.PREPARING]: "rgb(25, 167, 255)", // Blue
  [ActiveMode.SET]: "rgb(229, 67, 67)", // Red
  [ActiveMode.REST]: "#4CAF50", // Green
  [ActiveMode.FEEDBACK]: "rgb(25, 167, 255)", // Blue
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

export function MilitaryPower({
  connected = false,
  message,
}: MilitaryPowerProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

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
    mode: ActiveMode.FEEDBACK,
    startTime: 0,
    endTime: Date.now() + 31536000000,
  });

  const playSound = useCallback(async (soundKey: any) => {
    try {
      await soundService.play(soundKey);
    } catch (err) {
      console.warn(`Could not play ${soundKey} sound:`, err);
    }
  }, []);

  // Сохранение тренировки
  const saveTraining = async () => {
    if (Object.keys(trainingData).length === 0) return;

    await soundService.play("finish");

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

  // Обработка нажатия на кнопку тренировки
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
        endTime: time + 31536000000, // 1 год в миллисекундах (365 дней * 24 часа * 60 минут * 60 секунд * 1000)
      });
      return;
    }
  };

  // Получение максимального веса
  const getMaxWeight = () => {
    if (
      modeTimeline.mode !== ActiveMode.SET &&
      modeTimeline.mode !== ActiveMode.REST
    )
      return 0;

    return Object.values(trainingData)
      .flat()
      .reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Получение максимального веса для выбранного подхода
  const getMaxWeightForSelectedSet = () => {
    const setData = trainingData[set.selected] || [];
    return setData.reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Получение данных для графика
  const getChartData = () => {
    const setIndex = set.selected;
    const data = trainingData[setIndex] || [];
    const limitedData = data.slice(-50);

    return {
      xAxis: limitedData.map((data) => data.time),
      yAxis: limitedData.map((data) => data.weight),
      title:
        modeTimeline.mode === ActiveMode.FEEDBACK
          ? "Текущие показания"
          : `Подход ${set.selected}`,
    };
  };

  const { xAxis, yAxis, title } = getChartData();

  useEffect(() => {
    soundService.initialize();
  }, []);

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

  const previousConnected = usePrevious(connected);

  if (!connected && previousConnected !== connected) {
    setTrainingData({});
    setSet({
      current: -1,
      selected: -1,
    });
    setModeTimeline({
      mode: ActiveMode.FEEDBACK,
      startTime: 0,
      endTime: Date.now() + 31536000000,
    });
  }

  const previousTime = usePrevious(time);

  if (time !== previousTime && connected) {
    // Обработка данных от тренажера
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

    // Обработка перехода между режимами
    if (time >= modeTimeline.endTime) {
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
            saveTraining();
            setModeTimeline({
              mode: ActiveMode.FEEDBACK,
              startTime: time,
              endTime: time,
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
      <Button
        variant="text"
        color="inherit"
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: 90,
          left: 16,
          display: "flex",
          alignItems: "center",
        }}
      >
        <ArrowLeftIcon />
        Вернуться
      </Button>

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

          <TrainingControlButton
            isActive={modeTimeline.mode !== ActiveMode.FEEDBACK}
            disabled={
              !connected ||
              modeTimeline.mode === ActiveMode.PREPARING ||
              !selectedExercise
            }
            onClick={handleTrainingToggle}
          />
        </Box>

        <StatusMessage
          message={getStatusMessage(modeTimeline.mode, connected)}
        />

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
              title="Тренажер подключен, время:"
              value={formatTime(time)}
              unit=""
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <MetricCard
              title={`${
                set.selected === -1
                  ? "Максимальный вес, поднятый в режиме обратной связи"
                  : `Максимальный вес, поднятый в подходе № ${set.selected}`
              }`}
              value={getMaxWeightForSelectedSet().toFixed(1)}
              unit="кг"
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <MetricCard
              title="Максимальный вес, поднятый за всю тренировку"
              value={getMaxWeight().toFixed(1)}
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
