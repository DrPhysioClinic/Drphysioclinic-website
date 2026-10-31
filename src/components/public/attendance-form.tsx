"use client";

import { useState, useEffect } from "react";
import {
  initiateAttendance,
  verifyAttendance,
  submitExternalAttendance,
  type InitiateAttendanceState,
} from "@/app/actions/forms";
import {
  IconCheck,
  IconMail,
  IconKey,
  IconArrowLeft,
  IconRotateClockwise,
  IconBuildingHospital,
  IconHome,
} from "@tabler/icons-react";

export function AttendanceForm() {
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const [step, setStep] = useState<"input" | "verify" | "success">("input");
  const [attendanceDate, setAttendanceDate] = useState(todayStr);
  const [visitType, setVisitType] = useState<"clinic" | "home">("clinic");
  const [hasNoNumber, setHasNoNumber] = useState(false);

  // Form inputs
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Verification metadata from initiateAttendance
  const [verifyMeta, setVerifyMeta] = useState<InitiateAttendanceState | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInitiate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("attendance_date", attendanceDate);
      formData.set("visit_type", visitType);

      if (hasNoNumber) {
        // Direct submit for external walk-in visitors without a registered number
        const res = await submitExternalAttendance(formData);
        if (res.ok) {
          setSuccessMsg(res.message);
          setStep("success");
        } else {
          setError(res.message);
        }
      } else {
        // Registered patient verification by phone
        formData.set("phone", phone);
        const res = await initiateAttendance(formData);

        if (res.ok && res.mode && res.token) {
          setVerifyMeta(res);
          setVerificationCode("");
          setStep("verify");
          if (res.mode === "otp") {
            setCountdown(30); // 30s resend cooldown
          }
        } else {
          setError(res.message || "Failed to initiate verification.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verifyMeta?.token) return;

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("token", verifyMeta.token);
      formData.set("verification_code", verificationCode.trim());
      formData.set("phone", verifyMeta.phone || phone);
      formData.set("attendance_date", attendanceDate);
      formData.set("mode", verifyMeta.mode || "otp");
      formData.set("visit_type", verifyMeta.visitType || visitType);

      const res = await verifyAttendance(formData);
      if (res.ok) {
        setSuccessMsg(res.message);
        setStep("success");
      } else {
        setError(res.message);
      }
    } catch {
      setError("Failed to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !verifyMeta?.phone) return;
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("phone", verifyMeta.phone);
      formData.set("attendance_date", attendanceDate);
      formData.set("visit_type", verifyMeta.visitType || visitType);

      const res = await initiateAttendance(formData);
      if (res.ok && res.token) {
        setVerifyMeta(res);
        setCountdown(30);
      } else {
        setError(res.message || "Failed to resend code.");
      }
    } catch {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setVerificationCode("");
    setVerifyMeta(null);
    setError("");
    setSuccessMsg("");
    setPhone("");
    setName("");
    setHasNoNumber(false);
    setVisitType("clinic");
    setAttendanceDate(todayStr);
  };

  // -------------------------------------------------------------
  // STEP 3: SUCCESS VIEW
  // -------------------------------------------------------------
  if (step === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50/70 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <IconCheck className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900">Attendance Registered!</h3>
        <p className="text-slate-600 max-w-md mx-auto">{successMsg || "Your visit attendance has been successfully recorded."}</p>
        <button
          onClick={handleReset}
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: VERIFICATION VIEW (OTP or UNIQUE CODE)
  // -------------------------------------------------------------
  if (step === "verify" && verifyMeta) {
    const isOtp = verifyMeta.mode === "otp";

    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setStep("input");
            setError("");
          }}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" /> Change phone number
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            {isOtp ? <IconMail className="h-6 w-6" /> : <IconKey className="h-6 w-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isOtp ? "Enter Verification Code" : "Enter Unique Code"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Welcome, <strong className="text-slate-800">{verifyMeta.patientName}</strong>!
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700">
            {(verifyMeta.visitType || visitType) === "home" ? (
              <>
                <IconHome className="h-3.5 w-3.5 text-slate-500" />
                <span>Home Visit</span>
              </>
            ) : (
              <>
                <IconBuildingHospital className="h-3.5 w-3.5 text-slate-500" />
                <span>Clinic Visit</span>
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {isOtp
              ? `We have sent a 6-digit OTP to ${verifyMeta.maskedEmail}`
              : "Please enter the 6-character Unique Code assigned to your account."}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="verification_code" className="sr-only">
              {isOtp ? "6-digit OTP" : "Unique Code"}
            </label>
            <input
              type="text"
              id="verification_code"
              name="verification_code"
              required
              autoFocus
              maxLength={isOtp ? 6 : 8}
              value={verificationCode}
              onChange={(e) => setVerificationCode(isOtp ? e.target.value.replace(/\D/g, "") : e.target.value.toUpperCase())}
              placeholder={isOtp ? "• • • • • •" : "e.g. A7B9X2"}
              className={`w-full text-center rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-2xl font-bold tracking-[0.25em] text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                !isOtp ? "uppercase tracking-[0.2em]" : ""
              }`}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3.5 text-sm font-medium text-red-700 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || verificationCode.trim().length < (isOtp ? 6 : 4)}
            className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-center font-semibold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Complete Attendance"}
          </button>

          {isOtp && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 disabled:text-slate-400 transition-colors"
              >
                <IconRotateClockwise className="h-3.5 w-3.5" />
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1: INITIAL PHONE & DATE INPUT
  // -------------------------------------------------------------
  return (
    <form onSubmit={handleInitiate} className="space-y-6">
      {/* Honeypot field */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Visit Date */}
      <div>
        <label htmlFor="attendance_date" className="mb-1.5 block text-sm font-medium text-slate-700">
          Visit Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="attendance_date"
          id="attendance_date"
          required
          value={attendanceDate}
          max={todayStr}
          onChange={(e) => setAttendanceDate(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Visit Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Visit Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVisitType("clinic")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
              visitType === "clinic"
                ? "border-brand-600 bg-brand-50/70 text-brand-700 shadow-sm ring-1 ring-brand-600"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <IconBuildingHospital className={`h-4 w-4 ${visitType === "clinic" ? "text-brand-600" : "text-slate-400"}`} />
            Clinic Visit
          </button>
          <button
            type="button"
            onClick={() => setVisitType("home")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
              visitType === "home"
                ? "border-brand-600 bg-brand-50/70 text-brand-700 shadow-sm ring-1 ring-brand-600"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <IconHome className={`h-4 w-4 ${visitType === "home" ? "text-brand-600" : "text-slate-400"}`} />
            Home Visit
          </button>
        </div>
      </div>

      {/* Checkbox: "I don't have a registered number" */}
      <div className="flex items-center gap-2 pt-1 pb-1">
        <input
          type="checkbox"
          id="hasNoNumber"
          checked={hasNoNumber}
          onChange={(e) => {
            setHasNoNumber(e.target.checked);
            setError("");
          }}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
        />
        <label htmlFor="hasNoNumber" className="text-sm font-medium text-slate-700 cursor-pointer">
          I don&apos;t have a registered number
        </label>
      </div>

      {hasNoNumber ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required={hasNoNumber}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="external_phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Contact Number <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              id="external_phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Registered Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required={!hasNoNumber}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Enter the 10-digit mobile number linked to your clinic account.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-600 px-6 py-4 text-center font-semibold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-70"
      >
        {loading ? "Processing..." : hasNoNumber ? "Submit Attendance" : "Continue"}
      </button>
    </form>
  );
}
