import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { formatTime } from "../utils/formatTime";

interface ChartProps {
  xAxis: number[];
  yAxis: number[];
  title: string;
  isTrainingActive?: boolean;
  selectedSet?: number;
  onSetChange?: (set: number) => void;
  sets?: number;
}

export function Chart({
  xAxis,
  yAxis,
  title,
  selectedSet = 1,
  onSetChange,
  sets = 1,
}: ChartProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <Typography variant="subtitle1">График усилий</Typography>
          </div>
          {sets > 1 && onSetChange && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="set-select-label">Выберите запись подхода</InputLabel>
              <Select
                labelId="set-select-label"
                value={selectedSet}
                label="Посмотреть запись подхода"
                onChange={(e) => onSetChange(Number(e.target.value))}
                size="small"
              >
                {new Array(sets).fill(0).map((_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    Подход № {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <LineChart
          xAxis={[
            {
              id: "time",
              data: xAxis,
              scaleType: "band",
              label: "Время",
              valueFormatter: (value) => formatTime(parseInt(value)),
              labelStyle: {
                fontSize: 14,
              },
            },
          ]}
          yAxis={[
            {
              label: "Вес (кг)",
              labelStyle: {
                fontSize: 14,
              },
            },
          ]}
          series={[
            {
              data: yAxis,
              label: title,
              area: false,
              color: "#6bc2ff",
              showMark: false,
            },
          ]}
          height={400}
          margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
          slotProps={{
            legend: {
              hidden: true
            },
          }}
        />
      </CardContent>
    </Card>
  );
} 