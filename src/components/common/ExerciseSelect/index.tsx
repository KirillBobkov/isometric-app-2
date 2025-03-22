import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface Exercise {
  value: string;
  label: string;
}

interface ExerciseSelectProps {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  exercises: Exercise[];
  label?: string;
}

export function ExerciseSelect({
  disabled = false,
  value,
  onChange,
  exercises,
  label = "ВЫБЕРИТЕ УПРАЖНЕНИЕ",
}: ExerciseSelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl
      sx={{ minWidth: 250, width: "auto" }}
      disabled={disabled}
    >
      <InputLabel id="exercise-select-label">
        {value ? "ТЕКУЩЕЕ УПРАЖНЕНИЕ" : label}
      </InputLabel>
      <Select
        labelId="exercise-select-label"
        id="exercise-select"
        value={value}
        onChange={handleChange}
        label={label}
        sx={{
          backgroundColor: "background.paper",
          borderRadius: "28px",
          "& .MuiSelect-select": {
            padding: "15px 32px",
          },
        }}
      >
        <MenuItem value="">Не выбрано</MenuItem>
        {exercises.map((exercise) => (
          <MenuItem key={exercise.value} value={exercise.value}>
            {exercise.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 