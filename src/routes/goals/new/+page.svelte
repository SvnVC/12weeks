<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { savePlan, loadPlan } from "$lib/data";
  import { loadData, saveData } from "$lib/storage";
  import Nav from "$lib/components/nav.svelte";
  import {
    Label,
    Input,
    Helper,
    Textarea,
    Button,
    InputAddon,
    ButtonGroup,
  } from "flowbite-svelte";
  import type { Goal, Tactic, Vision } from "$lib/types";

  let title = "";
  let vision = "";
  let tactics = [];

  let originalData: Vision;

  onMount(async () => {
    originalData = await loadData();
  });

  let newGoal: Goal = {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    weeks: { "1": [] },
    status: "planned",
    tactics: [{ id: crypto.randomUUID(), description: "" }],
    outcomes: [{ id: crypto.randomUUID(), description: "", result:"", done:false}],
  };

  async function saveNewGoal() {
    originalData.goals = [...originalData.goals, newGoal];

    await saveData(originalData);
    goto("/");
  }

  function addTacticToNewGoal() {
    newGoal.tactics = [
      ...newGoal.tactics,
      { id: crypto.randomUUID(), description: "" },
    ];
  }

  function removeTacticFromNewGoal(index: number) {
    newGoal.tactics = newGoal.tactics.filter((_, i) => i !== index);
  }

  onMount(async () => {
    plan = await loadPlan();
  });

  // ... addTactic, updateTactic, removeTactic unchanged ...
  // Add a new empty tactic input
  function addTactic() {
    tactics = [...tactics, ""];
  }

  // Update tactic value at index
  function updateTactic(index, value) {
    tactics[index] = value;
    tactics = tactics; // Trigger reactivity
  }

  // Remove a tactic
  function removeTactic(index) {
    tactics = tactics.filter((_, i) => i !== index);
  }

  function removeOutcome(index:number){
    newGoal.outcomes = newGoal.outcomes.filter((_, i) => i !== index);
  }

  function addOutcome(){
    newGoal.outcomes = [ ...newGoal.outcomes, { id: crypto.randomUUID(), description: "", result:"", done:false}];
  }

  async function saveGoal() {
    const newGoal = {
      id: Date.now(),
      title,
      vision,
      tactics: tactics
        .filter((t) => t.trim() !== "")
        .map((description, i) => ({
          id: i + 1,
          description,
          completedWeeks: [],
          dailyCompletions: {},
        })),
    };
    plan.goals.push(newGoal);
    await savePlan(plan);
    goto("/");
  }
</script>

<Nav />


<div class="m-4">
  <h5 class="font-bold text-lg mb-6">Create a New Goal</h5>

  <Label>Goal title</Label>
  <Input label="title" bind:value={newGoal.title} />

  <Label>Vision (why it matters)</Label>
  <Textarea bind:value={newGoal.description} />

  <div class="flex">
    <div class="w-1/2">
      <Label>Tactics</Label>
      
      {#each newGoal.tactics as tactic, index}
        <div class="flex">
          <div class="w-4/5">
            <Input bind:value={newGoal.tactics[index].description}></Input>
          </div>
          <div class="w-1/5">
            <Button color="red" on:click={() => removeTacticFromNewGoal(index)}
              >X</Button>
          </div>
        </div>
      {/each}

      <Button color="blue" on:click={addTacticToNewGoal}>+</Button>


    </div>
    <div class="w-1/2">
      <Label>Measurable outcomes</Label>

      {#each newGoal.outcomes as outcome, index}
        <div class="flex">
          <div class="w-4/5">
            <Input bind:value={outcome.description}></Input>
          </div>
          <div class="w-1/5">
            <Button color="red" on:click={() => removeOutcome(index)}>X</Button>
          </div>
        </div>
        
        
      {/each}
  
       <Button color="blue" on:click={addOutcome}>+</Button>
    </div>
  </div>

  


  <Button color="green" on:click={saveNewGoal}>Save</Button>
</div>


