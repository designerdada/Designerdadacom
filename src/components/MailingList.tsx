import { useState } from 'react';

export function MailingList() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
  };

  return (
    <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-1 h-[22px] items-center relative shrink-0 w-full">
        <label htmlFor="email-subscribe" className="font-medium leading-[1.5] not-italic relative shrink-0 text-gray-500 text-base text-justify text-nowrap whitespace-pre">
          Get these in your inbox
        </label>
      </div>
      <form onSubmit={handleSubmit} className="w-full" aria-label="Subscribe to newsletter">
        <div className="box-border content-stretch flex items-center justify-between pb-3 pt-2 px-0 relative shrink-0 w-full">
          <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[var(--border)] border-solid inset-0 pointer-events-none" />
          <input
            id="email-subscribe"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@youremail.com"
            className="leading-[1.5] not-italic relative text-base bg-transparent border-none outline-none text-[var(--foreground)] placeholder:text-gray-400 flex-1"
            required
            aria-required="true"
            aria-label="Email address"
          />
          <button 
            type="submit"
            className="font-medium leading-[1.5] not-italic relative shrink-0 text-[var(--foreground)] text-base text-justify text-nowrap uppercase whitespace-pre hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
            aria-label="Subscribe to newsletter"
          >
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
}