import Vue from "vue";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import { ipcRenderer, remote } from "electron";
import { AuthFlow, AuthStateEmitter } from "./flow";
import { log } from "./logger";

Vue.config.productionTip = false;

const echo = new Echo({
    broadcaster: "pusher",
    key: "810e1cfa36bfe18ccbac",
    cluster: "eu",
    disableStats: true,
    forceTLS: true,
    encrypted: true,
    wsHost: "www.lanternscape.com",
    wsPort: 6001,
    wssPort: 6001
  });

const pusher = Pusher;

const LOGIN_PAGE = 'login';
const CHANNEL_PAGE = 'channel';
const DEVICE_PAGE = 'device';
const JOINED_PAGE = 'joined';

const LOGIN_STATE = 'login';
const CHANNEL_STATE = 'channel';
const DEVICE_STATE = 'device';
const JOINED_STATE = 'joined';

const VERSION = remote.app.getVersion();
const versionNo = document.getElementById('version-no') as HTMLElement;

let localConfig:any;

new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount("#app");

function createVersion(version: string) {
  const versions = version.split('.');
  let major = 0;
  let minor = 0;
  let bug = 0;
  let computedVersion = 0;
  if ( versions.length!==3 ) {
    return 0;
  }
  major = parseInt(versions[0])*100;
  minor = parseInt(versions[1])*10;
  bug = parseInt(versions[2]);

  computedVersion = major+minor+bug;

  return computedVersion;
}

function renderVersion() {
  const url = "https://www.lanternscape.com/version.json";

  const versionElement = document.getElementById('version-no') as HTMLElement;

  axios({
      method: "GET",
      url: url,
      responseType: "json"
    }).then( response => {
      if ( createVersion(response.data.version)>createVersion(VERSION) ) {
        versionElement.innerHTML = "<a href=\"https://www.lanternscape.com\" target=\"_blank\">New version available</a>";
      } else {
        versionElement.innerHTML = "Version " + VERSION;
      }
    });
}

function canUseEffect(effect: number): boolean {

  let lookup = '';

  switch(effect) {
      case 23: lookup = 'strobe';
            break;
      case 25: lookup = 'strobe-mega';
            break;
      case 57: lookup = 'lightning';
            break;
      case 24: lookup = 'strobe-rainbow';
            break;      
  }
  
  return localConfig.disabled_effects.indexOf(lookup)===-1;
}

function sendUpdate(data: any) {
  
  const devices = localConfig.devices;  

  if ( typeof data.data !== "undefined") {
    const passedData = JSON.parse(data.data);
  
    if ( typeof passedData.url!=="undefined" &&
        typeof passedData.data!=="undefined" && 
        typeof passedData.data!=="undefined" ) {
  
      const controlData = JSON.parse(passedData.data);
  
      if ( controlData!==null ) {
        log( 'data is not null');
        if ( typeof controlData.seg !=='undefined' ) {
          log( 'have seg');
          if ( typeof controlData.seg.fx !=='undefined' ) {
            log( 'have fx');
            // if not an allowed type don't continue;
            if ( !canUseEffect(controlData.seg.fx) ) {
              return;
            }
          }
        }

        if ( controlData!==null ) {
          for( const device in devices ) {
  
            if ( typeof devices[device] !== "undefined" ) {
  
              const url = "http://"+devices[device]+passedData.url;
  
              switch( passedData.type.toLowerCase() ) {
                case "post":
                  axios.post(url,controlData);
                  break;
                case "get":
                  axios.post(url,controlData);
                  break;
              }
            }
          }
        }
      }
    }
  }
}

export class AuthHandler {

  private authFlow: AuthFlow = new AuthFlow();
  private authConfig: any;    
  private appView = LOGIN_PAGE;
  private pollInterval = 10000;
  private pollTimer: any;
  private powerState: any = "off";
  
  private homePage = document.getElementById('home-page') as HTMLElement;
  private channelPage = document.getElementById('channel-page') as HTMLElement;
  private devicePage = document.getElementById('device-page') as HTMLElement;
  private joinedPage = document.getElementById('joined-page') as HTMLElement;

