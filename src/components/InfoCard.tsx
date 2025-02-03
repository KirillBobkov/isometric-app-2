import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

// Цветовая палитра
const colors = ['#2c1872'];

const gradients: { [key: number]: string } = {};

// Генерация 30 уникальных градиентов
for (let i = 0; i < 30; i++) {
  const randomColors = getRandomColors(colors); // Выбираем случайные цвета
  const direction = getRandomDirection(); // Выбираем случайное направление

  gradients[i] = `linear-gradient(${direction}, ${randomColors.join(", ")})`;
}

// Функция для выбора случайных цветов
function getRandomColors(colorPalette: string[]): string[] {
  const numColors = Math.floor(Math.random() * 2) + 2; // 2 или 3 цвета
  const shuffled = [...colorPalette].sort(() => 0.5 - Math.random()); // Перемешиваем цвета
  return shuffled.slice(0, numColors); // Возвращаем 2 или 3 случайных цвета
}

// Функция для выбора случайного направления
function getRandomDirection(): string {
  const directions = [
    "0.25turn",
    "0.5turn",
    "0.75turn",
    "90deg",
    "180deg",
    "270deg",
    "to top",
    "to bottom",
    "to left",
    "to right",
    "45deg",
    "135deg",
    "225deg",
    "315deg",
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

function getRandomGradient(): string {
  const keys = Object.keys(gradients).map(Number); // Получаем массив ключей
  const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Выбираем случайный ключ
  return gradients[randomKey]; // Возвращаем соответствующий градиент
}

export const InfoCard = ({ title, content, bigTitle }: any) => {

  return (
    <Card
    color="text.primary"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center' }}>
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
        {bigTitle && (
          <Typography
            align="center"
            sx={{
              p: 2,
              mb: 0,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
            gutterBottom
            variant="h1"
            component="div"
          >
            {bigTitle}
          </Typography>
        )}
        {content && (
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
