import React, { useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthContext } from './AuthContext';
import './AuthForm.css';
import { Authactions } from './Redux/Auth';
import { useDispatch } from 'react-redux';
import './AuthForm.css';

const AuthForm = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add the useNavigate hook

  const authCtx = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState(null);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
    setIsForgotPassword(false);
  };

  const forgotPasswordHandler = async () => {
    const enteredEmail = emailInputRef.current.value;

    setIsLoading(true);
    setError(null);

    try {
      await firebase.auth().sendPasswordResetEmail(enteredEmail);
      setError(null);
      // Display a success message to the user or redirect them to a confirmation page
      console.log('Password reset email sent.');
    } catch (error) {
      setError(error.message);
    }

    setIsLoading(false);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    const enteredConfirmPassword = confirmPasswordInputRef.current?.value;

    setIsLoading(true);
    setError(null);

    if (!isLogin && enteredPassword !== enteredConfirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const response = await firebase.auth().signInWithEmailAndPassword(enteredEmail, enteredPassword);
        const user = response.user;
        const expirationTime = new Date().getTime() + 3600000; // Set expiration time to 1 hour from now
        const email = enteredEmail.replace(/[@.]/g, "");
        dispatch(Authactions.login({ token: user.uid, email: email, expiration: expirationTime }));
        console.log(user.uid);
        // Redirect to the home page
        navigate('/Home');
      } else {
        const response = await firebase.auth().createUserWithEmailAndPassword(enteredEmail, enteredPassword);
        const user = response.user;
        const expirationTime = new Date().getTime() + 3600000; // Set expiration time to 1 hour from now
        authCtx.login(user.uid, expirationTime);
        // Redirect to the home page
        navigate('/Home');
      }
    } catch (error) {
      setError(error.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="container">
      <div className="box">
        <h1 className="heading">{isLogin ? 'Login' : 'Sign Up'}</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="email">
            <Form.Label className="label">Email</Form.Label>
            <Form.Control className="input" type="email" required ref={emailInputRef} />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label className="label">Password</Form.Label>
            <Form.Control className="input" type="password" required ref={passwordInputRef} />
          </Form.Group>

          {!isLogin && (
            <Form.Group controlId="confirmPassword">
              <Form.Label className="label">Confirm Password</Form.Label>
              <Form.Control className="input" type="password" required ref={confirmPasswordInputRef} />
            </Form.Group>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="button">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <Button variant="primary" type="submit">
                {isLogin ? 'Login' : 'Create Account'}
              </Button>
            )}
          </div>
        </Form>

        <div className="switch">
          {isLogin ? (
            <>
              <p>
                Don't have an account?{' '}
                <Link to="/signup" onClick={switchAuthModeHandler}>
                  Sign up
                </Link>
              </p>
              {!isForgotPassword && (
                <p>
                  <Link to="#" onClick={forgotPasswordHandler}>
                    Forgot Password?
                  </Link>
                </p>
              )}
            </>
          ) : isForgotPassword ? (
            <>
              <p>
                Remember your password?{' '}
                <Link to="/login" onClick={switchAuthModeHandler}>
                  Login
                </Link>
              </p>
              <p>
                <Link to="#" onClick={forgotPasswordHandler}>
                  Cancel
                </Link>
              </p>
            </>
          ) : (
            <>
              <p>
                Already have an account?{' '}
                <Link to="/login" onClick={switchAuthModeHandler}>
                  Login
                </Link>
              </p>
              <p>
                <Link to="#" onClick={forgotPasswordHandler}>
                  Forgot Password?
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;





