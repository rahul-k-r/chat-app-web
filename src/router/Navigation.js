import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase.utils";
import Grid from "@material-ui/core/Grid";
import Home from "./Home";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";
// import Dashboard from "./Dashboard";
// import ProtectedRoute from "./ProtectedRoute";

const Navigation = (props) => {
  const navigate = useNavigate;
  const logout = (e) => {
    console.log(props);
    signOut(auth);
    props.setAuthenticated(false);
    navigate("/");
  };
  return (
    <Router>
      <div>
        <Grid>
          {/* {props.authenticated && <NavLink to="/">Home</NavLink>}
          {!props.authenticated && <NavLink to="/SignIn">SignIn</NavLink>}
          {!props.authenticated && <NavLink to="/SignUp">SignUp</NavLink>} */}
          {/* <NavLink to="/Dashboard">Dashboard</NavLink> */}
          {/* <ProtectedRoute path="/Dashboard" component={Dashboard} /> */}
        </Grid>
        <Routes>
          <Route
            path="/"
            element={
              props.authenticated ? (
                <Home user={props.user} logout={logout} />
              ) : (
                <SignIn />
              )
            }
          />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          {/* <Route path="/Dashboard" element={<Dashboard />} /> */}
        </Routes>
      </div>
    </Router>
  );
};
export default Navigation;
