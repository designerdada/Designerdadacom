"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { cleanError } from "@/components/admin/editor/PublishControls";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
	const { signIn } = useAuthActions();
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus("sending");
		setError("");
		try {
			await signIn("magic-link", { email: email.trim().toLowerCase(), redirectTo: "/admin" });
			setStatus("sent");
		} catch (err) {
			setError(cleanError(err));
			setStatus("error");
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center px-4'>
			<div className='flex w-full max-w-xs flex-col items-center gap-6 text-center'>
				<img src='/assets/profile.png' alt='' className='size-12 rounded-full' />
				<div className='flex flex-col gap-1'>
					<h1 className='text-lg font-medium'>Writing desk</h1>
					<p className='text-sm text-olive-500'>
						{status === "sent"
							? "Check your inbox for a sign-in link. It expires in an hour."
							: "Only the site author can sign in."}
					</p>
				</div>
				{status !== "sent" ? (
					<form onSubmit={handleSubmit} className='flex w-full flex-col gap-3'>
						<input
							type='email'
							required
							autoFocus
							autoComplete='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='you@example.com'
							aria-label='Email address'
							className='w-full rounded-lg border border-olive-200 bg-white px-3 py-2 text-sm outline-none focus:border-olive-400 dark:border-olive-700 dark:bg-olive-950'
						/>
						<button
							type='submit'
							disabled={status === "sending"}
							className='w-full rounded-lg bg-olive-900 px-4 py-2 text-sm font-medium text-olive-50 transition-opacity hover:opacity-85 disabled:opacity-50 dark:bg-olive-100 dark:text-olive-900'>
							{status === "sending" ? "Sending…" : "Email me a sign-in link"}
						</button>
						{error && <p className='text-xs text-red-500'>{error}</p>}
					</form>
				) : (
					<button
						type='button'
						onClick={() => setStatus("idle")}
						className='text-xs text-olive-500 underline underline-offset-4'>
						Use a different email
					</button>
				)}
			</div>
		</div>
	);
}
