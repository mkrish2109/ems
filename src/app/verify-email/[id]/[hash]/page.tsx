"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// const BASE_URL = "https://ems.digitsoftsol.co/api";

export default function VerifyEmail() {
  const router = useRouter();
  const { id, hash } = useParams();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if id and hash are present and log them for debugging
        if (!id || !hash) {
          setStatus("error");
          setMessage("Invalid verification link.");
          toast.error("Invalid verification link.");
          return;
        }

        const query = searchParams.toString(); // Capture expires and signature
        const url = `${process.env.NEXT_PUBLIC_API_URL}/email/verify/${id}/${hash}?${query}`;

        console.log("Request URL: ", url); // Log the request URL for debugging

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to verify: ${res.status}`);
        }

        const data = await res.json();

        // Check response data
        if (data.message === "Email verification completed") {
          toast.success("Email verified successfully!");
          setStatus("success");
          setMessage("Email verified successfully!");
        } else if (data.message === "Email already verified") {
          setStatus("already");
          setMessage("Email already verified");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
          toast.error(data.message || "Verification failed.");
        }
      } catch (err) {
        console.error("Verification error:", err); // Log the error for debugging
        setStatus("error");
        setMessage("Something went wrong.");
        toast.error("Something went wrong.");
      }
    };

    if (id && hash) verifyEmail();
  }, [id, hash, searchParams]); // Trigger only when id, hash, or searchParams change

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Toaster position="top-right" />

      {status === "loading" && <h1>Verifying...</h1>}

      {(status === "success" || status === "already" || status === "error") && (
        <div>
          <h1>{message}</h1>
          <button
            onClick={() => router.push("/login")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
  