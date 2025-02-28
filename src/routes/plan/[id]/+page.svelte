<script lang="ts">
    
    import { loadData, saveData } from "$lib/storage";
    import Nav from "$lib/components/nav.svelte";
    import { onMount } from "svelte";
    import type { Goal, Task, Vision, Week } from "$lib/types";
    import { page } from "$app/stores";
    import { AccordionItem, Accordion, Button, Input, Select, Label } from "flowbite-svelte";
    import { goto } from "$app/navigation";

    let pageIdx:string = $page.params.id;
    let idx:number = Number(pageIdx);

    let originalData: Vision;

    let currentGoal: Goal;

    let weeks: Week[];

    onMount(async () => {
        originalData = await loadData();

        currentGoal = originalData.goals[idx];

        weeks = currentGoal.weeks;

        console.log(currentGoal);
    });

    function addTask(week: number) {
        let newTask: Task = {
            id: crypto.randomUUID(),
            title: "",
            frequency: 1,
            done: [false, false, false, false, false, false, false],
        };
        const weekKey:string = week.toString();
        // Ensure the week exists in weeks object
        if (!Array.isArray(currentGoal.weeks[weekKey])) {
            currentGoal.weeks[weekKey] = [];
        }

        // Add the new task to the specified week
        currentGoal.weeks[weekKey].push(newTask);

        // Trigger reactivity by reassigning currentGoal
        currentGoal = { ...currentGoal };
    }

    async function saveEdit(){
        originalData.goals[idx] = currentGoal;

        await saveData(originalData);

        goto("/");

    }

    const frequencyValues = [
        {value:"1", name:"once per week"},
        {value:"2", name:"twice per week"},
        {value:"3", name:"3x per week"},
        {value:"4", name:"4x per week"},
        {value:"5", name:"5x per week"},
        {value:"6", name:"6x per week"},
        {value:"7", name:"Every day"},
    ]
</script>

<Nav />

<div class="m-4">
    Plan the week for goal {#if currentGoal}<b>{currentGoal.title}</b
        >{:else}{/if}
        <Button color="green" on:click={saveEdit}>Save changes</Button>
        <br/>
        <h4>Tactics</h4>
        {#if currentGoal}
            {#each currentGoal.tactics as tactic}
                {tactic.description}<br/>
            {/each}
        {/if}

    <Accordion>
        {#each { length: 12 }, weeknbr}
            <AccordionItem>
                <span slot="header">Week {weeknbr + 1}</span>

                <Button color="blue" on:click={() => addTask(weeknbr)}
                    >Add task</Button
                >

                {#each currentGoal.weeks[weeknbr] as task}
                    
                    <div class="flex mb-4">
                        <div class="">
                            <Label>Task title</Label>
                        <Input bind:value={task.title} placeholder="e.g. write 500 words"/>
                    </div>
                    <div>
                        <Label>Frequency</Label>
                        <Select items={frequencyValues} bind:value={task.frequency} placeholder="every day"/>
                    </div>
                    </div>
                    
                {/each}
            </AccordionItem>
        {/each}
    </Accordion>
</div>
