<script lang="ts">
    import { Card, Input, Button, Label, Fileupload } from "flowbite-svelte";
    import Nav from "$lib/components/Nav.svelte";
    import { open } from "@tauri-apps/plugin-dialog";
    import {
        readTextFile,
        writeTextFile,
        BaseDirectory,
        mkdir,
        exists,
    } from "@tauri-apps/plugin-fs";
    import { onMount } from "svelte";
    import type { Vision } from '$lib/types';
    import { saveData } from "$lib/storage";

    let jsonFilePath: string = "";
    let message: string = "";

    // Load saved path on mount
    /*onMount(async () => {
        try {
            const configContent = await readTextFile("config.json", {
                baseDir: BaseDirectory.AppData,
            });
            const config = JSON.parse(configContent);
            jsonFilePath = config.jsonFilePath || "";
        } catch (e) {
            // If config.json doesn’t exist yet, leave path empty
            jsonFilePath = "";
        }
    });*/


    
    // Save the JSON file path
    async function saveSettings() {

        console.log('save - path: ',jsonFilePath);
        if (!jsonFilePath) {
            message = "Please select a valid JSON file path.";
            return;
        }

        // check if our file is a json file

        if (!jsonFilePath.toLowerCase().endsWith(".json")) {
            message = "The file must have a .json extension.";
            return;
        }

        // see if file exists
        try {
        if (await exists(jsonFilePath) === false) {
            message = "the specified file does not exist.";
            return;
        }
    } catch(e){
        message = "Error reading file";
        console.log(e);
        return;
    }

    // if the file exists we need to try to read it and see if it contains the right data
    const data = await readTextFile(jsonFilePath, {});
    //console.log("reading data");
    //console.log(data);

    try {
        console.log("checking validity of file")
        const vision:Vision = JSON.parse(data);
        console.log(vision);

        const hasVision = typeof vision.vision === 'string';
        const hasGoals = Array.isArray(vision.goals);
        
        if(!hasVision || !hasGoals){
            message = 'File content not valid'
            return;
        }

    } catch (e) {
        console.log(e);
    }

    // si tout va bien jusqu'à ici, on va sauvegarder nos données dans notre fichier standard
    await saveData(JSON.parse(data));

    message = "Data imported successfully.";
        //console.log('exists? : ',await exists(jsonFilePath));

        /*try {
            // Ensure the AppData directory exists
            // recursive set to true means any intermediate directories will also be created
            await mkdir("", {
                baseDir: BaseDirectory.AppData,
                recursive: true,
            });
            const config = { jsonFilePath };
            await writeTextFile(
                "config.json",
                JSON.stringify(config, null, 2),
                {
                    baseDir: BaseDirectory.AppData,
                },
            );
            message = "Settings saved successfully!";
        } catch (e) {
            message = "Error saving settings.";
            console.log(e);
        }*/
    }
    let selectedFile: File | null = null;
    let parsedContent:Vision |null = null;

    async function handleFileChange(event:Event){
        //console.log("handle file change");
        //console.log(event.target);
        const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFile = input.files[0];
      let fileContent = await selectedFile.text();
        parsedContent = JSON.parse(fileContent);

        const hasVision = typeof parsedContent.vision === 'string';
        const hasGoals = Array.isArray(parsedContent.goals);
        
        if(!hasVision || !hasGoals){
            message = 'File content not valid'
            parsedContent = null;
            return;
        }

        // seems ok, let's save
        
      
    }

    

    }

    async function saveImportedData(){
        let newData:Vision = parsedContent!;

        await saveData(newData);
        message = "Data imported successfully";
    }
</script>

<Nav />

<main class="mx-auto p-6 min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Settings</h1>

    <div>
        <Label>Import data from file</Label>
        <Input type="file" accept=".json" bind:value={jsonFilePath} on:change={handleFileChange} class="w-fit"/>
        <Button color="blue" on:click={saveImportedData}>Import</Button>
        <div class="justify-start m-5">
        {#if message}
                <p
                    class="text-sm text-center w-fit"
                    class:text-green-600={message.includes("success")}
                    class:text-red-600={!message.includes("success")}
                >
                    {message}
                </p>
            {/if}
        </div>
    </div>

    

</main>