<template>
  <!-- fill whatever height app.vue gives us -->
  <div class="min-h-inherit flex flex-1 flex-col">
    <header
      class="bg-background/75 sticky top-0 z-50 -mb-px border-b border-gray-200 backdrop-blur dark:border-gray-800"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Navigation />
      </div>
    </header>

    <!-- this must grow and be the scroll area -->
    <main>
      <slot />
    </main>
  </div>
</template>
