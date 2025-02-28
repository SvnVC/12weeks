<script lang="ts">
  import type { Vision, Goal } from "$lib/types";
  import { Card, Progressbar, Button, Badge, Select } from "flowbite-svelte";
  import Nav from "$lib/components/Nav.svelte";
  import { loadData } from "$lib/storage";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PenSolid } from "flowbite-svelte-icons";

  let data: Vision = { vision: "", created: "", updated: "", goals: [] };
  let activeGoals: Goal[] = [];
  let goalsToDisplay: Goal[] = [];
  let currentWeek: number = 0;
  let currentWeeks: { [goalId: string]: number | null } = {}; // Track current weeks per goal
  let hoveredWeek: number | null = null; // Track hovered week
  let hoveredWeeks: { [goalId: string]: number | null } = {}; // Track hovered week per goal

  const filterValues = [
    { value: "all", name: "Show all" },
    { value: "active", name: "Show active" },
    { value: "planned", name: "Show planned" },
    { value: "archived", name: "Show archived" },
  ];
  let selected:string = 'all'; // default set to all

  async function loadNewData() {

    //console.log("loading new data");
    //console.log('selected: ',selected);

    if (selected == "all"){
      goalsToDisplay = data.goals;
    } else {
      goalsToDisplay  = data.goals.filter((goal) => goal.status == selected);
    }
    

    const earliestStart = Math.min(
      ...goalsToDisplay
        .filter((g) => g.startDate)
        .map((g) => new Date(g.startDate).getTime()),
    );

    if (earliestStart) {
      const diffMs = Date.now() - earliestStart;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      currentWeek = Math.min(Math.max(Math.ceil(diffDays / 7) - 1, 0), 11); // 0-11
    }

    // Initialize hoveredWeeks for each goal
    goalsToDisplay.forEach((goal) => {
      hoveredWeeks[goal.id] = null;
      const diffMs = Date.now() - new Date(goal.startDate).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const currentWeek = Math.min(
        Math.max(Math.ceil(diffDays / 7) - 1, 0),
        11,
      ); // 0-11
      currentWeeks[goal.id] = currentWeek;
    });
   
  }

  onMount(async () => {
    data = await loadData();
    await loadNewData();
  });

  // Weekly task progress
  function getWeekProgress(goal: Goal, week: string) {
    const tasks = goal.weeks[week] || [];
    let total = 0;
    let done = 0;
    tasks.forEach((task) => {
      total += Number(task.frequency);
      done += task.done.filter(Boolean).length;
    });
    return [
      {
        total,
        done,
        percentage: total ? Math.round((done / total) * 100) : 0,
        tasks,
      },
    ];
  }

  // Weekly scores for all 12 weeks
  function getWeeklyScores(goal: Goal) {
    return Array.from({ length: 12 }, (_, i) => {
      const weekKey = i.toString();
      const { percentage, tasks } = getWeekProgress(goal, weekKey)[0];
      return { week: i, percentage, tasks };
    });
  }

  // Individual task percentage
  function getTaskPercentage(task: { frequency: string; done: boolean[] }) {
    const total = Number(task.frequency);
    const done = task.done.filter(Boolean).length;
    return total ? Math.round((done / total) * 100) : 0;
  }

  // Outcome progress (milestones)
  function getOutcomeProgress(goal: Goal, week: string) {
    return goal.outcomes.filter((o) => o.weeklyChecks?.[week]).length;
  }
</script>

<Nav />

<main class="mx-auto p-6 min-h-screen">
  <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Progress</h1>
  <p class="text-lg text-gray-600 mb-4 text-center">{data.vision}</p>

  <div class="flex justify-end">
  <Select class="w-fit mb-4" items={filterValues} bind:value={selected} on:change={loadNewData}/>
</div>
  {#if goalsToDisplay.length > 0}
    <div class=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each goalsToDisplay as goal (goal.id)}
        <Card class="p-6  min-w-[350px] ">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">{goal.title}</h2>

          <!-- Weekly Scores -->
          <div class="mb-6">
            <span class="text-sm font-medium text-gray-700">Weekly Scores</span>

            <div class="grid grid-cols-12 gap-2 mt-2">
              {#each getWeeklyScores(goal) as { week, percentage, tasks } (week)}
                <div
                  class="text-center rounded-lg cursor-pointer"
                  class:bg-amber-100={week === currentWeeks[goal.id]}
                  class:bg-gray-100={week < currentWeeks[goal.id]}
                  class:bg-green-100={week > currentWeeks[goal.id]}
                  on:click={() => (hoveredWeeks[goal.id] = week)}
                  on:mouseenter={() => (hoveredWeeks[goal.id] = week)}
                >
                  <span class="text-xs font-medium text-gray-600 block mb-1"
                    >W{week + 1}</span
                  >
                  <Progressbar
                    progress={percentage}
                    color={week === currentWeeks[goal.id] ? "green" : "gray"}
                    size="h-2"
                    class="w-full"
                  />
                  <span class="text-xs text-gray-500">{percentage}%</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Dynamic Week Tasks -->
          <div class="mb-6">
            <div class="flex justify-between mb-4">
              <span class="text-sm font-medium text-gray-700">
                Tasks - Week {hoveredWeeks[goal.id] !== null
                  ? hoveredWeeks[goal.id] + 1
                  : currentWeeks[goal.id] + 1}
              </span>
              <div>
                <Button
                  color="light"
                  href="/goals/{goal.id}/week/{hoveredWeeks[goal.id] ??
                    currentWeek}/actions"
                  pill><PenSolid class="w-4 h-4" /></Button
                >
              </div>
            </div>
            <div class="h-48 overflow-auto">
              {#each getWeekProgress(goal, (hoveredWeeks[goal.id] ?? currentWeeks[goal.id]).toString()) as { total, done, percentage, tasks }}
                {#if tasks.length > 0}
                  <Progressbar
                    progress={percentage}
                    color="green"
                    size="h-4"
                    class="mt-2 mb-2"
                    labelOutside="{done} / {total}"
                    classLabelOutside="text-green"
                  />
                  <div class=" space-y-2">
                    {#each tasks as task (task.id)}
                      <div
                        class="flex justify-between items-center text-sm text-gray-600"
                      >
                        <span>{task.title || "Unnamed"}</span>
                        <Badge color="gray">
                          {task.done.filter(Boolean).length} / {Number(
                            task.frequency,
                          )} ({getTaskPercentage(task)}%)
                        </Badge>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="text-sm text-gray-500 mt-2">No tasks this week.</p>
                {/if}
              {/each}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {:else}
    <p class="text-center text-gray-500 mt-12">No goals found.</p>
  {/if}
</main>
