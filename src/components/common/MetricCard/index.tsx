import { Typography } from "@mui/material";
import { InfoCard } from "../../InfoCard";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  titleColor?: string;
  valueSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function MetricCard({
  title,
  value,
  unit,
  titleColor = "text.secondary",
  valueSize = "h1",
}: MetricCardProps) {
  return (
    <InfoCard>
      <Typography
        sx={{ mb: "10px" }}
        align="center"
        variant="body2"
        color={titleColor}
      >
        {title}
      </Typography>
      <Typography variant={valueSize} align="center" sx={{ fontWeight: "bold" }}>
        {`${value}${unit ? ` ${unit}` : ""}`}
      </Typography>
    </InfoCard>
  );
} 