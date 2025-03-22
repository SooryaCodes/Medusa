"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import { Globe, Shield, Clock, Users, Zap, CheckCircle, Lock, ChevronRight } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();

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

  const verifyAadhaar = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      toast.error("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    toast.success("A verification code has been sent to your registered mobile number.");
    setStep(2);
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    toast.success("You have successfully registered with Medusa.");
    router.push("/dashboard");
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
      
      <div className="w-full flex flex-col-reverse lg:flex-row z-10">
        {/* Left Section - Modern Feature Display - Hidden on mobile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 p-4 lg:py-12 lg:px-16 flex flex-col justify-center relative overflow-hidden hidden lg:flex"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center space-x-3 mb-12 lg:mb-16"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">Medusa</h1>
          </motion.div>

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

        {/* Right Section - Streamlined Registration - Shown first on mobile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 bg-gray-50"
        >
          {/* Mobile-only simplified header */}
          <div className="flex items-center space-x-3 mb-6 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Medusa</h1>
          </div>
          
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
                className="bg-white rounded-xl border border-gray-100 p-6"
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
                
                <form onSubmit={verifyAadhaar} className="space-y-6">
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
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
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
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
                className="bg-white rounded-xl border border-gray-100 p-6"
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
                
                <form onSubmit={verifyOtp} className="space-y-6">
                  <div className="flex justify-center gap-2">
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
                        className="h-12 w-10 text-center text-lg font-medium rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800"
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
                  >
                    Verify & Complete
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
