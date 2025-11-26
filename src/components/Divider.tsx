export function Divider() {
  return (
    <div className="flex gap-2 items-center justify-center py-4 w-full">
      <div className="relative shrink-0 size-2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#E9573F" r="4" />
        </svg>
      </div>
      <div className="relative shrink-0 size-2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#F0BF2E" r="4" />
        </svg>
      </div>
      <div className="relative shrink-0 size-2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="#4E964E" r="4" />
        </svg>
      </div>
    </div>
  );
}