  private handleSignIn = document.querySelector("#login_login") as HTMLElement;
  private channelSelection = document.querySelector("#channels") as HTMLSelectElement;    
  private deviceList = document.querySelector('#devices') as HTMLSelectElement;
  private newDevice = document.querySelector('#device_address') as HTMLInputElement;
  private handlePower = document.querySelector("#power") as HTMLElement;
  private handleChannelRefresh = document.querySelector("#refresh-channel") as HTMLElement;
  private handleChannelJoin = document.querySelector("#join-channel") as HTMLElement;
  private handleChannelLeave = document.querySelector("#leave-channel") as HTMLElement;
  private handleBrightness = document.querySelector("#brightness") as HTMLInputElement;
  private handleAddDevice = document.querySelector("#add-device") as HTMLElement;
  private handleDeleteDevice = document.querySelector("#delete-device") as HTMLElement;
  private handleOpenDevices = document.querySelector("#open-devices") as HTMLElement;
  private handleCloseDevices = document.querySelector("#close-devices") as HTMLElement;
  private handleLightningDisabledEffect = document.querySelector("#lightning") as HTMLInputElement;
  private handleStrobeDisabledEffect = document.querySelector("#strobe") as HTMLInputElement;
  private handleStrobeMegaDisabledEffect = document.querySelector("#strobe-mega") as HTMLInputElement;
  private handleStrobeRainbowDisabledEffect = document.querySelector("#strobe-rainbow") as HTMLInputElement;

  constructor() {

    // do .... something ... maybe
    this.initializeUi(); 

    window.addEventListener('unload',()=>{
      this.lamp("off");
    });

    localConfig = this.getLocalConfig();

    this.configureUi();
    this.bindDisabledEffects();

    this.handleSignIn.addEventListener('click', (event) => {
        this.signIn();
        event.preventDefault();
    });
      
    this.handleChannelRefresh.addEventListener('click',() => {
      if ( !this.authFlow.isTokenValid() ) {
          log("Token invalid");
          this.authFlow.performWithFreshTokens().then(accessToken => this.fetchChannels(accessToken) );
      } else {
          log("Token valid");
          this.fetchChannels(this.authConfig.access_token);
      }      
    });

    this.handlePower.addEventListener('click',() => {
      switch(this.powerState) {
        case "on": this.lamp("off");
                  break;
        case "off": this.lamp("on");
                break;                  
      }
    });

    this.handleChannelJoin.addEventListener('click',() => {
      const selectedChannel = this.channelSelection.value;

      if ( selectedChannel!='' ) {
        echo.channel(this.channelSelection.value).listen("update", sendUpdate);
        this.appView = JOINED_PAGE;
        this.updateUi();
        this.lamp("on");
      }            
    });

    this.handleChannelLeave.addEventListener('click',() => {
      const selectedChannel = this.channelSelection.value;

      if ( selectedChannel!='' ) {
        echo.leave(selectedChannel);
        this.appView = CHANNEL_PAGE;
        this.updateUi();        
      }
    });

    this.handleBrightness.addEventListener('change',() => {
      const brightness = parseInt(this.handleBrightness.value);

      localConfig.brightness = brightness;
      this.updateLocalConfig();

      const final = {data:''};
      const data = {
        type: 'post',
        url: '/json/si',
        data: ''
      };
      const control = {
        bri: brightness,
        transition: 7,
        v: true
      };
      data.data = JSON.stringify(control);
      final.data = JSON.stringify(data);

      sendUpdate(final);   

    });

    this.handleOpenDevices.addEventListener('click',() => {
      this.showDevices();
    });

    this.handleCloseDevices.addEventListener('click',() => {
      this.hideDevices();
      this.canPollForDevices();
    });

    this.handleAddDevice.addEventListener('click', () => {
      const newDevice = this.newDevice.value;

      if ( newDevice==='' ) {
        return;
      }

      const index = localConfig.devices.indexOf(newDevice);

      // prevent duplicates
      if (index===-1) {
        localConfig.devices.push(newDevice);
        this.updateLocalConfig();
      }

      this.configureUi();
    });

    this.handleDeleteDevice.addEventListener('click', () => {
      const deviceToBeRemoved = this.deviceList.value;

      const index = localConfig.devices.indexOf(deviceToBeRemoved);

      if (index!==-1) {
        localConfig.devices.splice(index,1);
        this.updateLocalConfig();
      }

      this.configureUi();
    });    

    this.authFlow.authStateEmitter.on(
      AuthStateEmitter.ON_TOKEN_RESPONSE, () => {
        log('AuthState Fired');
        this.updateUi();
  
        this.authFlow.performWithFreshTokens().then(accessToken => this.fetchChannels(accessToken) );

        const currentConfig = this.authFlow.getTokenJson();
        window.localStorage.setItem('config', JSON.stringify(currentConfig) );
        //  request app focus
        ipcRenderer.send('app-focus');

        this.appView = CHANNEL_PAGE;
        this.updateUi();        
      }
    );

    // check for config
    const rawAuthConfig = window.localStorage.getItem('config');
    let authValid = false;

    // if have config
    if ( rawAuthConfig !== null ) {
        try {
            this.authConfig = JSON.parse(rawAuthConfig);
            authValid = true;
        } catch ( e ) {
          authValid = false;
        }
    }

    //  if config is valid
    if ( authValid ) {
      log('Auth valid');
      this.authFlow.fetchServiceConfiguration().then( () => {
          this.authFlow.setAccessTokenResponse(this.authConfig);
          //   if token has expire - refresh token
          if ( !this.authFlow.isTokenValid() ) {
              log('Token invalid');
              this.authFlow.performWithFreshTokens().then(accessToken => this.fetchChannels(accessToken) );
          } else {
              log('Token valid');
              this.fetchChannels(this.authConfig.access_token);
          }
          this.appView = CHANNEL_PAGE;
          this.updateUi();
      });            
    }

    // on failure go to start page

    if ( !authValid ) {
      log('Auth invalid');
        this.appView = LOGIN_PAGE;
    }

    this.updateUi();
  }

