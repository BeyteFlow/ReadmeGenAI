"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Github, LogIn, LogOut } from "lucide-react";

type GitHubLoginButtonProps = {
  onBeforeSignIn?: () => void;
  showScopeNote?: boolean;
  compact?: boolean;
};

export default function GitHubLoginButton({
  onBeforeSignIn,
  showScopeNote = false,
  compact = false,
}: GitHubLoginButtonProps) {
  const { data: session, status } = useSession();
  const displayName =
    session?.user?.name || session?.user?.email || "GitHub user";

  if (status === "loading") return null;

  if (session) {
    return (
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        <div className="hidden min-h-10 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200 sm:inline-flex">
          <Github size={14} className="shrink-0" />
          <span className="max-w-[150px] truncate">{displayName}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium leading-none text-white transition-all hover:border-white/25 hover:bg-white/10 sm:px-4 sm:py-2"
        >
          <LogOut size={14} className="shrink-0" />
          <span>{compact ? "Out" : "Sign out"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col items-end gap-2 sm:items-center">
      <button
        onClick={() => {
          onBeforeSignIn?.();
          signIn("github");
        }}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold leading-none text-white transition-colors hover:border-white/15 hover:bg-white/[0.07] sm:px-4 sm:py-2"
      >
        <Github size={15} className="shrink-0" />
        {!compact && <LogIn size={14} className="shrink-0" />}
        <span>{compact ? "Login" : "Login with GitHub"}</span>
      </button>
      {showScopeNote && (
        <p className="max-w-[220px] text-right text-xs leading-snug text-neutral-400 sm:max-w-xs sm:text-left">
          We request GitHub’s “repo” scope to read private repo contents for
          README generation.
        </p>
      )}
    </div>
  );
}
