import Link from "next/link";
import { Thermometer, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Thermometer className="h-7 w-7 text-blue-600" />
          <span className="font-bold text-slate-900 text-xl">FridgeProof</span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h1>
        <p className="text-slate-500 mb-2">
          We sent a confirmation link to your email address.
        </p>
        <p className="text-slate-500 mb-8">
          Click the link to confirm your account, then come back here to sign in.
        </p>

        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go to sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to sign up
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Didn&apos;t receive an email? Check your spam folder or try signing up again.
        </p>
      </div>
    </div>
  );
}
