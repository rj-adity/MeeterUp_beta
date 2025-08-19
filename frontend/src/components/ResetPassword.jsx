import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../lib/api';
import { LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { mutate: resetPasswordMutation, isPending } = useMutation({
    mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
    onSuccess: () => {
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.token.trim()) {
      toast.error('Please enter the reset token');
      return;
    }
    
    if (!formData.newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    resetPasswordMutation({
      token: formData.token,
      newPassword: formData.newPassword
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-base-content">Password Reset Successfully!</h2>
          <p className="text-base-content/70 mt-2">
            Your password has been updated. You can now log in with your new password.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            to="/login" 
            className="btn btn-primary w-full"
          >
            Go to Login
          </Link>
          <button 
            onClick={() => setIsSuccess(false)}
            className="btn btn-outline w-full"
          >
            Reset Another Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <LockIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-base-content">Reset Your Password</h2>
        <p className="text-base-content/70 mt-2">
          Enter the reset token and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Reset Token</span>
          </label>
          <input
            type="text"
            name="token"
            placeholder="Enter the reset token from your email"
            className="input input-bordered w-full font-mono"
            value={formData.token}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">New Password</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
              className="input input-bordered w-full pr-10"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-base-content/50" />
              ) : (
                <EyeIcon className="h-4 w-4 text-base-content/50" />
              )}
            </button>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Confirm New Password</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              className="input input-bordered w-full pr-10"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-4 w-4 text-base-content/50" />
              ) : (
                <EyeIcon className="h-4 w-4 text-base-content/50" />
              )}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-full" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          to="/login" 
          className="btn btn-ghost btn-sm"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
