<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { loadData, saveData } from "$lib/storage";
  import type { Goal, Vision } from "$lib/types";
  import Nav from "$lib/components/nav.svelte";
  import { Card, Progressbar, Button, Checkbox, Accordion, AccordionItem, Toggle } from "flowbite-svelte";
  import { PenSolid, CheckCircleOutline, CalendarEditSolid } from "flowbite-svelte-icons";

  let goals: Goal[] = [];
  let editingGoalId: string | null = null;
  let editedTitle = "";

  let data: Vision;

  let activeGoals:Goal[] = [];
  let plannedGoals:Goal[] = [];
  let archivedGoals : Goal[] = [];



  onMount(async () => {
    data = await loadData();
    goals = data.goals;

    filterGoals();
  });

  async function addGoal() {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: "New Goal",
      startDate: new Date().toISOString(),
      endDate: new Date(
        Date.now() + 12 * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      tasks: [],
    };
    goals = [...goals, newGoal];
    await saveData({ goals, reviews: [] });
  }

  function startEditing(goal: Goal) {
    editingGoalId = goal.id;
    editedTitle = goal.title;
  }

   
  function extractWeek(goalID: string): number {

    let goal = data.goals.find(g => g.id == goalID)!;

    let started = new Date(goal.startDate);
    let now = new Date();
    // Calculate the difference in milliseconds
    const diffMs = now.getTime() - started.getTime();

    // Convert to days
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Calculate week number (starting at 1, not 0)
    const weekNumber = Math.ceil(diffDays / 7) || 1; // Ensure at least 1

    // Cap at 12 weeks
    return Math.min(Math.max(weekNumber, 1), 12);
  }

  async function handleTaskToggle(goalID: string, taskID: string) {
    // update the task dataset.
    // the done is an array of 7 booleans, each representing the day of the week.
    // we want to set the current day to True
    let dayNumber: number = new Date().getDay();
    //console.log("today is day: ", dayNumber);
    console.log("toggle goalid: ",goalID);

    let goal = data.goals.find(g => g.id === goalID)!;
    
    let task = goal.weeks[extractWeek(goalID) - 1].find(t => t.id === taskID)!;
    console.log("task: ",task);

    task.done[dayNumber -1] = true;
    
    // rebuild the data
    goal.weeks[extractWeek(goalID)-1] = goal.weeks[extractWeek(goalID)-1].map(t => (t.id === taskID ? task : t));

    data.goals = data.goals.map(g => (g.id === goalID ? goal : g));

    // save
    
    await saveData(data);
    // console.log("save data");

    filterGoals();
    
  }

  function filterGoals(){
    activeGoals = data.goals.filter(g => g.status === 'active');
    plannedGoals = data.goals.filter(g => g.status === 'planned');
    archivedGoals = data.goals.filter(g => g.status === 'archived');
  }

 function calculateWeeklyProgress(goalID:string):number{
  let g = data.goals.find(g=> g.id === goalID)!;
  let totalActions : number = 0;
  let actionsDone:number = 0;

  let weekNbr = extractWeek(goalID) -1;
  //console.log("weeknrb: ",weekNbr);
  //console.log(g.weeks[weekNbr]);



  if(g.weeks[weekNbr]){

    for (var i = 0; i < g.weeks[weekNbr].length; i++){
    totalActions += Number(g.weeks[weekNbr][i].frequency);

    let dones = g.weeks[weekNbr][i].done.filter(t => t === true).length;
    actionsDone += dones;

    //console.log("adding ",g.weeks[weekNbr][i].frequency, " actions for ", g.weeks[weekNbr][i].title );

  }
  }

  console.log("goal: ", g.title," total actions: ",totalActions, " done: ",actionsDone, " week: ",weekNbr);
  
  let progress = actionsDone / totalActions * 100;
  return progress;
  


 }

 async function toggleGoalStatus(goalID:string, checked:boolean){
  let goal = data.goals.find( g => g.id === goalID)!;

  let status = checked ? "active":"planned";
  

  goal.status = status;
  data.goals = data.goals.map(g => (g.id === goalID ? goal : g));

  await saveData(data);

  filterGoals();
  


 }
</script>

<Nav />

