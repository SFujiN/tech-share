
<script lang="ts">
  import { onMount } from 'svelte';

  let name = $state('');
  let facts = $state<string[]>([]);
  let loading = $state(false);
  let error = $state('');

  async function addFact() {
    loading = true;
    error = '';

    try {
      const response = await fetch('https://catfact.ninja/fact');

      if (!response.ok) {
        throw new Error('Failed to fetch cat fact');
      }

      const data: { fact: string } = await response.json();
      facts = [...facts, data.fact];
    } catch {
      error = 'Could not load a cat fact.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    addFact();
  });
</script>

<input placeholder="Enter your name" bind:value={name} />
<span>{name}</span>
<ul>
  {#each facts as fact}
    <li>{fact}</li>
  {/each}
</ul>

{#if error}
  <p>{error}</p>
{/if}

<button onclick={addFact} disabled={loading}>
  {loading ? 'Loading...' : 'Add New Fact'}
</button>
