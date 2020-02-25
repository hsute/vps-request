import React, { Component } from 'react';
import Login from './Login';
import NewRequest from './NewRequest';
import Home from './Home';
import NotFound from './NotFound';
import { NotificationContainer } from 'react-notifications';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { VPSPage } from './UIElements';
import { Backend } from './DataManager';
import Cookies from 'universal-cookie';

import './App.css';
import 'react-notifications/lib/notifications.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.cookies = new Cookies();
    this.backend = new Backend();

    this.state = {
      userDetails: undefined,
      isSessionActive: undefined,
      areYouSureModal: false,
    };

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this);
  }

  onLogin(json, history) {
    let response = new Object();

    response.active = true
    response.userdetails = json

    this.initalizeState(response).then(
      setTimeout(() => {
        history.push('/ui/novi-zahtjevi');
      }, 50
    ))
  }

  onLogout() {
    this.setState({isSessionActive: false});
  }

  toggleAreYouSure() {
    this.setState(prevState =>
      ({areYouSureModal: !prevState.areYouSureModal}));
  }

  fetchConfigOptions() {
    return fetch('/api/v1/internal/config_options')
      .then(response => {
        if (response.ok)
          return response.json();
      })
  }

  initalizeState(response) {
    return Promise.all([this.fetchConfigOptions()])
      .then(([options]) => {
        this.setState({
          isSessionActive: response.active,
          userDetails: response.userdetails,
          configOptions: options,
        })
      })
  }

  componentDidMount() {
    this.backend.isActiveSession().then(response => {
      if (response) {
        this.initalizeState(response)
      }
    })
  }

  render() {
    let {isSessionActive, userDetails} = this.state

    if (!isSessionActive) {
      return (
        <BrowserRouter>
          <Switch>
            <Route
              path="/ui/"
              render={props =>
                  <Login onLogin={this.onLogin} {...props} />
              }
            />
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
      )
    }
    else if (isSessionActive && userDetails) {
      let propsPage = new Object()
      propsPage.toggleAreYouSure = this.toggleAreYouSure
      propsPage.onLogout = this.onLogout
      propsPage.areYouSureModal = this.state.areYouSureModal
      propsPage.userDetails = userDetails

      return (
        <BrowserRouter>
          <NotificationContainer/>
          <Switch>
            <Route exact path="/ui/novi-zahtjev"
              render={(props) =>
                  <VPSPage
                    {...propsPage}
                    {...props}>
                      <NewRequest/>
                  </VPSPage>}/>
            <Route exact path="/ui/novi-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}
                    {...props}>
                  </VPSPage>}/>
            <Route exact path="/ui/odobreni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}
                    {...props}>
                  </VPSPage>}/>
            <Route exact path="/ui/odbijeni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}
                    {...props}>
                  </VPSPage>}/>
            <Route exact path="/ui/stanje-zahtjeva"
              render={(props) =>
                  <VPSPage
                    {...propsPage}
                    {...props}>
                  </VPSPage>}/>
          </Switch>
        </BrowserRouter>
      )
    }
    else
      return null
  }
}

export default App;
