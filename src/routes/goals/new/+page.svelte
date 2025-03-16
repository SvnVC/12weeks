<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { savePlan, loadPlan } from "$lib/data";
  import { loadData, saveData } from "$lib/storage";
  import Nav from "$lib/components/nav.svelte";
  import { Label, Input, Textarea, Button, NumberInput } from "flowbite-svelte";
  import { CirclePlusSolid, CircleMinusSolid } from 'flowbite-svelte-icons';
  import type { Goal, Tactic, Vision } from "$lib/types";

  let title = "";
  let vision = "";
  let tactics = [];

  let originalData: Vision;

  onMount(async () => {
    originalData = await loadData();
  });

let today = new Date();
today.setMonth(today.getMonth()+1);

  let newGoal: Goal = {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    startDate: today.toISOString(),
    endDate: "",
    weeks: { "1": [] },
    status: "planned",
    tactics: [{ id: crypto.randomUUID(), description: "" }],
    outcomes: [
      { id: crypto.randomUUID(), description: "", result: "", done: false, targetValue:0, milestones:[] },
    ],
  };

  async function saveNewGoal() {
    originalData.goals = [...originalData.goals, newGoal];

    await saveData(originalData);
    goto("/");
  }

  // add a tactic
  function addTactic() {
    newGoal.tactics = [
      ...newGoal.tactics,
      { id: crypto.randomUUID(), description: "" },
    ];
  }

  // remove tactic
  function removeTactic(index: number) {
    newGoal.tactics = newGoal.tactics.filter((_, i) => i !== index);
  }

  function addOutcome() {
    newGoal.outcomes = [
      ...newGoal.outcomes,
      { id: crypto.randomUUID(), description: "", result: "", done: false, startValue:0, targetValue:0, milestones:[] },
    ];
  }

  function removeOutcome(index: number) {
    newGoal.outcomes = newGoal.outcomes.filter((_, i) => i !== index);
  }
</script>

<Nav />

<main class="m-6">
  <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
    Create a new goal
  </h1>

  <div class="">
    <div class="mb-6">
      <Label>Goal title</Label>
      <Input bind:value={newGoal.title} />
    </div>

    <div class="mb-6">
      <Label>Vision (why it matters)</Label>
      <Textarea bind:value={newGoal.description} />
    </div>

    <div class="mb-6">
      <div class="flex justify-between">
        <Label>Tactics</Label>
        <Button on:click={addTactic}><CirclePlusSolid color="green"/></Button>
      </div>

      {#each newGoal.tactics as tactic, index}
          <div class="flex">
            <div class="w-3/5">
              <Input bind:value={tactic.description}></Input>
            </div>
            <div class="w-2/5">
              <Button on:click={() => removeTactic(index)}><CircleMinusSolid color="red"/></Button
              >
            </div>
          </div>
        {/each}

    </div>

    <div class="mb-6">
      <div class="flex justify-between">
        <Label>Measurable outcomes</Label>
        <Button on:click={addOutcome}><CirclePlusSolid color="green"/></Button>
      </div>

      {#each newGoal.outcomes as outcome, index}
          <div class="flex mt-2">
            <div class="w-2/5">
              <Label>Description</Label>
              <Input bind:value={outcome.description} placeholder="e.g. make 10 sales"></Input>
              
            </div>
            
            <div class="w-1/5 pl-3">
              <Label>Target value</Label>
              <NumberInput bind:value={outcome.targetValue}/>
            </div>
            <div class="w-1/5">
              <Button on:click={() => removeOutcome(index)}
                ><CircleMinusSolid color="red"/></Button
              >
            </div>
          </div>
        {/each}
    </div>

    

    <Button class="mt-6 w-full" color="green" on:click={saveNewGoal}>Save</Button>
  </div>
</main>
