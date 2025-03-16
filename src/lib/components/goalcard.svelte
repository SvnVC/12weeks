<svelte:options customElement={{ tag: 'goal-card', shadow: 'none' }} />

<script lang="ts">
   import {Card, Progressbar, Button, Toggle} from 'flowbite-svelte';
   import {CalendarEditSolid, PenSolid, ChartLineUpOutline} from 'flowbite-svelte-icons';
  
  
// example here https://svelte.dev/playground/untitled?version=5.23.0#H4sIAAAAAAAAE41Ry2rDMBD8FSECtqkTt1fHFpSSL-ix7sFRNkTEXglrnTYY_3uRlDgxTaEHIfYxs7szA9-rBizPPwZOZwM89wmecqxbF70as7InaMjltrWFR3mpkQDJ8pwXVnbKkKiwItUa3RGLVtk7gTHQXRDR2lXda4CY1D0SK9nCUk0QPyfrCovsRoNFe17aQOAwGncgO2gBqRzihJXiQrEs2csYOhQ-7HgKHaLIbpRhhBG-I2eD_8ciM4KnnOCbeE5dD2P6h0Dz0-Yi_arNhPLJXBtSGi2TvSXdbpqwdsXvjuYsC1veabvvUTog2ylrapKH2G2XsMFLS4uDthQnq2t1cwKkGOGLvYU5PvaQxLsxOkPmsm97Io1Mo2yUPF6VnOZFkw1RMoopKLKAE_9gmGxyDFMwMcwN-Bx_ABXQWmOtAgAA
//   https://svelte.dev/docs/svelte/$host
function dispatch(type){
  const host = $host();
  console.log("host: ",host);
    host.dispatchEvent(new CustomEvent(type));
  }

  let props = $props();
  
  


  
</script>

<Card class="min-w-[300px]">
    <!-- Edit Button in Top-Right Corner -->

    <h5
      class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
    >
      {props.title}
    </h5>

    <p
      class="font-normal text-gray-700 dark:text-gray-400 leading-tight"
    ></p>

    <div class="flex justify-between mt-1">
      <span>Week {props.currentweek} / 12</span>
      <span>{Math.round((Number(props.currentweek) / 12) * 100)}%</span>
    </div>
    
    
    <Progressbar
      progress={(Number(props.currentweek) / 12) * 100}
      progressClass="bg-lime-600 dark:bg-lime-400"
    />

    <div class="flex justify-between mt-1">
      <span>This week's progress</span>
      <span>{props.currentweekprogress}%</span>
    </div>
    <Progressbar
      progress={props.currentweekprogress}
    progressClass="bg-lime-600 dark:bg-lime-400"
    />

    <div class="flex items-center justify-between mt-6">
      <Button
        class="w-fit"
        color="yellow"
        href="/goals/{props.id}/edit"
        pill><PenSolid class="w-4 h-4" /></Button
      >
      <Button size="sm" color="blue" href="/goals/{props.id}/plan" pill
        ><CalendarEditSolid class="w-4 h-4" /></Button
      >

      <Button size="sm" color="light" pill href="/goals/{props.id}/milestones"><ChartLineUpOutline/></Button>

      <Toggle
        checked={props.status === "active"}
        on:change={() => dispatch('change')}
        size="small"
        color="green"
      >
        <span class="text-sm text-gray-700 dark:text-gray-400"> </span>
      </Toggle>
    </div>
  </Card>