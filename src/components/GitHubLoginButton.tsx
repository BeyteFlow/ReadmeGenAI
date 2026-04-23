"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Github, LogIn, LogOut } from "lucide-react";

type GitHubLoginButtonProps = {
  onBeforeSignIn?: () => void;
};

export default function GitHubLoginButton({
  onBeforeSignIn,
}: GitHubLoginButtonProps) {
  const { data: session, status } = useSession();
  const displayName =
    session?.user?.name || session?.user?.email || "GitHub user";

  if (status === "loading") return null;

  if (session) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-200">
          <Github size={14} />
          <span className="max-w-[150px] truncate">{displayName}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-white/25 hover:bg-white/10"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          onBeforeSignIn?.();
          signIn("github");
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/15 hover:bg-white/[0.07]"
      >
        <Github size={15} />
        <LogIn size={14} />
        Login with GitHub
      </button>
      <p className="text-xs text-neutral-400">
        We request GitHub’s “repo” scope to read private repo contents for
        README generation.
      </p>
    </div>
  );
}
