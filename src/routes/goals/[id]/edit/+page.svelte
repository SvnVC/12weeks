
<script lang="ts">
    export const prerender = false; // Disable prerendering
    import  Nav  from '$lib/components/nav.svelte';
    import { page } from '$app/state';
    import { CaretLeftSolid, CircleMinusSolid, CirclePlusSolid } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { Button, Toggle, Select, Datepicker, Label, Input, Textarea } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import type { Goal, Vision } from '$lib/types';
    import { loadData, saveData } from '$lib/storage';
    

    let goalID:string = page.params.id;
    let data:Vision;

    let goal:Goal;
    let startDate:Date = new Date();

    function goBack(){
        goto('/');
    }

    onMount( async () => {
        data = await loadData();
        goal = data.goals.find( goal => goal.id == goalID)!; 
        if(goal){
            startDate = new Date(goal.startDate);
        }
        

    });
    
    let statusValues = [
        {value:"planned", name:"Planned"},
        {value:"active", name:"Active"},
        {value:"archived", name:"Archived"},
    ];

    async function updateData(){
        if(!goal || !data){
            return;
        }


        goal.startDate = startDate?.toISOString();

        // replace the original goal with the updated goal
        data.goals = data.goals.map( g => (g.id === goalID ? goal : g));

        
        await saveData(data);
        goto('/');
    }

    async function deleteGoal(){
        data.goals = data.goals.filter(g => g.id !== goalID);

        await saveData(data);

        goto('/');
    }

    function addTactic(){
        goal.tactics = [...goal.tactics, { id: crypto.randomUUID(), description: "" }];
    }

    function removeTactic(tacticIndex:number){
        goal.tactics = goal.tactics.filter((_,i) => i !== tacticIndex);
    }

    function addOutcome(){
        goal.outcomes = [ ...goal.outcomes, { id: crypto.randomUUID(), description: "", result:"", done:false}];
    }

    function removeOutcome(outcomeIndex:number){
        goal.outcomes = goal.outcomes.filter((_,i) => i !== outcomeIndex);
    }
 
    </script>
    
    
    <Nav/>

    <main class="m-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Edit goal</h1>

    <Button color="alternative" on:click={()=>goto('/')}><CaretLeftSolid/> Back</Button>

    
  

    <div class="mt-4">
    {#if data}
    

        <div class="mb-4">
            <Label>Title</Label>
            <Input bind:value={goal.title} placeholder="e.g. become filthy rich"/>
        </div>
        <div class="mb-4">
            <Label>Description (why does it matter ? )</Label>
            <Textarea bind:value={goal.description} placeholder="e.g. Because I want to buy 3 ferrari's"/>
        </div>

        <div class="mb-4">
            <Label>Status</Label>
            <Select class="mt-2" items={statusValues} bind:value={goal.status}/>
        </div>

        <div class="mb-4">

            <Label>Start date</Label>
            <Datepicker color="green" bind:value={startDate} showActionButtons />  
            
        </div>
        
        <div class="flex mb-4">
            <div class="w-1/2">
              <div class="flex justify-between">
              <Label>Tactics</Label>
              <Button on:click={addTactic}><CirclePlusSolid color="green"/></Button>
            </div>
              
              {#each goal.tactics as tactic, index}
                <div class="flex">
                  <div class="w-4/5">
                    <Input bind:value={tactic.description}></Input>
                  </div>
                  <div class="w-1/5">
                    <Button on:click={() => removeTactic(index)}
                      ><CircleMinusSolid color="red"/></Button>
                  </div>
                </div>
              {/each}
        
              
        
        
            </div>
            <div class="w-1/2">
              <div class="flex justify-between">
              <Label>Measurable outcomes</Label>
              <Button on:click={addOutcome}><CirclePlusSolid color="green"/></Button>
            </div>
        
              {#each goal.outcomes as outcome, index}
                <div class="flex">
                  <div class="w-4/5">
                    <Input bind:value={outcome.description}></Input>
                  </div>
                  <div class="w-1/5">
                    <Button on:click={() => removeOutcome(index)}><CircleMinusSolid color="red"/></Button>
                  </div>
                </div>
                
                
              {/each}
          
               
            </div>
          </div>


          <div class="flex justify-end gap-6">
            <Button color="alternative" on:click={()=>goto('/')}><CaretLeftSolid/> Back</Button>
        <Button color="green" on:click={()=> {updateData()}}>Update</Button>
        <Button color="red" on:click={deleteGoal}>Delete</Button>
      </div>

    {/if}
</div>
    
</main>
    
    
    
    