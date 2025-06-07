"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client"; // Import the auth client

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "", // Add name to formData
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) { // Add validation for name
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password needs at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don\'t match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.name, // Pass name to signUp
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrors((prev) => ({
          ...prev,
          server: error.message || "Registration failed. Please try again.",
        }));
      } else if (data) {
        // Handle successful registration
        router.push("/login?message=Registration successful! Please sign in.");
      }
    } catch (err) {
      // This catch block might be redundant if authClient.signUp.email always returns an error object
      setErrors((prev) => ({
        ...prev,
        server: err.message || "An unexpected error occurred during registration.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-16 h-16 rounded-full bg-green-200/30 blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-purple-200/30 blur-xl"></div>
      <div className="absolute top-1/2 right-20 w-12 h-12 rounded-full bg-blue-200/20 blur-lg"></div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="w-14 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Daira
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2 font-serif">
            Learn. Play. Grow.
          </h2>
          <p className="text-gray-600">
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <Card className="border-2 border-blue-100 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your details to register
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Server Error Alert */}
            {errors.server && (
              <Alert variant="destructive">
                <AlertDescription>{errors.server}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  {/* You can use a User icon or similar if you have one */}
                  {/* <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" /> */}
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-3 h-12 border-2 ${ // Adjusted padding if no icon
                      errors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-400"
                    } rounded-lg text-lg`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Parent&apos;s Email {/* Matched React component */}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 h-12 border-2 ${
                      errors.email 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-gray-200 focus:border-blue-400"
                    } rounded-lg text-lg`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Create Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 h-12 border-2 ${
                      errors.password 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-gray-200 focus:border-blue-400"
                    } rounded-lg text-lg`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 h-12 border-2 ${
                      errors.confirmPassword 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-gray-200 focus:border-blue-400"
                    } rounded-lg text-lg`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg rounded-lg transition-all duration-200 transform hover:scale-[1.01] shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                    Start Learning!
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-medium text-lg rounded-lg transition-all duration-200 transform hover:scale-[1.01]"
              onClick={() => router.push("/login")}
            >
              Sign In Here
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
