import { useState } from "react";
import mailcheck from "mailcheck";

type Status = "idle" | "loading" | "success" | "error";

export function MailingList() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [suggestion, setSuggestion] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim() || !emailRegex.test(email)) {
			setErrorMsg("Hmm, that doesn't look like a valid email.");
			setStatus("error");
			return;
		}

		// Check for typos — only block if there's a new suggestion we haven't shown yet
		if (suggestion !== email) {
			const result = mailcheck.run({ email });
			if (result) {
				setSuggestion(result.full);
				return;
			}
		}

		setSuggestion("");
		setStatus("loading");

		try {
			const res = await fetch("/api/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				setErrorMsg(data.error || "Hmm, something went wrong. Try again?");
				setStatus("error");
			} else {
				setStatus("success");
				setEmail("");
			}
		} catch {
			setErrorMsg("Hmm, something went wrong. Try again?");
			setStatus("error");
		}
	};

	if (status === "success") {
		return (
			<div className='flex flex-col gap-2 items-start relative shrink-0 w-full'>
				<div className='flex gap-1 h-5 items-center w-full'>
					<label className='font-medium relative shrink-0 text-olive-500 text-sm text-justify text-nowrap whitespace-pre'>
						Get these in your inbox
					</label>
				</div>
				<p className='text-sm text-lime-600 dark:text-lime-400 pb-3 pt-2'>
					Check your inbox to confirm your subscription.
				</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-2 items-start relative shrink-0 w-full'>
			<div className='flex gap-1 h-5 items-center w-full'>
				<label
					htmlFor='email-subscribe'
					className='font-regular relative shrink-0 text-sm text-justify text-nowrap whitespace-pre'>
					Subscribe to my not so regular newsletter :)
				</label>
			</div>
			<form onSubmit={handleSubmit} className='w-full' aria-label='Subscribe to newsletter' noValidate>
				<div className='flex items-center justify-between relative shrink-0 w-full pr-1'>
					<div
						aria-hidden='true'
						className='absolute border-1 rounded-[12px] border-olive-300 dark:border-olive-600 border-solid inset-0 pointer-events-none'
					/>
					<input
						id='email-subscribe'
						type='email'
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							if (!e.target.value) {
								setErrorMsg("");
								setSuggestion("");
								setStatus("idle");
							}
						}}
						placeholder='you@youremail.com'
						className='relative text-sm pl-4 py-2 bg-transparent border-none outline-none text-olive-800 dark:text-olive-100 placeholder:text-olive-400 flex-1 disabled:opacity-50'
						aria-required='true'
						aria-label='Email address'
						disabled={status === "loading"}
					/>
					<button
						type='submit'
						className='font-medium font-mono px-4 py-1 relative shrink-0 text-olive-800 dark:text-olive-100 text-sm text-justify text-nowrap uppercase whitespace-pre opacity-70 hover:opacity-100 transition-opacity cursor-pointer bg-olive-300 dark:bg-olive-600 border-none disabled:opacity-40 disabled:cursor-not-allowed rounded-lg'
						aria-label='Subscribe to newsletter'
						disabled={status === "loading"}>
						{status === "loading" ? "Sending…" : "Subscribe"}
					</button>
				</div>
				{suggestion && (
					<p className='text-xs text-olive-500 mt-1'>
						Did you mean{" "}
						<button
							type='button'
							className='underline cursor-pointer bg-transparent border-none p-0 text-xs text-olive-700 dark:text-olive-300'
							onClick={() => {
								setEmail(suggestion);
								setSuggestion("");
							}}>
							{suggestion}
						</button>
						?
					</p>
				)}
				{status === "error" && <p className='text-xs text-red-500 mt-1'>{errorMsg}</p>}
			</form>
		</div>
	);
}
