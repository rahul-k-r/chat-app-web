import React from "react";
import "./App.css";
import SignIn from "./auth/SignIn";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase.utils";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SignUp from "./auth/SignUp";
// import Navigation from "./Route/Navigation";
import Navigation from "./router/Navigation";

const App = () => {
  const [userName, setUserName] = React.useState("");
  const [authenticated, setAuthenticated] = React.useState(false);
  const user = auth.currentUser;
  onAuthStateChanged(auth, (user) => {
    if (user != null) {
      setUserName(user?.displayName);
      setAuthenticated(true);
    } else setAuthenticated(false);
  });

  // return <Navigation authenticated={authenticated} />;
  return (
    <div>
      <Navigation
        authenticated={authenticated}
        setAuthenticated={setAuthenticated}
        user={user}
      />
      {/* {user ? (
        <div className="app">
          <h1>Hello, {user.displayName}</h1>
          <h1>You are signed in as {user.email}</h1>
          <button onClick={logout}>Sign Out</button>
        </div>
      ) : (
        <SignIn />
      )} */}
    </div>
  );
};

export default App;
