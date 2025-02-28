<!-- src/routes/plan/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { loadData, saveData } from '$lib/storage';
  import type { Goal, Task } from '$lib/types';

  let goals: Goal[] = [];
  let newTaskTitles: { [goalId: string]: string } = {};
  let newTaskWeeks: { [goalId: string]: number } = {};
  let editingTaskId: string | null = null;
  let editedTaskTitle = '';

  onMount(async () => {
    const data = await loadData();
    goals = data.goals;
  });

  async function addTask(goalId: string) {
    const title = newTaskTitles[goalId]?.trim();
    const week = newTaskWeeks[goalId] || 1;

    if (!title || week < 1 || week > 12) {
      alert('Please enter a valid task title and week (1-12).');
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      week,
      completed: false,
    };

    goals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, tasks: [...goal.tasks, newTask] } : goal
    );
    await saveData({ goals, reviews: [] });
    newTaskTitles[goalId] = '';
    newTaskWeeks[goalId] = 1;
  }

  function startEditing(task: Task) {
    editingTaskId = task.id;
    editedTaskTitle = task.title;
  }

  async function saveEdit(goalId: string, taskId: string) {
    if (editedTaskTitle.trim()) {
      goals = goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              tasks: goal.tasks.map((t) =>
                t.id === taskId ? { ...t, title: editedTaskTitle.trim() } : t
              ),
            }
          : goal
      );
      await saveData({ goals, reviews: [] });
    }
    editingTaskId = null;
  }

  async function deleteTask(goalId: string, taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      goals = goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, tasks: goal.tasks.filter((t) => t.id !== taskId) }
          : goal
      );
      await saveData({ goals, reviews: [] });
    }
  }
</script>

<h1>Plan Your 12 Week Year</h1>

{#if goals.length === 0}
  <p>No goals yet. Add some on the home page!</p>
{:else}
  {#each goals as goal}
    <div class="goal">
      <h2>{goal.title}</h2>
      <p>Start: {new Date(goal.startDate).toLocaleDateString()} - End: {new Date(goal.endDate).toLocaleDateString()}</p>
      
      <h3>Tasks</h3>
      {#if goal.tasks.length === 0}
        <p>No tasks added yet.</p>
      {:else}
        <ul>
          {#each goal.tasks as task}
            <li>
              {#if editingTaskId === task.id}
                <input
                  type="text"
                  bind:value={editedTaskTitle}
                  on:keydown={(e) => e.key === 'Enter' && saveEdit(goal.id, task.id)}
                />
                <button on:click={() => saveEdit(goal.id, task.id)}>Save</button>
                <button on:click={() => (editingTaskId = null)}>Cancel</button>
              {:else}
                Week {task.week}: {task.title} {task.completed ? '(Completed)' : ''}
                <button on:click={() => startEditing(task)}>Edit</button>
                <button on:click={() => deleteTask(goal.id, task.id)}>Delete</button>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}

      <div class="add-task">
        <input
          type="text"
          bind:value={newTaskTitles[goal.id]}
          placeholder="New task title"
          on:keydown={(e) => e.key === 'Enter' && addTask(goal.id)}
        />
        <input
          type="number"
          min="1"
          max="12"
          bind:value={newTaskWeeks[goal.id]}
          placeholder="Week"
          on:keydown={(e) => e.key === 'Enter' && addTask(goal.id)}
        />
        <button on:click={() => addTask(goal.id)}>Add Task</button>
      </div>
    </div>
  {/each}
{/if}

<!---<a href="/">Back to Home</a>
<a href="/track">Track Progress</a>
<a href="/review">Weekly Review</a>
<a href="/dashboard">Dashboard</a> -->

<style>
  .goal {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .add-task {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
  }
  input[type="number"] {
    width: 60px;
  }
  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>