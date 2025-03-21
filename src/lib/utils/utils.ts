/**
 * General utility functions
 */

import type { Goal } from '$lib/types';


export function extractCurrentWeek(goal:Goal): number {

    let started = new Date(goal.startDate);
    let now = new Date();

    
    // Normalize to start of day (midnight) to avoid time-of-day discrepancies
    started.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const diffMs = now.getTime() - started.getTime();

    // Convert to days
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Adjust for Monday-based weeks
    const startDay = started.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const nowDay = now.getDay();

    // Calculate days since the last Monday before or on startDate
    const daysSinceStartMonday =
      diffDays + ((startDay === 0 ? 6 : startDay - 1) % 7);

    // Calculate week number (1-based, incrementing on Mondays)
    const weekNumber = Math.floor(daysSinceStartMonday / 7) + 1;

    // Cap at 12 weeks
    return Math.min(Math.max(weekNumber, 1), 12);
  }


  // calculate the weekly scores
  export function extractWeeklyScores(goal:Goal){

    // create a 12 week array
    let scores = Array.from({length:12}, (v,i)=> {

      return {week: i, percentage:0};

    });

    // calculate percentage
    for(let i=0; i< scores.length; i++){
      let tasks = goal.weeks[i.toString()] || [] ;

      let totalExecuted = 0;
      let totalTarget = 0;

      tasks.forEach(task => {
        
        let done:number = task.done.filter(t => t == true).length;
        let target:number = Number(task.frequency);

        // avoid when things are overdone. We allow maximum the target value
        if (done > target){
          done = target;
        }

        totalExecuted += done;
        totalTarget += target;
                
      });

      let percentage = Math.round((totalExecuted / totalTarget) * 100);
      scores[i].percentage = percentage ? percentage : 0;
    }
    return scores;

  }