<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
body {
  background-color: #111111;
  position: relative;
  height: 621px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #ffffff;
  background-color: #111111;

  .hidden {
    display: none;
  }
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #ffffff;

    &.router-link-exact-active {
      color: darken(#ffffff,10%);
    }
  }
}

#brightness {
    -webkit-appearance: none !important;
    width: 100%;
    height: 5px;
    background-color: #ffffff;
    border: 0px solid #ffffff;
    border-radius: 3px;
    margin: auto;
    transition: all 0.3s ease;
    &:hover {
      background-color: #ffffff;
    }
    &:focus {
      outline: none;
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none !important;
      width: 20px;
      height: 20px;
      background-color: #ffffff;
      border-radius: 50%;
    }
    &::-webkit-slider-thumb:hover {
      background-color: #ffffff;
    }
  }

  /*&input[type="range"]:hover {
    
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none !important;
    width: 20px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 50%;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    background-color: #ffffff;
  }
  input[type="range"]::-webkit-slider-thumb:active {

  }*/
//}

#header {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

h1 {
  font-family: im_fell_double_pica, sans-serif;
  font-size: 5.7rem;
  color: #ffffff;
}



#device-page {  
  padding: 5%;
  background-color: #111111;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 5px;
  border-top: 1px solid lighten(#111111,10%);
  border-left: 1px solid lighten(#111111,10%);
  border-bottom: 1px solid darken(#111111,10%);
  border-right: 1px solid darken(#111111,10%);  
}

.text-right{
  text-align: right;
}

.p {
  &-1 {
    padding: 0.25rem;
  }
  &-2 {
    padding: 0.5rem;
  }  
  &-3 {
    padding: 1rem;
  }
  &b-1 {
    padding-bottom: 0.25rem;
  }
  &b-2 {
    padding-bottom: 0.5rem;
  }  
  &b-3 {
    padding-bottom: 1rem;
  }
  &t-1 {
    padding-top: 0.25rem;
  }
  &t-2 {
    padding-top: 0.5rem;
  }  
  &t-3 {
    padding-top: 1rem;
  }
}

.switch {
  input[type=checkbox]{
    height: 0;
    width: 0;
    visibility: hidden;
    display:none;
  }
  label {
    cursor: pointer;
    text-indent: -9999px;
    width: 88px;
    height: 44px;
    background: darken(#111111,10%);
    display: block;
    border-radius: 22px;
    position: relative;
  }  
  label:after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 22px;
    transition: 0.3s;
  }

  input:checked + label {
    background: lighten(#111111,25%);
  }

  input:checked + label:after {
    left: calc(100% - 2px);
    transform: translateX(-100%);
  }

  label:active:after {
    width: 40px;
  }  
}

</style>
