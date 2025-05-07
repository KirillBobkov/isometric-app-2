import { memo, useCallback } from "react";
import { Button, Box, Tooltip } from "@mui/material";
import { Upload, Download } from "lucide-react";
import { ProgramKey, ProgramData, TrainingData } from "../../services/types";
import { FileService } from "../../services/FileService";
import { StorageService } from "../../services/StorageService";
import { mergeData } from "../../utils/mergeData";
import { useNotification } from "./Notification";

interface FileOperationsProps {
  /**
   * Флаг отключения кнопок
   */
  disabled: boolean;
  
  /**
   * Callback вызываемый после успешного восстановления данных
   */
  onDataRestored: (data: ProgramData) => void;
  programKey: ProgramKey;
}

/**
 * Компонент для работы с файлами тренировки (сохранение, загрузка, генерация отчета)
 */
export const FileOperations = memo(
  ({ disabled, onDataRestored, programKey }: FileOperationsProps) => {
    const { showNotification } = useNotification();

    const handleSaveTraining = useCallback(async () => {
      try {
        const data = await StorageService.getData();
        if (!data) {
          console.error("Нет данных для сохранения");
          showNotification("Нет данных для сохранения", "error");
          return;
        }
        await FileService.saveToFile(data);
        showNotification("История тренировок успешно сохранена", "success");
      } catch (error) {
        console.error("Ошибка при сохранении тренировки:", error);
        showNotification("Ошибка при сохранении истории тренировок", "error");
      }
    }, [showNotification]);

    const handleRestoreTraining = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
          const restoredData = await FileService.loadFromFile(file);

          if (restoredData) {
            const data = await StorageService.getData();
            const merged = mergeData(restoredData, data || {});
            await StorageService.saveData(merged);
            const programData = (merged as TrainingData)[programKey] || {};
            onDataRestored(programData);
            showNotification("История тренировок успешно загружена", "success");
          } else {
            throw new Error("Не удалось загрузить историю тренировок, содержимое не соответствует формату");
          }
        } catch (error) {
          console.error("Ошибка при загрузке тренировки:", error);
          showNotification("Не удалось загрузить историю тренировок, содержимое не соответствует формату", "error");
          event.target.value = '';
        }
      },
      [onDataRestored, programKey, showNotification]
    );

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
  }
);

FileOperations.displayName = "FileOperations";