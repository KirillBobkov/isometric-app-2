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
          minHeight: { xs: "auto", sm: 200 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: { xs: "flex-start", md: "space-between" },
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.02)" },
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 0 } }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2rem", md: "2.125rem" },
            }}
            variant="h4"
            gutterBottom
          >
            {title}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              maxWidth: { xs: "100%", md: 400 },
              textAlign: { xs: "left", md: "right" },
            }}
            variant="body1"
            color="text.secondary"
          >
            {description}
          </Typography>
        </Box>
      </Card>
    </Link>
  );
};
