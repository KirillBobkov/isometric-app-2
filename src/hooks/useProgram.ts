import { useState, useEffect, useRef } from "react";
import { ProgramKey, ProgramData } from "../services/types";
import { StorageService } from "../services/StorageService";
import { mergeData } from "../utils/mergeData";

export const useProgram = (
  programKey: ProgramKey,
  defaultData: ProgramData
) => {
  const [programData, setProgramData] = useState<ProgramData>(defaultData);
  const defaultDataRef = useRef(defaultData);

  useEffect(() => {
    defaultDataRef.current = defaultData;
  }, [defaultData]);

  useEffect(() => {
    const loadProgramData = async () => {
      const storedData = await StorageService.getProgramData(programKey);
      setProgramData(mergeData(storedData, defaultDataRef.current));
    };
    loadProgramData();
  }, [programKey]);

  return { programData, setProgramData };
};

