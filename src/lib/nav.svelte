<script>
  import { goto } from '$app/navigation';
  import { loadPlan } from '$lib/data';
  let plan = loadPlan();

  function navigateTo(path) {
    goto(path);
  }
</script>

<nav>
  <button on:click={() => navigateTo('/')}>Dashboard</button>
  <button on:click={() => navigateTo('/plan')}>Plan Editor</button>
  <button on:click={() => navigateTo(`/week/${plan.currentWeek}`)}>
    Week {plan.currentWeek} Review
  </button>
  <button on:click={() => navigateTo('/goals/new')}>New Goal</button>
</nav>

<style>
  nav {
    display: flex;
    gap: 10px;
    padding: 10px;
  }
  button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
</style>