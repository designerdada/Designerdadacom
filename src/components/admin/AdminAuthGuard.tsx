import { useState, useEffect, ReactNode } from "react";
import { WORKER_API_URL } from "../../data/cloudflare-config";

interface AdminAuthGuardProps {
	children: ReactNode;
}

const AUTH_TOKEN_KEY = "admin_auth_token";

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Check for existing token on mount
	useEffect(() => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (token) {
			setIsAuthenticated(true);
		}
		setIsLoading(false);
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch(`${WORKER_API_URL}/api/auth`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			if (!response.ok) {
				throw new Error("Invalid password");
			}

			const data = await response.json();
			localStorage.setItem(AUTH_TOKEN_KEY, data.token);
			setIsAuthenticated(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		setIsAuthenticated(false);
		setPassword("");
	};

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-olive-50 dark:bg-olive-950'>
				<p className='text-olive-500 dark:text-olive-400'>Loading...</p>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-olive-50 dark:bg-olive-950 px-4'>
				<div className='w-full max-w-sm'>
					<h1 className='mb-6 text-center text-lg font-medium text-olive-800 dark:text-olive-100'>
						Admin Login
					</h1>
					<form onSubmit={handleLogin} className='flex flex-col gap-4'>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='Enter password'
							className='w-full rounded-lg border border-olive-500 dark:border-olive-400/30 bg-transparent px-4 py-2 text-olive-800 dark:text-olive-100 placeholder:text-olive-500 dark:text-olive-400 focus:border-olive-950 dark:focus:border-olive-100 focus:outline-none'
							autoFocus
						/>
						{error && <p className='text-xs text-red-500'>{error}</p>}
						<button
							type='submit'
							disabled={isLoading || !password}
							className='rounded-lg bg-olive-950 dark:bg-olive-100 px-4 py-2 text-olive-50 dark:text-olive-800 transition-opacity hover:opacity-80 disabled:opacity-50'>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-olive-50 dark:bg-olive-950'>
			{/* Logout button */}
			<div className='fixed right-4 top-4 z-50'>
				<button
					type='button'
					onClick={handleLogout}
					className='rounded-lg border border-olive-500 dark:border-olive-400/30 px-3 py-1.5 text-xs text-olive-500 dark:text-olive-400 transition-colors hover:border-olive-950 dark:hover:border-olive-100 hover:text-olive-800 dark:text-olive-100'>
					Logout
				</button>
			</div>
			{children}
		</div>
	);
}

// Export helper to get auth token for API calls
export function getAuthToken(): string | null {
	return localStorage.getItem(AUTH_TOKEN_KEY);
}
