import React, { Component } from 'react';
import Login from './Login';
import { NewRequest, ChangeRequest } from './Request';
import StateRequest from './StateRequest';
import Home from './Home';
import NotFound from './NotFound';
import ReactNotification from 'react-notifications-component'
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { VPSPage } from './UIElements';
import { Backend } from './DataManager';
import Cookies from 'universal-cookie';
import { ListRequests } from './ListRequests';

import './App.css';
import 'react-notifications-component/dist/theme.css'


const types = new Object({
  approved: {
    api: '/api/v1/internal/requests/approved',
    dateFieldSearch: 'approved_date',
    title: 'Odobreni zahtjevi',
    headerDate: 'Datum odobrovanja',
    linkPath: 'odobreni-zahtjevi'
  },
  fresh: {
    api: '/api/v1/internal/requests/new',
    dateFieldSearch: 'request_date',
    title: 'Novi zahtjevi',
    headerDate: 'Datum podnošenja',
    linkPath: 'novi-zahtjevi'
  },
  rejected: {
    api: '/api/v1/internal/requests/rejected',
    dateFieldSearch: 'approved_date',
    title: 'Odbijeni zahtjevi',
    headerDate: 'Datum odbijanja',
    linkPath: 'odbijeni-zahtjevi'
  }
})

const ApprovedRequests = ListRequests(types.approved)
const FreshRequests = ListRequests(types.fresh)
const RejectedRequests = ListRequests(types.rejected)


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
    let goToURL = '/ui/novi-zahtjevi'

    response.active = true
    response.userdetails = json

    if (!response.userdetails.is_staff)
      goToURL = '/ui/novi-zahtjev'

    this.initalizeState(response).then(
      setTimeout(() => {
        history.push(goToURL);
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
    return fetch('/api/v1/configoptions')
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
      let propsPage = new Object({
        toggleAreYouSure: this.toggleAreYouSure,
        onLogout: this.onLogout,
        areYouSureModal: this.state.areYouSureModal,
        userDetails: userDetails
      })

      return (
        <BrowserRouter>
          <ReactNotification />
          <Switch>
            <Route exact path="/ui/novi-zahtjev"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <NewRequest {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/novi-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <FreshRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/odobreni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ApprovedRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/odobreni-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                  </VPSPage>}/>
            <Route exact path="/ui/odbijeni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <RejectedRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/stanje-zahtjeva"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <StateRequest {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/stanje-zahtjeva/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ChangeRequest {...props}/>
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
