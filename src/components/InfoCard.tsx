import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const InfoCard = ({ title, content }: any) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(8px)",
        borderRadius: "20px",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          align="center"
          sx={{
            p: 2,
            mb: 1,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
          gutterBottom
          variant="h5"
          component="div"
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InfoCard;