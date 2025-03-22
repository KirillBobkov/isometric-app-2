import { Button } from "@mui/material";
import { Play, Square } from "lucide-react";

interface TrainingControlButtonProps {
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  startLabel?: string;
  stopLabel?: string;
}

export function TrainingControlButton({
  isActive,
  disabled = false,
  onClick,
  startLabel = "Начать тренировку",
  stopLabel = "Остановить тренировку",
}: TrainingControlButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      startIcon={isActive ? <Square size={24} /> : <Play size={24} />}
      onClick={onClick}
      disabled={disabled}
      sx={{
        borderRadius: "28px",
        padding: "12px 32px",
        backgroundColor: isActive ? "#ff4444" : "#4CAF50",
        "&:hover": {
          backgroundColor: isActive ? "#ff0000" : "#45a049",
        },
      }}
    >
      {isActive ? stopLabel : startLabel}
    </Button>
  );
} 