<!-- src/routes/review/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { loadData, saveData } from '$lib/storage';
  import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
  import type { Goal, WeeklyReview } from '$lib/types';

  let goals: Goal[] = [];
  let reviews: WeeklyReview[] = [];
  let selectedWeek = 1;
  let currentNotes = '';

  onMount(async () => {
    const data = await loadData();
    goals = data.goals;
    reviews = data.reviews;
    updateNotes();
  });

  function updateNotes() {
    const review = reviews.find((r) => r.week === selectedWeek);
    currentNotes = review?.notes || '';
  }

  function getWeekStats(week: number) {
    const weekTasks = goals.flatMap((g) => g.tasks.filter((t) => t.week === week));
    const tasksCompleted = weekTasks.filter((t) => t.completed).length;
    const totalTasks = weekTasks.length;
    const goalsCompleted = goals.filter((g) => {
      const weekGoalTasks = g.tasks.filter((t) => t.week <= week);
      return weekGoalTasks.length > 0 && weekGoalTasks.every((t) => t.completed);
    }).length;
    return { tasksCompleted, totalTasks, goalsCompleted };
  }

  async function saveReview() {
    const stats = getWeekStats(selectedWeek);
    const existingReview = reviews.find((r) => r.week === selectedWeek);
    const updatedReview: WeeklyReview = {
      week: selectedWeek,
      goalsCompleted: stats.goalsCompleted,
      tasksCompleted: stats.tasksCompleted,
      notes: currentNotes,
    };

    if (existingReview) {
      reviews = reviews.map((r) => (r.week === selectedWeek ? updatedReview : r));
    } else {
      reviews = [...reviews, updatedReview];
    }

    await saveData({ goals, reviews });
  }

  async function exportReviews() {
    const exportText = reviews
      .map((r) => `Week ${r.week}:\nGoals Completed: ${r.goalsCompleted}\nTasks Completed: ${r.tasksCompleted}\nNotes: ${r.notes}\n---`)
      .join('\n');
    await writeTextFile('12_week_reviews.txt', exportText, { dir: BaseDirectory.Download });
    alert('Reviews exported to Downloads folder as 12_week_reviews.txt');
  }

  $: if (selectedWeek) updateNotes();
</script>

<h1>Weekly Review</h1>

{#if goals.length === 0}
  <p>No goals yet. Add some on the home page!</p>
{:else}
  <div class="review-container">
    <label>
      Select Week:
      <select bind:value={selectedWeek} on:change={updateNotes}>
        {#each Array.from({ length: 12 }, (_, i) => i + 1) as week}
          <option value={week}>Week {week}</option>
        {/each}
      </select>
    </label>

    <div class="stats">
      <h2>Week {selectedWeek} Stats</h2>
      <p>Tasks Completed: {getWeekStats(selectedWeek).tasksCompleted}/{getWeekStats(selectedWeek).totalTasks}</p>
      <p>Goals Fully Completed: {getWeekStats(selectedWeek).goalsCompleted}/{goals.length}</p>
    </div>

    <div class="notes">
      <h3>Notes</h3>
      <textarea bind:value={currentNotes} rows="5" placeholder="Add your reflections here..." />
      <button on:click={saveReview}>Save Review</button>
      <button on:click={exportReviews}>Export All Reviews</button>
    </div>
  </div>
{/if}

<!--<a href="/">Back to Home</a>
<a href="/plan">Go to Planning</a>
<a href="/track">Track Progress</a>
<a href="/dashboard">Dashboard</a>
-->
<style>
  .review-container {
    max-width: 800px;
    margin: 1rem auto;
  }
  .stats, .notes {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ccc;
  }
  textarea {
    width: 100%;
    margin-top: 0.5rem;
  }
  button {
    margin-top: 0.5rem;
    margin-right: 0.5rem;
  }
</style>