  private bindDisabledEffects() {
    this.handleLightningDisabledEffect.addEventListener('change', ()=>{
      this.updateDisabledEffects(this.handleLightningDisabledEffect,'lightning');
    });
    this.handleStrobeDisabledEffect.addEventListener('change',()=>{
      this.updateDisabledEffects(this.handleStrobeDisabledEffect,'strobe');
    });
    this.handleStrobeMegaDisabledEffect.addEventListener('change',()=>{
      this.updateDisabledEffects(this.handleStrobeMegaDisabledEffect,'strobe-mega');
    });
    this.handleStrobeRainbowDisabledEffect.addEventListener('change',()=>{
      this.updateDisabledEffects(this.handleStrobeRainbowDisabledEffect,'strobe-rainbow');
    });
  }

  private updateDisabledEffects( element: HTMLInputElement, name: string ) {

    if ( element.checked && localConfig.disabled_effects.indexOf(name)===-1 ) {
      localConfig.disabled_effects.push(name);
    } else {
      const index = localConfig.disabled_effects.indexOf(name);
      localConfig.disabled_effects.splice(index,1);
    }
    this.updateLocalConfig();
  }

  private showDevices() {
    this.devicePage.classList.remove('hidden');
  }

  private hideDevices() {
    this.devicePage.classList.add('hidden');
  }  

  private fetchChannels(accessToken: any) {
    const request =
      new Request("https://www.lanternscape.com/api/list-channels", {
        headers: new Headers({ "Authorization": `Bearer ${accessToken}` }),
        method: 'GET',
        cache: 'no-cache'
      });

    fetch(request)
      .then(result => result.json())
      .then(user => {
        log("User Info ", user);

        // empty select

        this.removeOptions(this.channelSelection);

        if ( typeof user.channels!=='undefined' ){
          for( const channel in user.channels ) {
            const newOption = document.createElement('option');
            newOption.text = user.channels[channel].name;
            newOption.value = user.channels[channel].channel;
            this.channelSelection.add(newOption);
          }
        }

      })
      .catch(error => {
        log("Something bad happened ", error);
    });
  }

