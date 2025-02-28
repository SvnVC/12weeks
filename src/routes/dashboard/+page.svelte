<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { loadData } from '$lib/storage';
  import type { Goal, WeeklyReview } from '$lib/types';

  let goals: Goal[] = [];
  let reviews: WeeklyReview[] = [];
  let totalWeeks = 12;

  onMount(async () => {
    const data = await loadData();
    goals = data.goals;
    reviews = data.reviews;
  });

  function getOverallProgress() {
    const totalTasks = goals.flatMap((g) => g.tasks).length;
    const completedTasks = goals.flatMap((g) => g.tasks.filter((t) => t.completed)).length;
    const completedGoals = goals.filter((g) => g.tasks.length > 0 && g.tasks.every((t) => t.completed)).length;
    return { totalTasks, completedTasks, completedGoals };
  }

  $: progress = getOverallProgress();
</script>

<h1>12 Week Year Dashboard</h1>

{#if goals.length === 0}
  <p>No goals yet. Add some on the home page!</p>
{:else}
  <div class="dashboard">
    <h2>Overall Progress</h2>
    <p>Total Goals: {goals.length}</p>
    <p>Goals Completed: {progress.completedGoals} ({Math.round((progress.completedGoals / goals.length) * 100)}%)</p>
    <p>Total Tasks: {progress.totalTasks}</p>
    <p>Tasks Completed: {progress.completedTasks} ({Math.round((progress.completedTasks / progress.totalTasks) * 100)}%)</p>

    <h2>Weekly Summary</h2>
    {#each Array.from({ length: totalWeeks }, (_, i) => i + 1) as week}
      <div class="week-summary">
        <h3>Week {week}</h3>
        <p>Tasks Completed: {reviews.find((r) => r.week === week)?.tasksCompleted || 0}/{goals.flatMap(g => g.tasks.filter(t => t.week === week)).length}</p>
        <p>Notes: {reviews.find((r) => r.week === week)?.notes || 'No notes yet'}</p>
      </div>
    {/each}
  </div>
{/if}

<!-- <a href="/">Back to Home</a>
<a href="/plan">Go to Planning</a>
<a href="/track">Track Progress</a>
<a href="/review">Weekly Review</a>-->

<style>
  .dashboard {
    max-width: 800px;
    margin: 1rem auto;
  }
  .week-summary {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-top: 1rem;
  }
</style>