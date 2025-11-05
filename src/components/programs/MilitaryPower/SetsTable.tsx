import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ProgramData, SetDataPoint, ExerciseKey } from "../../../services/types";

interface SetsTableProps {
  programData: ProgramData;
  selectedDate: number;
  selectedExercise: ExerciseKey;
  selectedSet?: number;
}

const calculateMaxWeight = (data: SetDataPoint[]): number => {
  return data.length > 0
    ? data.reduce((max, point) => Math.max(max, point.w), 0)
    : 0;
};

export const SetsTable = ({
  programData,
  selectedDate,
  selectedExercise,
  selectedSet,
}: SetsTableProps) => {
  const setsData = useMemo(() => {
    const exerciseData = programData[selectedDate]?.[selectedExercise] || {};
    
    // Получаем все номера подходов, которые есть в данных (без фильтрации)
    const setNumbers = Object.keys(exerciseData)
      .map(Number)
      .sort((a, b) => a - b);

    if (setNumbers.length === 0) {
      return {
        setNumbers: [],
        maxWeights: [],
        averageMax: 0,
      };
    }

    const maxWeights = setNumbers.map((setNum) => {
      const setData = exerciseData[setNum];
      return Array.isArray(setData) && setData.length > 0
        ? calculateMaxWeight(setData)
        : 0;
    });

    // Вычисляем среднее только для подходов с данными
    const weightsWithData = maxWeights.filter(w => w > 0);
    const averageMax =
      weightsWithData.length > 0
        ? weightsWithData.reduce((sum, max) => sum + max, 0) / weightsWithData.length
        : 0;

    return {
      setNumbers,
      maxWeights,
      averageMax,
    };
  }, [programData, selectedDate, selectedExercise]);

  if (setsData.setNumbers.length === 0) {
    return null;
  }

  return (
    <Table size="small" sx={{ borderRadius: 4, overflow: 'hidden', minWidth: 200 }}>
      <TableHead>
        <TableRow     sx={{
                  backgroundColor: "#232323",
                  "& .MuiTableCell-root": {
                    color: "#ffffff",
                  },
                }}>
          <TableCell align="center" sx={{ fontWeight: "bold" }}>№ подхода</TableCell>
          <TableCell align="center" sx={{ fontWeight: "bold" }}>
            Максимум
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: "bold" }}>
            Усреднённое
          </TableCell>
        </TableRow>
      </TableHead>
        <TableBody>
          {setsData.setNumbers.map((setNum, index) => {
            const isEven = index % 2 === 0;
            const isSelected = selectedSet === setNum;
            
            return (
              <TableRow
                key={setNum}
                sx={{
                  backgroundColor: isEven ? "#0e0e0e" : "#232323",
                  "& .MuiTableCell-root": {
                    color: "#ffffff",
                  },
                }}
              >
              <TableCell
                align="center"
                sx={{
                  ...(isSelected && {
                    backgroundColor: "rgba(25, 167, 255, 0.3)",
                  }),
                }}
              >
                {setNum}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  ...(isSelected && {
                    backgroundColor: "rgba(25, 167, 255, 0.3)",
                  }),
                }}
              >
                {setsData.maxWeights[index].toFixed(1)} кг
              </TableCell>
              {index === 0 && (
                <TableCell
                  align="center"
                  rowSpan={setsData.setNumbers.length}
                  sx={{
                    fontWeight: "bold",
                    verticalAlign: "middle",
                  }}
                >
                  {setsData.averageMax.toFixed(1)} кг
                </TableCell>
              )}
            </TableRow>
            );
          })}
        </TableBody>
    </Table>
  );
};

