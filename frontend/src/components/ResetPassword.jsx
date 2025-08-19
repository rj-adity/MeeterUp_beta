import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../lib/api';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

const ResetPassword = () => {
	const [token, setToken] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const { mutate: resetMutation, isPending } = useMutation({
		mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
		onSuccess: () => {
			toast.success('Password reset successfully. You can now log in.');
		},
		onError: (error) => {
			toast.error(error?.response?.data?.message || 'Failed to reset password');
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!token.trim() || !newPassword.trim()) {
			toast.error('Please enter token and a new password');
			return;
		}
		resetMutation({ token, newPassword });
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="text-center mb-6">
				<ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
				<h2 className="text-2xl font-bold text-base-content">Reset Password</h2>
				<p className="text-base-content/70 mt-2">
					Paste the reset token you received and choose a new password.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="form-control">
					<label className="label">
						<span className="label-text">Reset Token</span>
					</label>
					<input
						type="text"
						placeholder="Paste your token"
						className="input input-bordered w-full"
						value={token}
						onChange={(e) => setToken(e.target.value)}
						required
					/>
				</div>

				<div className="form-control">
					<label className="label">
						<span className="label-text">New Password</span>
					</label>
					<div className="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder="********"
							className="input input-bordered w-full pr-10"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
							minLength={6}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((s) => !s)}
							className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
						</button>
					</div>
					<p className="text-xs opacity-70 mt-1">Password must be at least 6 characters long</p>
				</div>

				<button type="submit" className="btn btn-primary w-full" disabled={isPending}>
					{isPending ? (
						<>
							<span className="loading loading-spinner loading-sm" />
							Resetting...
						</>
					) : (
						'Reset Password'
					)}
				</button>
			</form>

			<div className="mt-6 text-center">
				<Link to="/login" className="btn btn-ghost btn-sm">
					Back to Login
				</Link>
			</div>
		</div>
	);
};

export default ResetPassword;


