import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
import Home from "./pages/Home";
import Consent from "./pages/Consent";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import Policy from "./static/Policy";
import Terms from "./static/Terms";
import Support from "./static/Support";

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
          <Route exact path="/" component={Auth(Consent, true)} />
          <Route exact path="/home" component={Auth(Home, true)} />

          <Route exact path="/login" component={Auth(Consent, false)} />
          <Route exact path="/signup" component={Auth(Signup, false)} />

          <Route exact path="/forgotpassword" component={Auth(ForgotPassword, false)} />
          <Route path="/resetpassword/:token" component={Auth(ResetPassword, false)} />

          <Route exact path="/policy" component={Policy} />
          <Route exact path="/terms" component={Terms} />
          <Route exact path="/support" component={Support} />
        </Switch>
      </Provider>
    </Suspense>
  );
}

export default App;
