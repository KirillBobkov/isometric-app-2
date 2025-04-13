import { Button, Box, Tooltip } from "@mui/material";
import { Upload, Download } from "lucide-react";
import { ProgramKey } from "../../services/types";
import { TrainingData } from "../../services/types";
import { ProgramData } from "../../services/types";
import { FileService } from "../../services/FileService";
import { LocalStorageService } from "../../services/LocalStorageService";

interface FileOperationsProps {
  /**
   * Флаг отключения кнопок
   */
  disabled: boolean;
  
  /**
   * Callback вызываемый после успешного восстановления данных
   */
  onDataRestored?: (data: ProgramData) => void;
  programKey: ProgramKey;
}

/**
 * Компонент для работы с файлами тренировки (сохранение, загрузка, генерация отчета)
 */
export const FileOperations: React.FC<FileOperationsProps> = ({
  disabled,
  onDataRestored,
  programKey,   
}) => {
  // Сохранение тренировки в JSON
  const handleSaveTraining = async () => {
    try {
      const data = LocalStorageService.getData();
      if (!data) {
        return;
      }
      await FileService.saveToFile(data);
    } catch (error) {
      console.error("Ошибка при сохранении тренировки:", error);
    }
  };

  // Загрузка тренировки из файла
  const handleRestoreTraining = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const restoredData = await FileService.loadFromFile(file);
      if (restoredData && onDataRestored) {
        const programData = (restoredData as TrainingData)[programKey] || {};
        onDataRestored(programData);
      }
    } catch (error) {
      console.error("Ошибка при загрузке тренировки:", error);
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
        title="Сохранится файл формата .json который можно будет загрузить при следующем сеансе и просмотреть каждый день, упражнение и подход"
        arrow
      >
        <span>
          <Button
            variant="contained"
            size="large"
            startIcon={<Download size={24} />}
            onClick={handleSaveTraining}
            disabled={disabled}
            sx={{
              borderRadius: "28px",
              padding: "12px 32px",
              backgroundColor: "#323232",
            }}
          >
            Скачать историю
          </Button>
        </span>
      </Tooltip>

      <Tooltip
        title="Вы можете подробно на графике посмотреть свою тренировку. Загрузите сохраненную историю: выберите файл формата .json, в котором ранее была сохранена история"
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
            Загрузить историю
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