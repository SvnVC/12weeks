// src/lib/types.ts

export interface Goal {
    id: string;
    title: string;
    description?: string;
    startDate: string; // ISO date string
    endDate: string;   // 12 weeks from start
    weeks: Week;
    status: "active" | "planned" | 'archived';
    tactics: Tactic[];
    outcomes: Outcome[];
  }

  export interface Tactic{
    id: string;
    description: string;
  }

  export interface Outcome{
    id: string;
    description: string;
    startValue:number;
    targetValue: number;
    milestones:Milestone[];
    result: string;
    done: boolean;
  }

  export interface Milestone {
    id: string;
    week:number; // week 1 to 12
    value:number;
  }

  export interface Week {
    [weekNumber : number] : Task[]
  }
  
  export interface Task {
    id: string;
    title: string;
    frequency: number; // how many times in a week does it need to be done? 1 to 7.
    done: boolean[]; // array of 7 booleans for each day.
  }
  
  export interface WeeklyReview {
    week: number;
    goalsCompleted: number; // Fully completed goals (all tasks done)
    tasksCompleted: number; // Total tasks completed this week
    notes: string;          // User reflection
  }

  export interface Vision {
    vision: string;
    created: string; // ISO date string
    updated: string;
    goals: Goal[];
  }