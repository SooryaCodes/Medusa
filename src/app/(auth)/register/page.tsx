"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import { Globe, Shield, Clock, Users, Zap, CheckCircle, Lock, ChevronRight } from "lucide-react";
import axiosInstance from "@/lib/authAxios";
import { setCookie } from "cookies-next";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);

  const features = [
    {
      id: "comprehensive",
      title: "Complete Health Records",
      description: "Store all your medical history, reports, and prescriptions in one secure digital vault.",
      icon: <CheckCircle className="w-7 h-7 text-white" />,
    },
    {
      id: "security",
      title: "Military-Grade Security",
      description: "HIPAA-compliant platform with end-to-end encryption and advanced threat protection.",
      icon: <Shield className="w-7 h-7 text-white" />,
    },
    {
      id: "globalAccess",
      title: "Borderless Healthcare",
      description: "Access your medical information from anywhere and share with providers globally.",
      icon: <Globe className="w-7 h-7 text-white" />,
    },
    {
      id: "realtime",
      title: "Real-time Monitoring",
      description: "Instant updates for appointments, medications, and critical health metrics.",
      icon: <Clock className="w-7 h-7 text-white" />,
    },
    {
      id: "collaboration",
      title: "Provider Collaboration",
      description: "Enable seamless communication between all your healthcare professionals.",
      icon: <Users className="w-7 h-7 text-white" />,
    },
    {
      id: "performance",
      title: "Instant Accessibility",
      description: "Lightning-fast platform that works when seconds matter most.",
      icon: <Zap className="w-7 h-7 text-white" />,
    },
  ];

  // Auto-rotate features every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((current) => (current + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      toast.error("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/authenticate', {
        aadharNumber: aadhaarNumber
      });
      console.log(response.data)
      // Store the OTP for testing/debugging purposes
      // In a real app, OTP would be sent directly to the user's phone
      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
        alert("Debug - OTP received:"+ response.data.otp);
      }
      
      toast.success("A verification code has been sent to your registered mobile number.");
      setStep(2);
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/verify-otp', {
        aadharNumber:aadhaarNumber,
        otp: enteredOtp
      });
      console.log(response.data)
      if (response.data.token) {
        // Store the JWT token in a cookie
        setCookie('patientToken', response.data.token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
        });
        
        toast.success("You have successfully registered with Medusa.");
        router.push("/patient/dashboard");
      } else {
        toast.error("Verification failed. Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 opacity-95 z-0" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="h-full w-full grid grid-cols-6 md:grid-cols-12">
          {Array(24).fill(0).map((_, i) => (
            <div key={i} className="border-r border-t border-white/10"></div>
          ))}
        </div>
      </div>

      {/* Top Fixed Logo - Visible on all screen sizes */}
      <div className="absolute top-0 left-0 w-full z-20 px-4 py-3 sm:py-4 flex items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Medusa</h1>
        </div>
      </div>
      
      <div className="w-full flex flex-col-reverse lg:flex-row z-10 mt-16 sm:mt-20">
        {/* Left Section - Modern Feature Display */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 p-4 lg:py-12 lg:px-8 xl:px-16 flex flex-col justify-center relative overflow-hidden hidden lg:flex"
        >
          {/* Main headline - both mobile and desktop */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight text-white">
              Your Health Record,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                Reimagined.
              </span>
            </h2>
            <p className="mt-6 text-blue-100 text-lg md:text-xl max-w-md">
              A revolutionary platform where security meets simplicity — putting patients back in control.
            </p>
          </motion.div>
          
          {/* Feature highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                className={`p-4 border border-white/10 backdrop-blur-sm rounded-lg 
                  ${activeFeature === index ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'} 
                  transition-all duration-300 cursor-pointer group`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${activeFeature === index ? 'bg-blue-600' : 'bg-blue-800/50 group-hover:bg-blue-700/70'} transition-colors duration-300`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{feature.title}</h3>
                    <p className={`mt-1 text-sm ${activeFeature === index ? 'text-blue-100' : 'text-blue-200/70'} line-clamp-2 group-hover:line-clamp-none transition-all duration-300`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Spotlight feature display */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 md:mt-12 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-md p-6 rounded-xl border border-blue-500/20"
          >
            <h3 className="text-white text-lg font-medium flex items-center">
              <span className="flex h-6 w-6 rounded-full bg-blue-500 mr-3 items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </span>
              Spotlight Feature
            </h3>
            <div className="mt-4 flex items-start space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-lg">
                {features[activeFeature].icon}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{features[activeFeature].title}</h4>
                <p className="mt-2 text-blue-100">{features[activeFeature].description}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Section - Streamlined Registration */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-16 bg-gray-50"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-md"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-500 mb-8">Create a secure account in just two simple steps</p>
            
            <div className="mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={step === 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Verification</span>
                <span className={step === 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Confirmation</span>
              </div>
            </div>
            
            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-blue-50 p-4 rounded-full">
                    <Image 
                      src="/aadhaar.svg" 
                      alt="Aadhaar Logo" 
                      width={56} 
                      height={56}
                      className="h-14 w-14"
                    />
                  </div>
                </div>
                
                <form onSubmit={verifyAadhaar} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="aadhaar" className="text-sm font-medium text-gray-700 block mb-1.5">
                      Aadhaar Number
                    </label>
                    <div className="relative">
                      <input
                        id="aadhaar"
                        type="text"
                        placeholder="Enter 12-digit Aadhaar number"
                        value={aadhaarNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 12) setAadhaarNumber(value);
                        }}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm sm:text-base"
                        required
                      />
                      {aadhaarNumber.length > 0 && (
                        <div className="absolute right-3 top-3">
                          {aadhaarNumber.length === 12 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <span className="text-xs font-medium text-blue-600">{aadhaarNumber.length}/12</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Your Aadhaar will verify your identity and secure your medical records
                    </p>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Continue"}
                    {!isLoading && <ChevronRight className="w-4 h-4 ml-1" />}
                  </button>
                  
                  <div className="text-center">
                    <Link 
                      href="/login" 
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
                    >
                      <span>Already registered? Sign in</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-4">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Verification Code</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter the 6-digit code sent to your registered mobile
                  </p>
                </div>
                
                <form onSubmit={verifyOtp} className="space-y-4 sm:space-y-6">
                  <div className="flex justify-center gap-1 sm:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-10 sm:h-12 w-8 sm:w-10 text-center text-lg font-medium rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => {
                        toast.success("A new verification code has been sent to your registered mobile number.");
                      }}
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Complete"}
                  </button>
                  
                  <div className="text-center">
                    <Link 
                      href="/login" 
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
                    >
                      <span>Already registered? Sign in</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Mobile feature highlights - compact version */}
            <div className="mt-8 lg:hidden">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Benefits</h3>
              <div className="space-y-2">
                {features.slice(0, 3).map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>By registering, you agree to our</p>
              <div className="flex justify-center space-x-3 mt-1">
                <Link href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</Link>
                <span>&middot;</span>
                <Link href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
