import Vue from "vue";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import { ipcRenderer } from 'electron';
import { AuthFlow, AuthStateEmitter } from './flow';
import { log } from './logger';

Vue.config.productionTip = false;

const echo = new Echo({
  broadcaster: "pusher",
  key: "<app key>",
  cluster: "eu",
  disableStats: true,
  forceTLS: true,
  encrypted: true,
  wsHost: "<endoint url>",
  wsPort: 6001,
  wssPort: 6001
});

const pusher = Pusher;
const LOGIN_IN = 'Login';
const LOGIN_OUT = 'Logout';

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
  private authFlow: AuthFlow = new AuthFlow();

  private handleSignIn =
    document.querySelector('#login_login') as HTMLElement;

  private fetchUserInfo =
    document.querySelector('#handle-user-info') as HTMLElement;

  private userCard = document.querySelector('#user-info') as HTMLElement;

  private userProfileImage =
    document.querySelector('#user-profile-image') as HTMLImageElement;

  private userName = document.querySelector('#user-name') as HTMLElement;

  private snackbarContainer: any =
    document.querySelector('#appauth-snackbar') as HTMLElement;

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

    this.fetchUserInfo.addEventListener('click', () => {
      this.authFlow.performWithFreshTokens().then(accessToken => {
        let request =
          new Request('<user details and stuff>', {
            headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
            method: 'GET',
            cache: 'no-cache'
          });

        fetch(request)
          .then(result => result.json())
          .then(user => {
            log('User Info ', user);
            console.log(user);

            echo.channel('channel-1-curse-of-strahd').listen('update', this.sendUpdate);

            //this.userInfo = user;
            //this.updateUi();
          })
          .catch(error => {
            log('Something bad happened ', error);
          });
      });
    });

    this.authFlow.authStateEmitter.on(
      AuthStateEmitter.ON_TOKEN_RESPONSE, () => {
        this.updateUi();
        //  request app focus
        ipcRenderer.send('app-focus');
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
    //this.handleSignIn.textContent = SIGN_IN;
    //this.fetchUserInfo.style.display = 'none';
    //this.userCard.style.display = 'none';
  }

  // update ui post logging in.
  private updateUi() {
    //this.handleSignIn.textContent = SIGN_OUT;
    /*this.fetchUserInfo.style.display = '';
    if (this.userInfo) {
      this.userProfileImage.src = `${this.userInfo.picture}?sz=96`;
      this.userName.textContent = this.userInfo.name;
      this.showSnackBar(
        { message: `Welcome ${this.userInfo.name}`, timeout: 4000 });
      this.userCard.style.display = '';
    }*/
  }

  private showSnackBar(data: SnackBarOptions) {
    this.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  }

  private sendUpdate(data: string) {
    console.log(data);
  }

  signOut() {
    this.authFlow.signOut();
    //this.userInfo = null;
    this.initializeUi();
  }
}

log('Init complete');
const authHandler = new AuthHandler();