  signIn(username?: string): Promise<void> {
      if (!this.authFlow.loggedIn()) {
        return this.authFlow.fetchServiceConfiguration().then(
          () => this.authFlow.makeAuthorizationRequest(username));
      } else {
        return Promise.resolve();
      }
  }

  private updateLocalConfig() {
    window.localStorage.setItem('localConfig',JSON.stringify(localConfig));
  }

  private getLocalConfig() {
    
    const defaultConfig = {
      "devices": [],
      "brightness": 128,
      "disabled_effects": []
    }

    const rawLocalConfig = window.localStorage.getItem('localConfig');

    if ( rawLocalConfig === 'undefined' || rawLocalConfig === null ) {
      return defaultConfig;
    }

    try {
      return JSON.parse( rawLocalConfig );
    } catch (e) {
      return defaultConfig;
    }
  }

  private initializeUi() {
    /* */
    renderVersion();
  }    

  private configureUi() {
    /*
    iterate localConfig and set options
    brightness
    disabled effects    
     */
    if ( localConfig.brightness ) {
      this.handleBrightness.value = localConfig.brightness;
    }
    if ( localConfig.disabled_effects ) {
      for( const effect in localConfig.disabled_effects ) {
        const current = localConfig.disabled_effects[effect];
        switch( current ) {
          case 'lightning':
            this.handleLightningDisabledEffect.checked = true;
            break;
          case 'strobe':
            this.handleStrobeDisabledEffect.checked = true;
            break;
          case 'strobe-mega':
            this.handleStrobeMegaDisabledEffect.checked = true;
            break;
          case 'strobe-rainbow':
            this.handleStrobeRainbowDisabledEffect.checked = true;
            break;                                          
        }      
      }
    }

    // empty the list of devices
    this.deviceList.options.length=0;
    if ( localConfig.devices.length>0 ) {      
      for( const device in localConfig.devices ) {
        const newOption = document.createElement('option');
        newOption.text = localConfig.devices[device];
        newOption.value = localConfig.devices[device];
        this.deviceList.add(newOption);
      }
    } 
  }  

  private updateUi() {

    log( 'app state:'+this.appView );

    switch( this.appView ) {
      case LOGIN_PAGE:
        this.homePage.classList.remove('hidden');
        this.channelPage.classList.add('hidden');
        this.devicePage.classList.add('hidden');
        this.joinedPage.classList.add('hidden');
        break;
      case CHANNEL_PAGE:
        this.homePage.classList.add('hidden');
        this.channelPage.classList.remove('hidden');
        this.devicePage.classList.add('hidden');
        this.joinedPage.classList.add('hidden');        
        break;
      case JOINED_PAGE:
        this.homePage.classList.add('hidden');
        this.channelPage.classList.add('hidden');
        this.devicePage.classList.add('hidden');        
        this.joinedPage.classList.remove('hidden');
        if ( localConfig.devices.length===0 ) {
          this.showDevices();
        }
        this.canPollForDevices();
        break;
    }
  }

  private canPollForDevices() {
    if ( localConfig.devices.length>0 ) {
      this.startPolling();
    }
  }

  private startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval( this.pollDevices, this.pollInterval);
  }

  private stopPolling() {
    this.pollTimer = null;
  }

  private pollDevices() {

    const final = {data:''};
    const data = {
      type: 'get',
      url: '/json/si',
      data: ''
    };
    const control = {
      transition: 7,
      v: true
    };
    data.data = JSON.stringify(control);
    final.data = JSON.stringify(data);

    sendUpdate(final);   
  }

  private lamp(state: any) {

    this.powerState = state;
    const final = {data:''};
    const data = {
      type: 'get',
      url: '/json/si',
      data: ''
    };
    const control = {
      transition: 7,
      on: false,
      v: true
    };

    switch(state) {
      case 'on': control.on = true;
          break;
      case 'off': control.on = false;
          break;
    }

    data.data = JSON.stringify(control);
    final.data = JSON.stringify(data);

    sendUpdate(final);   
  }

  private removeOptions(selectElement: HTMLSelectElement) {
    let i;
    const L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }

  signOut() {
    this.authFlow.signOut();
    //this.userInfo = null;
    this.initializeUi();
  }

}

log('Init complete');
const authHandler = new AuthHandler();

