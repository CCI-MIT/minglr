import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
import Home from "./pages/Home";
import Group from "./pages/Group";
import Consent from "./pages/Consent";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ValidateRegistration from "./pages/ValidateRegistration"
import TermsOfService from "./pages/TermsOfService";
import { LinkedInPopUp } from 'react-linkedin-login-oauth2';

import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
  timeout: 5000,
  position: positions.TOP_RIGHT,
  offset: '25px',
  containerStyle: {
    zIndex: 999,
  }
};

function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <Provider template={AlertTemplate} {...options}>
        <Switch>
          <Route exact path="/" component={Auth(Consent, false)} />
          <Route exact path="/login" component={Auth(Consent, false)} />
          <Route exact path="/signup" component={Auth(Signup, false)} />

          <Route exact path="/home" component={Auth(Home, true)} />
          <Route path="/group/:id" component={Auth(Group, true)} />

          <Route exact path="/forgotpassword" component={Auth(ForgotPassword, false)} />
          <Route path="/resetpassword/:token" component={Auth(ResetPassword, false)} />
          <Route path="/validateregistration/:token" component={Auth(ValidateRegistration, false)} />
          <Route exact path="/termsofuse" component={TermsOfService} />
          <Route exact path="/linkedin" component={LinkedInPopUp} />

          getValidatedWithLinkedinUser

        </Switch>
      </Provider>
    </Suspense>
  );
}

export default App;
