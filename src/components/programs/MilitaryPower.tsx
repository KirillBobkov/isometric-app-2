import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import {
  Grid,
  Collapse,
  Button,
  Container,
  Typography,
  Box,
} from "@mui/material";
import { InfoCard } from "../InfoCard";
import { formatTime } from "../../utils/formatTime";
import { ArrowLeftIcon, Play, Square } from 'lucide-react';

import { saveTrainingData } from "../../services/FileService";
import { REST_TIME, SET_TIME } from '../../constants/militaryPower';
import { useTimer } from '../../hooks/useTimer';
import { MilitaryPowerDescription } from './MilitaryPowerDescription';
import { TrainingTimer } from '../TrainingTimer';
import { ActiveMode, SetData, SetDataPoint, MilitaryPowerProps } from '../../types/militaryPower';
import { Chart } from '../Chart';

export function MilitaryPower({ connected, message }: MilitaryPowerProps) {
  const navigate = useNavigate(); // Получаем объект history

  const handleBack = () => {
    navigate('/');  // Перенаправляем на главную страницу
  };

  const { time: currentTime, reset: resetCurrentTime } = useTimer();

  // Состояние для управления видимостью блока
  const [isContentVisible, setIsContentVisible] = useState(false);

  const [currentSet, setCurrentSet] = useState(1);

  const [chartData, setChartData] = useState<Record<number, SetDataPoint[]>>({});
  const [currentData, setCurrentData] = useState<SetData[]>([]);

  const [selectedSet, setSelectedSet] = useState<number>(1);
 
  const [activeMode, setActiveMode] = useState<ActiveMode>(ActiveMode.FEEDBACK);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(REST_TIME);
  const [setTime, setSetTime] = useState(SET_TIME);
    // Функция для переключения видимости блока и текста кнопки
  const toggleContentVisibility = () => setIsContentVisible((prevState) => !prevState);

  // Заменяем useEffect для currentTime и currentData на один эффект
  useEffect(() => {
    if (!connected) {
      resetCurrentTime();
      setCurrentData([]);
      return;
    }

    if (activeMode === ActiveMode.FEEDBACK) {
      setCurrentData(prev => {
        const newData = [...prev, {
          time: currentTime,
          weight: parseFloat(message),
        }];
        return newData;
      });
    }
  }, [currentTime, activeMode, connected, resetCurrentTime]);

  // Эффект для обновления данных графика
  useEffect(() => {
    if (activeMode !== ActiveMode.TRAINING || !connected) return;

    if (isResting) {
      return;
    }

    setChartData(prev => {
      const currentSetData = prev[currentSet] || [];
      const newSetData = [...currentSetData, {
        time: currentTime,
        weight: parseFloat(message)
      }];

      return {
        ...prev,
        [currentSet]: newSetData
      };
    });
  }, [currentTime, activeMode, isResting, connected, currentSet]);


  // Эффект для отслеживания времени подхода
  useEffect(() => {
    if (activeMode !== ActiveMode.TRAINING || !connected) return;

    const totalTimePerSet = SET_TIME + REST_TIME;
    const currentSetNumber = Math.floor(currentTime / totalTimePerSet) + 1;
    const timeWithinSet = currentTime % totalTimePerSet;
    
    if (currentSetNumber !== currentSet && currentSetNumber <= 10) {
      setCurrentSet(currentSetNumber);
      setSelectedSet(currentSetNumber);
    }

    if (currentSetNumber > 10) {
      setActiveMode(ActiveMode.FEEDBACK);
      return;
    }

    const isInRestPhase = timeWithinSet >= SET_TIME;
    setIsResting(isInRestPhase);

    if (isInRestPhase) {
      setRestTime(totalTimePerSet - timeWithinSet);
    } else {
      setSetTime(SET_TIME - timeWithinSet);
    }
  }, [currentTime, activeMode, connected, currentSet]);

  // Добавляем функцию для сохранения данных тренировки
  const saveTraining = async () => {
    if (Object.keys(chartData).length === 0) return;

    const saved = await saveTrainingData({
      chartData,
      currentTime,
    });

    if (saved) {
      console.log('Данные тренировки успешно сохранены');
    } else {
      console.error('Ошибка при сохранении данных тренировки');
    }
  };

  // Обновляем handleTrainingToggle
  const handleTrainingToggle = () => {
    if (!connected) {
      alert('Пожалуйста, подключите тренажер перед началом тренировки');
      return;
    }
    
    if (activeMode !== ActiveMode.TRAINING) {
      resetCurrentTime();
      setCurrentSet(1);
      setChartData({}); 
      setCurrentData([]);
      setSetTime(SET_TIME);
      setRestTime(REST_TIME);
      setIsResting(false);
      setSelectedSet(1);
      setActiveMode(ActiveMode.TRAINING);
    } else {
      saveTraining();
      resetCurrentTime();
      setActiveMode(ActiveMode.FEEDBACK);
    }
  };

  // Добавляем эффект для сохранения при завершении всех подходов
  useEffect(() => {
    if (currentSet === 10 && activeMode === ActiveMode.TRAINING) {
      saveTraining();
    }
  }, [currentSet, activeMode]);

  // Определяем данные для отображения на графике
  const getChartData = () => {
    if (activeMode === ActiveMode.FEEDBACK) {
      const limitedCurrentData = currentData.slice(-50);
      return {
        xAxis: limitedCurrentData.map(data => data.time),
        yAxis: limitedCurrentData.map(data => data.weight),
        title: 'Текущие показания'
      };
    }
    
    const selectedSetData = chartData[selectedSet] || [];
    return {
      xAxis: selectedSetData.map(data => data.time),
      yAxis: selectedSetData.map(data => data.weight),
      title: `Подход ${selectedSet}`
    };
  };

  const { xAxis, yAxis, title } = getChartData();

  // Функция для получения максимального веса
  const getMaxWeight = () => {
    if (activeMode !== ActiveMode.TRAINING) return 0;
    
    return Object.values(chartData)
      .flat()
      .reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Функция для получения максимального веса выбранного подхода
  const getMaxWeightForSelectedSet = () => {
    if (activeMode !== ActiveMode.TRAINING) return 0;
    
    const setData = chartData[selectedSet] || [];
    return setData.reduce((max, point) => Math.max(max, point.weight), 0);
  };

  // Обновляем информационное сообщение
  const getStatusMessage = () => {
    if (!connected) return 'Подключите тренажер для начала тренировки';
    switch (activeMode) {
      case ActiveMode.BEFORE_START:
        return 'Нажмите кнопку "Начать тренировку" для старта';
      case ActiveMode.TRAINING:
        return isResting 
          ? 'Отдохните перед следующим подходом'
          : 'Выполняйте упражнение с максимальным усилием';
      case ActiveMode.FEEDBACK:
        return 'Режим обратной связи';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      <Button
        variant="text" // Прозрачная кнопка
        color="inherit" // Цвет текста кнопки
        onClick={handleBack}
        sx={{ position: 'absolute', top: 90, left: 16, display: 'flex', alignItems: 'center' }} // Позиционируем кнопку
      >
        <ArrowLeftIcon /> {/* Иконка стрелки с отступом справа */}
        Вернуться
      </Button>

      {/* Главный заголовок */}
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ p: "1 2", fontWeight: "bold", textTransform: "uppercase" }}
        gutterBottom
      >
        Солдатская мощь (Military Power)
      </Typography>

      {/* Кнопка показать/скрыть описание */}
      <Button
        variant="text" // Прозрачная кнопка
        color="inherit"
        onClick={toggleContentVisibility}
        sx={{
          display: "block",
          m: "0 auto",
          opacity: 0.5,
          mb: 3,
          borderRadius: "50",
          backgroundColor: "transparent", // Прозрачный фон
          border: "none", // Убираем рамку
          justifyContent: "space-between", // Размещаем текст и иконку по разные стороны
          "&:hover": {
            backgroundColor: "transparent", // Прозрачный фон
          },
        }}
      >
        {/* Текст кнопки */}
        {isContentVisible ? "Скрыть описание" : "Показать описание"}
      </Button>
      <Collapse in={isContentVisible} timeout="auto">
        <MilitaryPowerDescription />
      </Collapse>

      {/* Добавляем кнопку после описания и перед графиками */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mb: 10,
        p: 2,
        mt: 12,
        gap: 2
      }}>
        {/* Существующая кнопка и таймер */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap',
          flexDirection: 'column',
          gap: 3
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={activeMode === ActiveMode.TRAINING ? <Square size={24} /> : <Play size={24} />}
            onClick={handleTrainingToggle}
            disabled={!connected}
            sx={{
              borderRadius: '28px',
              padding: '12px 32px',
              backgroundColor: activeMode === ActiveMode.TRAINING ? '#ff4444' : '#4CAF50',
              '&:hover': {
                backgroundColor: activeMode === ActiveMode.TRAINING ? '#ff0000' : '#45a049'
              }
            }}
          >
            {activeMode === ActiveMode.TRAINING ? 'Остановить тренировку' : 'Начать тренировку'}
          </Button>
 
          {activeMode === ActiveMode.TRAINING && (
            <TrainingTimer
              isResting={isResting}
              restTime={restTime}
              setTime={setTime}
              currentSet={currentSet}
              REST_TIME={REST_TIME}
              SET_TIME={SET_TIME}
            />
          )}
        </Box>

        {/* Новое информационное сообщение */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: '600px',
            padding: '8px 16px',
            borderRadius: '8px',
            mb: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}
        >
          {getStatusMessage()}
        </Typography>
      </Box>

      <Grid container spacing={4} mb={4}>
        {/* Первая ячейка: Текущее время */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
            {activeMode === ActiveMode.TRAINING ? "Общее время тренировки" : "Режим обратной связи"}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {formatTime(currentTime)}
            </Typography>
          </InfoCard>
        </Grid>

        {/* Ячейка для максимального веса выбранного подхода */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
              Максимальный вес в подходе № {selectedSet}
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${getMaxWeightForSelectedSet().toFixed(1)} кг`}
            </Typography>
          </InfoCard>
        </Grid>

        {/* Ячейка для максимального общего веса */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Typography align="center" variant="body2" color="text.secondary">
              Максимальный вес за всю тренировку
            </Typography>
            <Typography variant="h1" align="center" sx={{ fontWeight: "bold" }}>
              {`${getMaxWeight().toFixed(1)} кг`}
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
      {/* График */}
      <Grid item xs={12} md={3}>
        <Chart
          xAxis={xAxis}
          yAxis={yAxis}
          title={title}
          isTrainingActive={activeMode === ActiveMode.TRAINING}
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
        />
      </Grid>
    </Container>
  );
}
