<template>
    <aside :class="`${isExpanded && 'is-expanded'}`">
        <img :src="logo" alt="snitch" class="logo">
        <div class="menu-toggle-wrap">
            <button class="menu-toggle" @click="ToggleMenu">
                <Icon icon="guidance:wet-floor" class="flow"/>
            </button>
        </div>

        <h3>Menu</h3>
        <div class="menu">
          <router-link class="button" to="/mainpage">
            <span class="Logo"><Icon icon="guidance:yoga"/> </span>
            <span class="text">Home</span>
          </router-link>
          <router-link class="button" to="/profile">
            <span class="Logo"><Icon icon="guidance:skate-park"/> </span>
            <span class="text">Profile</span>
          </router-link>
          <router-link class="button" to="/">
            <span class="Logo"><Icon icon="guidance:bowling"/> </span>
            <span class="text">Turnament</span>
          </router-link>
        </div>

        <div class="flex"></div>

        <div class="menu">
          <router-link class="button" to="/settings">
            <span class="Logo"><Icon icon="guidance:24-hours"/> </span>
            <span class="text">Settings</span>
          </router-link>
          <router-link class="button" to="/login">
            <span class="Logo"><Icon icon="guidance:pull"/></span>
            <span class="text">LogOut</span>
          </router-link>
        </div>
    </aside>
</template>

<script setup >
import { Icon } from "@iconify/vue";
import { ref } from 'vue';

import logo from '../assets/logo.png';

const isExpanded = ref(localStorage.getItem("isExpanded") === "true")

//for rememnering users choice
const ToggleMenu = () => {
    isExpanded.value = !isExpanded.value

    localStorage.setItem("isExpanded", isExpanded.value)
}
</script>

<style lang="scss" scoped>

aside {
  position: fixed;
  display: flex;
  flex-direction: column;
  width: calc(2rem + 32px);
  min-height: 100vh; 
  overflow: hidden;
  padding: 1rem;

  background-color: var(--primary-color);
  color: var(--light);

  transition: 0.2s ease-out; 
//for settings
  .flex {
    flex: 1 1 0;
  }
  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--normal-space);

    position: relative;
    top: 0;
    transition: 0.2s ease-out;

    .menu-toggle{
      transition: 0.2s ease-out;
      background: transparent;
      border: none;
      margin-bottom: var(--logo-space);

      .flow {
        font-size: 2rem;
        transition: 0.2s ease-out;
      }

      &:hover {
        .flow {
          color: var(--icons-extanded);
          transform: translateX(0.5rem);
          transition: 0.2s ease-out;
        }
      }
    }
  }
  h3, .text {
    opacity: 0;
    transition: 0.3s ease-out;
  }
  h3{
    color: var(--grey);
    font-size: 0.875rem;
    margin-bottom: 0.5ren;
    text-transform: uppercase;
  }

  .menu{
    transition: 0.2s ease-out;
    margin: 0 -1rem;

    .button {
      display: flex;
      align-items: center;
      text-decoration: none;

      padding: 0.5rem 1rem;
      transition: 0.2 ease-out;
      .text {
          display: flex;
          color: var(--light);
          transition: 0.2 ease-out;
        }
      .Logo {
        font-size: 2rem;
        transition: 0.2s ease-out;
        color: var(--gold);
      }
      &:hover, &.router-link-exact-active {
        background-color:  var(--gold4);
        .Logo .text {
          color: var(--background-color);
        }
      }

      .router-link-exact-active {
        border-right: 5px solir var(--gold5)
      }
    }
    
  }

  &.is-expanded {
    width: var(--sidebar-width);
    .menu-toggle-wrap {
        top: -3rem;
        .menu-toggle {
          transform: rotateY(-180deg);
        }
    }
    .button .text, h3 {
      opacity: 1;
    }
    .button {
      .Logo{
        margin-right: 1rem;
      }
    }
  }
}

@media (max-width: 768px){
  aside {
      z-index: 96;
   }
} 

/*logos*/
.logo{
  margin-bottom: var(--big-space);
  width: 3rem; 
}
</style>