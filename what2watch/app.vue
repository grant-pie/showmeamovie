<template>
  <!--navbar-->
  <div class="bg-primary d-flex justify-content-center p-2">
      <a href="/"><img src="/assets/logo.png" alt="" width="200" height="102" class="d-inline-block align-text-top"></a>
  </div>
  <!--navbar end-->
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
  <!--footer-->
  <div class="bg-primary mt-5 d-flex flex-column align-items-center p-2 ">
      <img src="/assets/logo.png" alt="" width="100" height="51" class="d-inline-block align-text-top">

      <p class="small text-muted mt-2">
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" class="text-muted">
              Powered by TMDB
          </a>
      </p>
  </div>
  <!--footer end-->
</template>
