<script lang="ts">
  type GalleryImage = {
    url: string;
    pathname: string;
  };

  let selectedFile = $state<File | null>(null);
  let imageUrl = $state('');
  let error = $state('');
  let images = $state<GalleryImage[]>([]);

  async function uploadImage() {
    if (!selectedFile) return;

    error = '';
    const form = new FormData();
    form.append('file', selectedFile);

    const response = await fetch('/api/blob', {
      method: 'POST',
      body: form
    });

    const data: { error?: string; url?: string } = await response.json();

    if (!response.ok) {
      error = data.error ?? 'Upload failed';
      return;
    }

    imageUrl = data.url ?? '';
  }

  async function loadImages() {
    const response = await fetch('/api/blob');

    if (!response.ok) {
      error = 'Failed to load images';
      return;
    }

    images = await response.json();
  }

  async function deleteImage(pathname: string) {
    const response = await fetch('/api/blob', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pathname })
    });

    if (!response.ok) {
      error = 'Failed to delete image';
      return;
    }

    await loadImages();
  }
</script>

<h1>My Cloud Gallery</h1>

<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onchange={(event) =>
    selectedFile = event.currentTarget.files?.[0] ?? null
  }
/>

<button onclick={uploadImage} disabled={!selectedFile}>
  Upload
</button>

{#if error}
  <p>{error}</p>
{/if}

{#if imageUrl}
  <p>Upload successful!</p>
  <a href={imageUrl} target="_blank" rel="noreferrer">
    Open uploaded file
  </a>
  <img
    src={imageUrl}
    alt="Uploaded preview"
    width="320"
  />
{/if}

<h2>My Gallery</h2>

<button onclick={loadImages}>
  Load Gallery
</button>

<div class="gallery">
  {#each images as photo (photo.pathname)}
    <div>
      <img
        src={photo.url}
        alt={photo.pathname}
        width="160"
      />
      <p>{photo.pathname}</p>
      <button onclick={() => deleteImage(photo.pathname)}>
        Delete
      </button>
    </div>
  {/each}
</div>

<style>
  img {
    display: block;
    margin-top: 12px;
  }

  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 20px;
  }
</style>
