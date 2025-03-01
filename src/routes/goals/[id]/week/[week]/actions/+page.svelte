<script lang="ts">
    import type { Vision, Goal, Task } from '$lib/types';
    import { Card, Checkbox, Button } from 'flowbite-svelte';
    import Nav from '$lib/components/nav.svelte';
    import { page } from '$app/stores';
    import { loadData, saveData } from '$lib/storage';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    $: goalId = $page.params.id;
    $: week = $page.params.week;
    let data: Vision;
    let goal: Goal | undefined;
    let message: string = '';
  
    onMount(async () => {
      data = await loadData();
      goal = data.goals.find(g => g.id === goalId);
     
    });
  
    async function toggleAction(taskId: string, dayIndex: number) {
      if (!goal) return;
      const task = goal.weeks[week]?.find(t => t.id === taskId);
      if (task) {
        task.done[dayIndex] = !task.done[dayIndex];
        data.goals = data.goals.map(g => (g.id === goalId ? goal : g));
        await saveData(data);
        message = 'Action updated!';
        setTimeout(() => (message = ''), 2000); // Clear message after 2s
      }
    }
  
    function saveAndReturn() {
      goto(`/progress`);
    }
  </script>
  
  <Nav />

  
  <main class="max-w-4xl mx-auto p-6  min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
      Actions - {goal?.title || 'Goal'} - Week {Number(week) + 1}
    </h1>
  
    {#if goal && goal.weeks[week]?.length > 0}
     
        <div class="space-y-6">
          {#each goal.weeks[week] as task (task.id)}
         
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-900">{task.title || 'Unnamed Task'} - {task.done.filter(t => t === true).length}/{task.frequency}</h2>
              <div class="grid grid-cols-7 gap-2">
                {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day, i}
                  <div class="flex flex-col items-center">
                    <span class="text-xs text-gray-600">{day}</span>
                    

                    
                    <Checkbox
                      checked={task.done[i]}
                      on:change={() => toggleAction(task.id, i)}
                      class="mt-1"
                    />
              
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        <Button color="blue" class="mt-6 w-full" on:click={saveAndReturn}>Back to Progress</Button>
        {#if message}
          <p class="text-sm text-center text-green-600 mt-2">{message}</p>
        {/if}
      
    {:else}
      <p class="text-center text-gray-500 mt-12">No tasks for this week.</p>
      <Button color="blue" class="mt-6 w-full" on:click={saveAndReturn}>Back to Progress</Button>
    {/if}
  </main>
