<script>
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  import { CogOutline } from 'flowbite-svelte-icons';

  // as for the icon, the blue is #3B82F6, the green #65A30D using a gradient (45°).
  // built by icon.kitchen
</script>

<Navbar>
  <NavBrand href="/">
    
    <img src="/12weeks.png" alt="12 Week Year Icon" class="h-10 w-10 mr-2" />
   
   
  </NavBrand>
  <NavHamburger  />
  <NavUl >
    <NavLi href="/">Dashboard</NavLi>
    <NavLi href="/goals/new">Add Goal</NavLi>
    <NavLi href="/progress">Progress</NavLi>
    <NavLi href="/vision">Vision</NavLi>
    <NavLi href="/settings"><CogOutline/></NavLi>
  </NavUl>
</Navbar>