import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../lib/api';
import { MailIcon, ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const { mutate: forgotPasswordMutation, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      setIsSubmitted(true);
      setResetToken(data.resetToken);
      toast.success('Password reset token generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate reset token');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    forgotPasswordMutation(email);
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-base-content">Check Your Email</h2>
          <p className="text-base-content/70 mt-2">
            We've sent a password reset token to your email address.
          </p>
        </div>

        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Your Reset Token:</h3>
          <div className="bg-base-100 p-3 rounded border font-mono text-sm break-all">
            {resetToken}
          </div>
          <p className="text-xs text-base-content/60 mt-2">
            ⚠️ This token expires in 10 minutes. Copy it and use it to reset your password.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            to="/reset-password" 
            className="btn btn-primary w-full"
          >
            Reset Password Now
          </Link>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="btn btn-outline w-full"
          >
            Try Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <MailIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-base-content">Forgot Password?</h2>
        <p className="text-base-content/70 mt-2">
          Enter your email address and we'll send you a password reset token.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email Address</span>
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-full" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Sending...
            </>
          ) : (
            'Send Reset Token'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={onBack}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
