<script lang="ts">
    import { loadData, saveData } from "$lib/storage";
    import Nav from "$lib/components/nav.svelte";
    import { onMount } from "svelte";
    import type { Goal, Task, Vision, Week } from "$lib/types";
    import { page } from "$app/state";
    import { AccordionItem, Accordion, Button, Input, Select, Label, Textarea, Helper } from "flowbite-svelte";
    import { CaretLeftSolid } from 'flowbite-svelte-icons';
    import { goto } from "$app/navigation";


    let data: Vision;


    onMount(async () => {
        // load total data from json file
        data = await loadData();


    });

    async function update(){
        data.updated = new Date().toISOString();
        await saveData(data);

        goto('/');
    }

    </script>

    <Nav/>
    <main class="mx-auto p-6 min-h-screen">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Vision</h1>
    <div class="m-6">

       
        <p class="mb-6">Describe your long term vision. Where do you see yourself in 1, 3 or 5 years time?</p>
        {#if data}
        
            <Textarea bind:value={data.vision}></Textarea>

        {/if}

        <Button class="mt-4 w-full" color="blue" on:click={update}>Update</Button>
    </div>

    </main>