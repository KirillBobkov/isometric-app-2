import { Box, Grid, Typography } from "@mui/material";
import { ProgramCard } from "./ProgramCard";

const programs = [
  {
    title: "Солдатская мощь (Military Power)",
    description:
      "Военно-ориентированная программа для развития функциональной силы и выносливости.",
    path: "/military-power",
    disabled: false,
  },
  {
    title: "Железный человек (Iron Man)",
    description:
      "Продвинутая программа для достижения максимальных результатов в силе и выносливости.",
    path: "/iron-man",
    disabled: false,
  },
  {
    title: "Прометей (The Promethean)",
    description:
      "Базовая программа тренировок, направленная на общее развитие силы и выносливости.",
    path: "/promethean",
    disabled: true,
  },
  {
    title: "Прометей II (The Promethean Mark II)",
    description:
      "Улучшенная версия базовой программы с повышенной интенсивностью и новыми элементами.",
    path: "/promethean-2",
    disabled: true,
  },
];

export const ProgramList = () => {
  return (
    <Box sx={{ p: 0, maxWidth: "100%", mx: "auto" }}>
      <Typography sx={{ mb: 4 }} variant="h4" gutterBottom>
        {"Программы тренировок"}
      </Typography>
      <Grid container spacing={4}>
        {programs.map((program, index) => (
          <Grid item xs={12} key={index}>
            <ProgramCard {...program} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
