import Vue from "vue";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import { ipcRenderer } from "electron";
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
const LOGIN_IN = "Login";
const LOGIN_OUT = "Logout";

const LOGIN_PAGE = 'login';
const CHANNEL_PAGE = 'channel';
const DEVICE_PAGE = 'device';
const JOINED_PAGE = 'joined';

interface SnackBarOptions {
  message: string;
  timeout?: number;
  actionHandler?: (event: any) => void;
  actionText?: string;
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

export class AuthHandler {

  private appState = LOGIN_PAGE;

  private homePage = document.getElementById('home-page') as HTMLElement;
  private channelPage = document.getElementById('channel-page') as HTMLElement;
  private devicePage = document.getElementById('device-page') as HTMLElement;
  private joinedPage = document.getElementById('joined-page') as HTMLElement;

  private authFlow: AuthFlow = new AuthFlow();

  private handleSignIn =
    document.querySelector("#login_login") as HTMLElement;

  private fetchUserInfo =
    document.querySelector("#handle-user-info") as HTMLElement;

  private userCard = document.querySelector("#user-info") as HTMLElement;

  private userProfileImage =
    document.querySelector("#user-profile-image") as HTMLImageElement;

  private userName = document.querySelector("#user-name") as HTMLElement;

  private channelSelection = document.querySelector("#channels") as HTMLSelectElement;

  private snackbarContainer: any =
    document.querySelector("#appauth-snackbar") as HTMLElement;

  private handleChannelJoin =
    document.querySelector("#join-channel") as HTMLElement;

  constructor() {
    this.initializeUi();
    this.handleSignIn.addEventListener('click', (event) => {
      //if (this.handleSignIn.textContent === SIGN_IN) {
        this.signIn();
      //} else if (this.handleSignIn.textContent === SIGN_OUT) {
      //  this.signOut();
      //}
      event.preventDefault();
    });

    this.handleChannelJoin.addEventListener('click',() => {

      const selectedChannel = this.channelSelection.value;

      if ( selectedChannel!='' ) {
        echo.channel(this.channelSelection.value).listen("update", this.sendUpdate);
      }
      
    });

    this.fetchUserInfo.addEventListener('click', () => {
      /* */
    }); 

    this.authFlow.authStateEmitter.on(
      AuthStateEmitter.ON_TOKEN_RESPONSE, () => {
        this.updateUi();

        this.authFlow.performWithFreshTokens().then(accessToken => this.fetchChannels(accessToken) );

        const currentConfig = this.authFlow.getTokenJson();
        window.localStorage.setItem('config', JSON.stringify(currentConfig) );
        //  request app focus
        ipcRenderer.send('app-focus');
    });

    if ( this.fetchState() ) {
      this.appState = CHANNEL_PAGE;
      //this.fetchChannels();
    }

  }

  private fetchState() {

    let lastState = '';    

    lastState = window.localStorage.getItem('config')!;
    if ( typeof lastState === 'undefined' || typeof lastState === null ) {
      return false;
    }

    let decoded = '';

    try {
      decoded = JSON.parse(lastState);
    } catch (error) {
      return false;
    }
      
    if ( typeof decoded === null ) {
      return;
    }

    return true;
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
  
            if ( typeof user.channels!=='undefined' ){
              for( const channel in user.channels ) {
                const newOption = document.createElement('option');
                newOption.text = user.channels[channel].name;
                newOption.value = user.channels[channel].channel;
                this.channelSelection.add(newOption);
              }
            }
  
            // upload channel selection drop down with data returned
  
            // move channel joining to match the selected channel
  
            
  
            //this.userInfo = user;
            //this.updateUi();
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

  private initializeUi() {

  }

  // update ui post logging in.
  private updateUi() {

    switch( this.appState ) {
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
      case DEVICE_PAGE:
        this.homePage.classList.add('hidden');
        this.channelPage.classList.add('hidden');
        this.devicePage.classList.remove('hidden');        
        this.joinedPage.classList.add('hidden');
        break;
      case JOINED_PAGE:
        this.homePage.classList.add('hidden');
        this.channelPage.classList.add('hidden');
        this.devicePage.classList.add('hidden');        
        this.joinedPage.classList.remove('hidden');
        break;
    }
  }

  private showSnackBar(data: SnackBarOptions) {
    this.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  }

  private sendUpdate(data: any) {
    
    const devices = ['192.168.0.82'];

    if ( typeof data.data !== 'undefined') {

      const passedData = JSON.parse(data.data);
    
      if ( typeof passedData.url!=='undefined' &&
          typeof passedData.data!=='undefined' && 
          typeof passedData.data!=='undefined' ) {
  
        const controlData = JSON.parse(passedData.data);
  
        if ( controlData!==null ) {
          for( const device in devices ) {
    
            if ( typeof devices[device] !== 'undefined' ) {
  
              const url = "http://"+devices[device]+passedData.url;
  
              switch( passedData.type.toLowerCase() ) {
                case 'post':
                  axios.post(url,controlData);
                  break;
                case 'get':
                  axios.post(url,controlData);
                  break;
              }
            }
          }
        }
      }
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