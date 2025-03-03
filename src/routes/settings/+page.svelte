<script lang="ts">
    import {
        Card,
        Input,
        Button,
        Label,
        Fileupload,
        Toggle,
    } from "flowbite-svelte";
    import Nav from "$lib/components/nav.svelte";
    import { open, message } from "@tauri-apps/plugin-dialog";
    import {
        readTextFile,
        writeTextFile,
        BaseDirectory,
        mkdir,
        exists,
    } from "@tauri-apps/plugin-fs";
    import { onMount} from "svelte";
    import type { Vision } from "$lib/types";
    import { loadData, saveData } from "$lib/storage";
    import { appDataDir } from "@tauri-apps/api/path";
    import { revealItemInDir } from "@tauri-apps/plugin-opener";

    let jsonFilePath: string = "";
    let errorMessage: string = "";
    let useCustomStorageLocation = false;
    let customStorageLocation:string = '';
    let configContent: string = "";
    let config = {
        customStorageLocation:'',
        useCustomStorageLocation:true
    };

    async function loadConfig() {
        try {
            configContent = await readTextFile("config.json", {
                baseDir: BaseDirectory.AppData,
            });
            config = JSON.parse(configContent);
        } catch (e) {
            console.log(e);
            
        }
    }

    onMount(async () => {
        await loadConfig();
        customStorageLocation = config.customStorageLocation;
        useCustomStorageLocation = config.useCustomStorageLocation;
        dir();
    });

    
    let selectedFile: File | null = null;
    let parsedContent: Vision | null = null;

    async function handleFileChange(event: Event) {
        //console.log("handle file change");
        //console.log(event.target);
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            selectedFile = input.files[0];
            let fileContent = await selectedFile.text();
            parsedContent = JSON.parse(fileContent);

            const hasVision = typeof parsedContent.vision === "string";
            const hasGoals = Array.isArray(parsedContent.goals);

            if (!hasVision || !hasGoals) {
                errorMessage = "File content not valid";
                parsedContent = null;
                return;
            }

            // seems ok, let's save
        }
    }

    async function saveImportedData() {
        let newData: Vision = parsedContent!;

        try {
            console.log("checking validity of file");
            

            const hasVision = typeof newData.vision === "string";
            const hasGoals = Array.isArray(newData.goals);

            if (!hasVision || !hasGoals) {
                errorMessage = "File content not valid";
                return;
            }
        } catch (e) {
            console.log(e);
            errorMessage = "Can not read file contents";
            return;
        }

        await saveData(newData);
        errorMessage = "Data imported successfully";
    }

    let app_data_dir: string = "";
    async function dir(): Promise<string> {
        app_data_dir = await appDataDir();
        // console.log(app_data_dir);
        return app_data_dir;
    }

    async function selectStorageLocation() {
        const selected = await open({
            directory: true,
            multiple: false,
            title: "Select Data Storage Location",
        });
        
        if (typeof selected === "string") {
            
                        customStorageLocation = selected;
            //errorMessage = "Storage location updated successfully!";
        }
    }

    async function setCustomStoragePath(newPath:string){
        // add new path to our config file
        config.customStorageLocation = newPath;

        await writeTextFile('config.json', JSON.stringify(config), {
            baseDir: BaseDirectory.AppData
        });

    }

    async function updateSettings(){

        if(useCustomStorageLocation == true && customStorageLocation == ''){
            await message('The custom storage location can not be empty.');
            return;
        }
        config.useCustomStorageLocation = useCustomStorageLocation;
        config.customStorageLocation = customStorageLocation;

        // copy the existing data to the new file first
        // we load it in memory
        const data:Vision = await loadData();
        
        // we change the settings
        await writeTextFile('config.json', JSON.stringify(config), {
            baseDir: BaseDirectory.AppData
        });
        // and copy the data
        await saveData(data);

        errorMessage = "Settings saved successfully.";
    }

</script>

<Nav />

<main class="mx-auto p-6 min-h-screen space-y-5">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Settings</h1>

    <div class="justify-start m-5">
        {#if errorMessage}
            <p
                class="text-sm text-center w-fit"
                class:text-green-600={errorMessage.includes("success")}
                class:text-red-600={!errorMessage.includes("success")}
            >
                {errorMessage}
            </p>
        {/if}
    </div>
    <div class="bg-gray-50 p-6 space-y-5">
        <h5 class="font-bold">Data storage</h5>

        <Toggle
            checked={useCustomStorageLocation}
            bind:value={useCustomStorageLocation}
            on:change={(e) => (useCustomStorageLocation = !useCustomStorageLocation)}
            color="green">Custom storage location</Toggle
        >

        <div class="space-y-4">
            {#if useCustomStorageLocation === false}
                Using the default storage location.<br />
                <span class="italic font-bold">{app_data_dir}</span>
            {:else}
            <div>
            {#if customStorageLocation !== ''}
            <span class="italic font-bold">{customStorageLocation}</span>
            {:else}
            <span class="text-red-500">No custom storage location defined.</span> 
            {/if}
        </div>
            
                <Button color="light" on:click={selectStorageLocation}
                    >Select Storage location</Button
                >
            {/if}
        </div>
    </div>


    <div class="bg-gray-50 p-6 space-y-5">
        <h5 class="font-bold">Import data from file</h5>

        <div class="flex gap-4">
        <Input
            type="file"
            accept=".json"
            bind:value={jsonFilePath}
            on:change={handleFileChange}
            class="w-fit"
        />
        <Button color="blue" on:click={saveImportedData}>Import from file</Button>
    </div>
        
    </div>

    <Button color="green" class="w-full" on:click={updateSettings}>Update settings</Button>
</main>
