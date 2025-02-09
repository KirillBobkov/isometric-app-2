import { Box, Card, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface ProgramCardProps {
  title: string;
  description: string;
  path: string;
  disabled?: boolean;
}

export const ProgramCard = ({
  title,
  description,
  path,
  disabled = false,
}: ProgramCardProps) => {
  return (
    <Link
      to={path}
      style={{
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "all",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Card
        sx={{
          minHeight: 200,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          p: 4,
          mb: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.02)" },
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800 }} variant="h4" gutterBottom>
            {title}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ maxWidth: 400 }} variant="body1" textAlign="right">
            {description}
          </Typography>
        </Box>
      </Card>
    </Link>
  );
};
