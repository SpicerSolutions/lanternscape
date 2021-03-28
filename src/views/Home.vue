<template>
  <div class="root">
    <div class="container">
      <div id="header">
        <div class="row text-right">
          <div class="twelve columns">
            <small id="version-no">Version</small>
          </div>
        </div>
        <h1>LanternScape</h1>              
      </div>
      <div id="home-page">
        <button id="login_login" class="button-primary">Login</button>
      </div>
      <div id="channel-page" class="hidden">
        <div class="row">
          <div class="ten columns">
            <select name="channel" id="channels" class="u-full-width">
              <option value="" selected disabled>Choose</option>
            </select>
          </div>
          <div class="two columns">
            <button id="refresh-channel" class="button-primary"><span class="icon-refresh"></span></button>
          </div>
        </div>
        <div class="row">
          <div class="twelve columns">
            <button id="join-channel" class="button-primary"><span class="icon-enter"></span> Join Channel</button>
          </div>
        </div>
      </div>
      <div id="joined-page" class="hidden">
        <div class="row">
          <div class="twelve columns">
            <button id="open-devices" class="button-primary">Lanterns</button>
          </div>
        </div>
        <div class="row">
          <div class="three columns">
            <button id="power" class="button-primary"><span class="icon-switch"></span></button>
          </div>
          <div class="one column">
            <label for="brightness"><span class="icon-sun"></span></label>
          </div>
          <div class="eight columns">
            <div class="switch">
              <input type="range" max="255" min="0" name="brightness" id="brightness">
            </div>
          </div>
        </div>                      
        <p><strong>Disable effects</strong></p>
        <div class="row pb-3">
          <div class="six columns">
            Lightning
          </div>
          <div class="six columns">
            <div class="switch">
              <input type="checkbox" name="disabled_effects" id="lightning" value="lightning" /><label for="lightning">Toggle</label>
            </div>
          </div>
        </div>
        <div class="row pb-3">
          <div class="six columns">
            Strobe
          </div>
          <div class="six columns">
            <div class="switch">
              <input type="checkbox" name="disabled_effects" id="strobe" value="strobe" /><label for="strobe">Toggle</label>
            </div>
          </div>
        </div>
        <div class="row pb-3">
          <div class="six columns">
            Strobe mega
          </div>
          <div class="six columns">
            <div class="switch">
              <input type="checkbox" name="disabled_effects" id="strobe-mega" value="strobe-mega" /><label for="strobe-mega">Toggle</label>
            </div>
          </div>
        </div>
        <div class="row pb-3">
          <div class="six columns">
            Strobe rainbow
          </div>
          <div class="six columns">
            <div class="switch">
              <input type="checkbox" name="disabled_effects" id="strobe-rainbow" value="strobe-rainbow" /><label for="strobe-rainbow">Toggle</label>
            </div>
          </div>
        </div>
        <div class="row pb-3">
          <div class="twelve columns">
            <p><small>Disabled effects are never sent to the lantern</small></p>
          </div>
        </div>      
        <div class="row">
          <div class="twelve columns">
            <button id="leave-channel" class="button-primary"><span class="icon-exit"></span> Leave</button>
          </div>
        </div>
      </div>
      <div id="device-page" class="hidden">
        <div class="row">
          <div class="twelve columns">
            <button id="close-devices" class="button-primary">Close</button>
          </div>
        </div>
        <div class="row">
          <div class="four columns">
            <label for="devices">Devices</label>
          </div>
          <div class="eight columns">
            <select name="devices" id="devices" class="u-full-width">
              <option value="" selected disabled>Choose</option>
            </select><br>
            <button id="delete-device" class="button-primary"><span class="icon-bin"></span></button>
          </div>
        </div>
        <div class="row">
          <div class="four columns">
            <label for="device_address">Lantern identifier</label>
          </div>
          <div class="eight columns">
            <input type="text" name="device_address" id="device_address" class="u-full-width"><br>
            <button id="add-device" class="button-primary"><span class="icon-plus"></span></button>
          </div>
        </div>
        <div class="row">
          <div class="twelve columns">
            <small>The IP address or hostname of you lantern.</small>
          </div>
        </div>
        
      </div>   
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Home"
});
</script>
