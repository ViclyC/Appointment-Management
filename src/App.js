import React from 'react';
import './App.scss';
import Main from './page/main';
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
} from "@aws-amplify/ui-react";

function App({ signOut }) {
  return (
    <Main signOut={signOut} />
  );
}

export default withAuthenticator(App);