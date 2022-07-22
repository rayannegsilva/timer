import { differenceInSeconds } from "date-fns";
import { createContext, ReactNode, useState, useReducer, useEffect } from "react";
import { addNewCycleAction, interruptCurrentCycleAction, markCurrentCycleAsFinishedAction } from "../reducers/cycles/action";
import { Cycle, cycleReducer } from "../reducers/cycles/reducer";

interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface CyclesContextType {
  cycles: Cycle[];
  activeCycle: Cycle | undefined;
  activeCycleId: string | null;
  amountSecondsPassed: number;
  setSecondsPassed: (seconds: number) => void;
  markCurrentCycleAsFinished: () => void;
  createNewCycle: (data: CreateCycleData) => void;
  interruptCurrentCycle: () => void;
}

export const CyclesContext = createContext({} as CyclesContextType);

interface CyclesContextProviderProps {
  children: ReactNode;
}

export function CyclesContextProvider({ children }: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(cycleReducer,{
      cycles: [],
      activeCycleId: null,
    }, () => {
      const storedStateAsJson = localStorage.getItem('@timer:cycles-state-1.0.0');

      if(storedStateAsJson) {
        return JSON.parse(storedStateAsJson);
      }
    }
  )

  const { cycles, activeCycleId } = cyclesState
  const activeCycle = cycles.find(cycle => cycle.id === activeCycleId);

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if(activeCycle) {
      const secondsDifference = differenceInSeconds(
        new Date(),
        new Date(activeCycle.startDate),
      )
    }
    return 0
  });
  
    useEffect(() => {
      const stateJSON = JSON.stringify(cyclesState);

      localStorage.setItem('@timer:cycles-state-1.0.0', stateJSON);
    }, [cyclesState])

  
  

  
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds);
  }

  
  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime())
    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch(addNewCycleAction(newCycle))
    setAmountSecondsPassed(0)
  }

  function interruptCurrentCycle() {
    dispatch(interruptCurrentCycleAction())
  }


  function markCurrentCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction())
}


  return(
    <CyclesContext.Provider 
    value={{ 
          activeCycle, 
          activeCycleId, 
          markCurrentCycleAsFinished, 
          amountSecondsPassed, 
          setSecondsPassed,
          createNewCycle,
          interruptCurrentCycle,
          cycles
        }}
      >
        {children}
      </CyclesContext.Provider>
  );
}