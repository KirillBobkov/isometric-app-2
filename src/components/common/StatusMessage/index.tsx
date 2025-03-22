import { Typography } from "@mui/material";

interface StatusMessageProps {
  message: string;
  fontSize?: string | number;
  maxWidth?: string | number;
}

export function StatusMessage({
  message,
  fontSize = "20px",
  maxWidth = "600px",
}: StatusMessageProps) {
  return (
    <Typography
      variant="body1"
      sx={{
        color: "text.secondary",
        textAlign: "center",
        fontSize,
        maxWidth,
        padding: "8px 16px",
        borderRadius: "8px",
        mb: 2,
        backgroundColor: "rgba(0, 0, 0, 0.03)",
      }}
    >
      {message}
    </Typography>
  );
} 