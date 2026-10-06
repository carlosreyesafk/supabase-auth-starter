import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/AuthForm";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in → skip the login form.
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Supabase Auth Starter
        </h1>
        <p className="mt-2 max-w-md text-slate-600">
          Email/password auth, Google OAuth, protected routes, and
          RLS-secured profiles — wired with{" "}
          <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">
            @supabase/ssr
          </code>
          .
        </p>
      </div>
      <AuthForm />
    </main>
  );
}