<div class="m-6">
  <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Tasks left this week</h1>
 
  {#each activeGoals as goal, goalIndex}
    <div class="flex mb-4">
      <div class="w-fit mr-3"><CheckCircleOutline color="green"/></div>
      <div class="w-fit">{goal.title}</div>
    </div>

    <div class="mb-6 ml-6 bg-orange-50 p-4">
      {#each goal.weeks[extractWeek(goal.id) - 1] as task, taskIndex}
        {#if task.done.filter((item) => item === true).length < task.frequency && task.done[new Date().getDay()-1] == false}
          
           
          <div class="flex justify-start space-x-3 items-center">
            <div class="">
              <Checkbox on:change={() => handleTaskToggle(goal.id, task.id)}/>
            </div>
            <div>
              {task.title} - {task.done.filter((item) => item === true).length}/{task.frequency}
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
        <Card class="min-w-[300px]">
           <!-- Edit Button in Top-Right Corner -->
 
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {goal.title}
            
          </h5>
    
          <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight"></p>
          Week {extractWeek(goal.id)} / 12
          <Progressbar
            progress={(extractWeek(goal.id) / 12) * 100}
            progressClass="bg-lime-600 dark:bg-lime-400"
          />
    
          This week's progress
          <Progressbar progress="{calculateWeeklyProgress(goal.id)}" progressClass="bg-lime-600 dark:bg-lime-400" />
    
          

          <div class="flex items-center justify-between mt-6">
            <Button class="w-fit" color="yellow" href="/goals/{goal.id}/edit" pill
              ><PenSolid class="w-4 h-4"/></Button
            >
            <Button size="sm" color="blue" href="/goals/{goal.id}/plan" pill><CalendarEditSolid class="w-4 h-4"/></Button>
            <Toggle
              checked={goal.status === 'active'}
              on:change={(e) => toggleGoalStatus(goal.id, e.target.checked)}
              size="small"
              color="green"
            >
              <span class="text-sm text-gray-700 dark:text-gray-400">
                
              </span>
            </Toggle>
            
          </div>
        </Card>
      {/each}
    </div>
    
    

  </AccordionItem>

  <AccordionItem>
    <span slot="header">Planned  ({plannedGoals.length})</span>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each plannedGoals as goal, index (goal.id)}
        <Card class="min-w-[300px]">
          <h5
            class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            {goal.title}
            
          </h5>
    
          <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight"></p>
          Week {extractWeek(goal.id)} / 12
          <Progressbar
            progress={(extractWeek(goal.id) / 12) * 100}
            progressClass="bg-lime-600 dark:bg-lime-400"
          />
    
          This week's progress
          <Progressbar progress="60" progressClass="bg-lime-600 dark:bg-lime-400" />
    
          <div class="flex items-center justify-between mt-6">
            <Button class="w-fit" color="yellow" href="/goals/{goal.id}/edit" pill
              ><PenSolid class="w-4 h-4"/></Button
            >
            <Button size="sm" color="blue" href="/goals/{goal.id}/plan" pill><CalendarEditSolid class="w-4 h-4"/></Button>
            <Toggle
              checked={goal.status === 'active'}
              on:change={(e) => toggleGoalStatus(goal.id, e.target.checked)}
              size="small"
              color="green"
            >
              <span class="text-sm text-gray-700 dark:text-gray-400">
                
              </span>
            </Toggle>
            
          </div>
        </Card>
      {/each}
    </div>
    
    

  </AccordionItem>

  
  <AccordionItem>
    <span slot="header">Archived  ({archivedGoals.length})</span>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each archivedGoals as goal, index (goal.id)}
        <Card class="min-w-[300px]">
          <h5
            class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            {goal.title}
            
          </h5>
    
          <p class="font-normal text-gray-700 dark:text-gray-400 leading-tight"></p>
          Week {extractWeek(goal.id)} / 12
          <Progressbar
            progress={(extractWeek(goal.id) / 12) * 100}
            progressClass="bg-lime-600 dark:bg-lime-400"
          />
    
          This week's progress
          <Progressbar progress="60" progressClass="bg-lime-600 dark:bg-lime-400" />
    
          <div class="flex items-center justify-between mt-6">
            <Button class="w-fit" color="yellow" href="/goals/{goal.id}/edit" pill
              ><PenSolid class="w-4 h-4"/></Button
            >
            <Button size="sm" color="blue" href="/goals/{goal.id}/plan" pill><CalendarEditSolid class="w-4 h-4"/></Button>
            <Toggle
              checked={goal.status === 'active'}
              on:change={(e) => toggleGoalStatus(goal.id, e.target.checked)}
              size="small"
              color="green"
            >
              <span class="text-sm text-gray-700 dark:text-gray-400">
                
              </span>
            </Toggle>
            
          </div>
        </Card>
      {/each}
    </div>
    
    

  </AccordionItem>
</Accordion>
</div>