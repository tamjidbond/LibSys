import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../Popup/Popup";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
} from "firebase/auth";
import auth from "../../Firebase/Firebase.init";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  useEffect(()=>{
    const token = localStorage.getItem("token");
    (token) && navigate("/dashboard")
  },[navigate])

  useEffect(() => {
    setIsPasswordValid(password.length >= 6);
  }, [password]);

  useEffect(() => {
    const checkValidity = () => {
      if (isLogin) {
        return email.trim() && password.trim() && isPasswordValid;
      } else {
        return email.trim() && username.trim() && password.trim() && isPasswordValid;
      }
    };
    setIsFormValid(checkValidity());
  }, [email, password, isLogin, username, isPasswordValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await getIdToken(userCredential.user);
        localStorage.setItem("token", token);
        setSuccess("Login successful! Welcome back.");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        // Firebase Signup
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created successfully! You can now login.");
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-600 to-purple-600">
      <div className="relative bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 md:mx-auto">
        <div className="w-full max-w-md">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 text-center">
            {isLogin ? "Welcome Back!" : "Join Us"}
          </h2>

          {error && (
            <Popup type="error" message={error} onClose={() => setError("")} />
          )}

          {success && (
            <Popup
              type="success"
              message={success}
              onClose={() => {
                setSuccess("");
                if (isLogin) navigate("/dashboard");
              }}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="enter your email"
                required
              />
            </div>

            {!isLogin && (
              <div className="mb-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="enter your username"
                />
              </div>
            )}

            <div className="mb-6">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="enter your password"
                required
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4 rounded border-gray-300 bg-white/10"
                />
                <label htmlFor="showPassword" className="ml-2 text-sm text-white hover:text-yellow-300 cursor-pointer">
                  Show Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 md:py-3 text-sm md:text-base font-semibold rounded-lg transition-colors duration-300 ${
                isFormValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              disabled={!isFormValid}
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>

            {/* <p className="text-center text-white mt-4">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                className="text-yellow-300 hover:underline focus:outline-none transition"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
