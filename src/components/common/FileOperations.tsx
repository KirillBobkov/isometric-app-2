import { Button, Box, Tooltip } from "@mui/material";
import { Upload, FileText, Download } from "lucide-react";

import { saveTrainingData, restoreTrainingData } from "../../services/FileService";
import { generateTrainingReport } from "../../services/ReportService";

interface FileOperationsProps {
  /**
   * Флаг отключения кнопок
   */
  disabled: boolean;
  
  /**
   * Данные тренировки для сохранения или генерации отчета
   */
  trainingData: Record<string, Record<number, {time: number, weight: number}[]>>;
  
  /**
   * Флаг, указывающий есть ли данные для сохранения/отчета
   */
  hasData: boolean;
  
  /**
   * Callback вызываемый после успешного восстановления данных
   */
  onDataRestored?: (data: Record<string, Record<number, {time: number, weight: number}[]>>) => void;
  name: string;
}

/**
 * Компонент для работы с файлами тренировки (сохранение, загрузка, генерация отчета)
 */
export const FileOperations: React.FC<FileOperationsProps> = ({
  disabled,
  trainingData,
  hasData,
  onDataRestored,
  name,   
}) => {
  // Сохранение тренировки в JSON
  const handleSaveTraining = async () => {
    if (Object.keys(trainingData).length === 0) return;
    try {
      await saveTrainingData(trainingData);
    } catch (error) {
      console.error("Ошибка при сохранении тренировки:", error);
      alert("Не удалось сохранить данные тренировки");
    }
  };

  // Загрузка тренировки из файла
  const handleRestoreTraining = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const restoredData = await restoreTrainingData(file);
      if (restoredData && onDataRestored) {
        onDataRestored(restoredData);
      }
    } catch (error) {
      console.error("Ошибка при загрузке тренировки:", error);
      alert("Не удалось загрузить данные тренировки");
    }
  };

  // Генерация текстового отчета
  const handleGenerateReport = async () => {
    try {
      await generateTrainingReport(trainingData, name);
    } catch (error) {
      console.error("Ошибка при генерации отчета:", error);
      alert("Не удалось создать отчет");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "center", md: "center" },
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Tooltip
        title="Сгенерировать подробный текстовый отчет с анализом тренировки по всем подходам"
        arrow
      >
        <span> {/* Wrapper для корректной работы Tooltip с disabled кнопкой */}
          <Button
            variant="contained"
            size="large"
            startIcon={<FileText size={24} />}
            onClick={handleGenerateReport}
            disabled={disabled || !hasData}
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor: "#323232",
            }}
          >
            Скачать текстовый отчет
          </Button>
        </span>
      </Tooltip>
      
      <Tooltip
        title="Сохранится файл формата .json который можно будет загрузить при следующем сеансе и просмотреть каждый подход"
        arrow
      >
        <span>
          <Button
            variant="contained"
            size="large"
            startIcon={<Download size={24} />}
            onClick={handleSaveTraining}
            disabled={disabled || !hasData}
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor: "#323232",
            }}
          >
            Скачать тренировку
          </Button>
        </span>
      </Tooltip>

      <Tooltip
        title="Вы можете подробно на графике посмотреть свою тренировку. Загрузите сохраненную тренировку: выберите файл формата .json, в котором ранее была сохранена тренировка"
        arrow
      >
        <span>
          <Button
            component="label"
            variant="contained"
            size="large"
            startIcon={<Upload size={24} />}
            disabled={disabled}
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor: "#323232",
            }}
          >
            Загрузить тренировку
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleRestoreTraining}
            />
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};