<template>
  <!-- fill whatever height app.vue gives us -->
  <div class="min-h-inherit flex flex-col flex-1">
    <header
      class="bg-background/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
    >
      <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Navigation />
      </div>
    </header>

    <!-- this must grow and be the scroll area -->
    <main>
      <slot />
    </main>
  </div>
</template>
