
<script>
    export const prerender = false; // Disable prerendering
import  Nav  from '$lib/components/nav.svelte';
import { page } from '$app/stores';

let id = $page.params.id;

</script>


<Nav/>

<h2>Edit goal</h2>
Editing id number


{JSON.stringify($page, null, 2)}
<br/>
id found:
{JSON.stringify(id)}


