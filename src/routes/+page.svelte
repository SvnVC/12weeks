<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { loadData, saveData } from "$lib/storage";
  import type { Goal, Vision } from "$lib/types";
  import Nav from "$lib/components/nav.svelte";
  import "$lib/components/goalcard.svelte";
  import {
    Card,
    Progressbar,
    Button,
    Checkbox,
    Accordion,
    AccordionItem,
    Toggle,
  } from "flowbite-svelte";
  import {
    PenSolid,
    CheckCircleOutline,
    CalendarEditSolid,
  } from "flowbite-svelte-icons";

  import { extractCurrentWeek } from '$lib/utils/utils';
    import Goalcard from "$lib/components/goalcard.svelte";
    import { json } from "@sveltejs/kit";

  let goals: Goal[] = [];

  let data: Vision;

  let activeGoals: Goal[] = [];
  let plannedGoals: Goal[] = [];
  let archivedGoals: Goal[] = [];

  onMount(async () => {
    data = await loadData();
    goals = data.goals;

    filterGoals();
  });

  
  async function handleTaskToggle(goalID: string, taskID: string) {
    // update the task dataset.
    // the done is an array of 7 booleans, each representing the day of the week.
    // we want to set the current day to True
    let dayNumber: number = new Date().getDay();
    //console.log("today is day: ", dayNumber);
    //console.log("toggle goalid: ", goalID);

    let goal = data.goals.find((g) => g.id === goalID)!;

    let task = goal.weeks[extractCurrentWeek(goal) - 1].find(
      (t) => t.id === taskID,
    )!;
    //console.log("task: ", task);

    task.done[dayNumber - 1] = true;

    // rebuild the data
    goal.weeks[extractCurrentWeek(goal) - 1] = goal.weeks[
      extractCurrentWeek(goal) - 1
    ].map((t) => (t.id === taskID ? task : t));

    data.goals = data.goals.map((g) => (g.id === goalID ? goal : g));

    // save

    await saveData(data);
    // console.log("save data");

    filterGoals();
  }

  function filterGoals() {
    activeGoals = data.goals.filter((g) => g.status === "active");
    plannedGoals = data.goals.filter((g) => g.status === "planned");
    archivedGoals = data.goals.filter((g) => g.status === "archived");
  }

  function calculateWeeklyProgress(goalID: string): number {
    let g = data.goals.find((g) => g.id === goalID)!;
    let totalActions: number = 0;
    let actionsDone: number = 0;

    let weekNbr = extractCurrentWeek(g) - 1;
    //console.log("weeknrb: ",weekNbr);
    //console.log(g.weeks[weekNbr]);

    if (g.weeks[weekNbr]) {
      for (var i = 0; i < g.weeks[weekNbr].length; i++) {
        totalActions += Number(g.weeks[weekNbr][i].frequency);

        let dones = g.weeks[weekNbr][i].done.filter((t) => t === true).length;
        actionsDone += dones;

        //console.log("adding ",g.weeks[weekNbr][i].frequency, " actions for ", g.weeks[weekNbr][i].title );
      }
    }

    let progress = (actionsDone / totalActions) * 100;
    return Math.round(progress);
  }

  /**
   * Toggle status in goalcard component
   * @param goalID
   * @param checked
   */
   async function toggleStatus(goalID: string) {
    let goal = data.goals.find((g) => g.id === goalID)!;

    if(goal.status == 'active'){
      goal.status = 'planned';
    } else {
      goal.status = 'active';
    }
    
    data.goals = data.goals.map((g) => (g.id === goalID ? goal : g));

    await saveData(data);

    filterGoals();
  }

  async function toggleGoalStatus(goalID: string, checked: boolean) {
    let goal = data.goals.find((g) => g.id === goalID)!;

    let status = checked ? "active" : "planned";

    goal.status = status;
    data.goals = data.goals.map((g) => (g.id === goalID ? goal : g));

    await saveData(data);

    filterGoals();
  }
</script>

<Nav />

<div class="m-6">
  <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
    Tasks left this week
  </h1>

  {#each activeGoals as goal, goalIndex}
    <div class="flex mb-4">
      <div class="w-fit mr-3"><CheckCircleOutline color="green" /></div>
      <div class="w-fit">{goal.title}</div>
    </div>

    <div class="mb-6 ml-6 bg-orange-50 p-4">
      {#each goal.weeks[(extractCurrentWeek(goal) - 1).toString()] as task, taskIndex}
      
        {#if task.done.filter((item) => item === true).length < task.frequency && task.done[new Date().getDay() - 1] == false}
          <div class="flex justify-start space-x-3 items-center">
            <div class="">
              <Checkbox on:change={() => handleTaskToggle(goal.id, task.id)} />
            </div>
            <div>
              {task.title} - {task.done.filter((item) => item === true)
                .length}/{task.frequency}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/each}
</div>

<div class="m-5">
  <Accordion>
    <AccordionItem open>
      <span slot="header">Active ({activeGoals.length})</span>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each activeGoals as goal, index (goal.id)}

         <goal-card 
         onchange={() => {toggleStatus(goal.id)}} 
         title={goal.title} 
         id={goal.id} 
         status={goal.status}
         currentweek={extractCurrentWeek(goal)}
         currentweekprogress={calculateWeeklyProgress(goal.id)}></goal-card>

        {/each}
      </div>
    </AccordionItem>

    <AccordionItem>
      <span slot="header">Planned ({plannedGoals.length})</span>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each plannedGoals as goal, index (goal.id)}
          <goal-card 
         onchange={() => {toggleStatus(goal.id)}} 
         title={goal.title} 
         id={goal.id} 
         status={goal.status}
         currentweek={extractCurrentWeek(goal)}
         currentweekprogress={calculateWeeklyProgress(goal.id)}></goal-card>
        {/each}
      </div>
    </AccordionItem>

    <AccordionItem>
      <span slot="header">Archived ({archivedGoals.length})</span>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each archivedGoals as goal, index (goal.id)}
        <goal-card 
        onchange={() => {toggleStatus(goal.id)}} 
        title={goal.title} 
        id={goal.id} 
        status={goal.status}
        currentweek={extractCurrentWeek(goal)}
        currentweekprogress={calculateWeeklyProgress(goal.id)}></goal-card>
        {/each}
      </div>
    </AccordionItem>
  </Accordion>
</div>
