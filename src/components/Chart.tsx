import React from 'react';
import {
  Card,
  CardContent,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { formatTime } from "../utils/formatTime";

interface ChartProps {
  xAxis: number[];
  yAxis: number[];
  title: string;
}

export const Chart: React.FC<ChartProps> = ({
  xAxis,
  yAxis,
  title,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        transition: "all 0.3s ease",
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 1 }}>
        <LineChart
          
          xAxis={[
            {
              id: "time",
              data: xAxis,
              scaleType: "band",
              label: "Время",
              valueFormatter: (value: number) => formatTime(value),
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
            noDataOverlay: {
              message: "Запись отсутствует",
            }
          }}
          skipAnimation={true}
        />
      </CardContent>
    </Card>
  );
}; 