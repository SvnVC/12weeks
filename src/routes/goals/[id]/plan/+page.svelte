<script lang="ts">
    export const prerender = false; // Disable prerendering
    import { loadData, saveData } from "$lib/storage";
    import Nav from "$lib/components/nav.svelte";
    import { onMount } from "svelte";
    import type { Goal, Task, Vision, Week } from "$lib/types";
    import { page } from "$app/state";
    import { AccordionItem, Accordion, Button, Input, Select, Label } from "flowbite-svelte";
    import { CaretLeftSolid, QrCodeOutline } from 'flowbite-svelte-icons';
    import { goto } from "$app/navigation";
    import { checkPermissions } from "@tauri-apps/api/core";
    import { extractCurrentWeek } from "$lib/utils/utils";

    let goalID:string = page.params.id;

    let data: Vision;

    let goal: Goal;
    let weeks: Week[];

    let accordionColours: string[];

    let currentWeekIndex:number;

    onMount(async () => {
        // load total data from json file
        data = await loadData();

        // extract only one goal with the given id
        goal = data.goals.find(g => g.id === goalID)!;

        // extract the weeks
        //weeks = goal.weeks;

        currentWeekIndex = extractCurrentWeek(goal) - 1;
        accordionColours =  getAccordionColours();

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
        if (!Array.isArray(goal.weeks[weekKey])) {
            goal.weeks[weekKey] = [];
        }

        // Add the new task to the specified week
        goal.weeks[weekKey].push(newTask);

        // Trigger reactivity by reassigning goal - could just as well be goal = goal
        goal = { ...goal };
    }

    async function saveEdit(){

        // map the data to replace the original goal with the id with the copy that we've adapted
        data.goals = data.goals.map(g => (g.id === goalID ? goal : g));

        

        await saveData(data);

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

    function removeTask(weekNbr:number, taskID:string){

        const weekKey:string = weekNbr.toString();
        console.log(goal.weeks[weekKey]);
        goal.weeks[weekKey] = goal.weeks[weekKey].filter(task => task.id != taskID);
        console.log("removed: ",weekNbr," ",taskID);

    }

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


    function getAccordionColours():string[]  {

        var colours:string[] = [];
        for(var i = 0; i< 12; i++){
            colours = [...colours, '']
        }

        for(var n = 0; n< 12; n++){
            if(n == currentWeekIndex){
                colours[n] = 'bg-orange-100';
            } else if (n < currentWeekIndex){
                colours[n] = 'bg-gray-100';
            } else if (n > currentWeekIndex){
                colours[n] = 'bg-green-100';
            }
        }

        return colours;
    };

    
    function importLastWeeksTasks(weekIndex:number){
        console.log("importing tasks to weekidx: ",weekIndex);
        // get last weeks' tasks
        let previousWeekIdx:string = (weekIndex - 1).toString();

        let previousTasks = goal.weeks[previousWeekIdx];

        console.log(previousTasks);

        let newTasks = previousTasks.map(task => ({
            ...task,
            id: crypto.randomUUID(),
            done: [false, false, false, false, false, false, false]
        }));

        // import to current week
        let weekKey:string = weekIndex.toString();
        if(! Array.isArray(goal.weeks[weekKey])){
            goal.weeks[weekKey] = [];
        }
        goal.weeks[weekKey] = [...goal.weeks[weekKey], ...newTasks];

        

    }

</script>

<Nav />
<main class="m-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Plan</h1>

<div class="m-6">
    <Button color="alternative" on:click={()=>goto('/')}><CaretLeftSolid/> Back</Button>
</div>

<div class="grid grid-cols-3 m-6">

    <div class="bg-amber-100 text-lg p-6">
        <h5 class="font-bold text-lg">Goal</h5>
        {#if goal} {goal.title} {/if}
    </div>

    <div class=" p-6">
        <h5 class="font-bold text-lg">Tactics</h5>
        <ul class="list-disc list-inside">
        {#if goal}
            {#each goal.tactics as tactic}
                <li>{tactic.description}</li>
            {/each}
        {/if}
        </ul>
    </div>

    <div class="p-6">
        <h5 class="font-bold text-lg">Outcomes</h5>
        <ul class="list-disc list-inside">
        {#if goal}
            {#each goal.outcomes as outcome}
                <li>{outcome.description}</li>
            {/each}
        {/if}
    </ul>
    </div>

</div>

<div class="m-6">
      

    <Button color="green" on:click={saveEdit} class="mb-6">Save changes</Button>
        
       
    {#if data}
    <Accordion>
        {#each { length: 12 }, weeknbr}
            <AccordionItem class={accordionColours[weeknbr]} >

                <span slot="header">Week {weeknbr + 1}</span>

                <div class="flex justify-end mb-4">
                    <div class="w-fit">
                    {#if weeknbr >= 1}
                    <Button color="grey" on:click={()=>importLastWeeksTasks(weeknbr)}> Import previous week's tasks</Button>
                    {/if}
                </div>
                <div class="w-fit">
                    <Button color="blue" on:click={() => addTask(weeknbr)}>New task</Button>
                </div>
                </div>
                

                {#each goal.weeks[weeknbr] as task}
                    
                    <div class="flex mb-4 space-x-2">
                        <div class="w-3/5">
                            <Label>Task title</Label>
                            <Input bind:value={task.title} placeholder="e.g. write 500 words"/>
                        </div>
                        <div class="w-1/5">
                        <Label>Frequency</Label>
                        <Select items={frequencyValues} bind:value={task.frequency} placeholder="every day"/>
                        
                        </div>
                        <div class="w-1/5">
                            <Button color="red" on:click={() => removeTask(weeknbr,task.id)}>X</Button>
                        </div>
                    </div>
                    
                    
                {/each}
            </AccordionItem>
        {/each}
    </Accordion>
    {/if}
</div>
</main>