"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup";
type AuthLinkHref = "/login" | "/signup";

const labels: Record<AuthMode, { title: string; submit: string; switchText: string; switchHref: AuthLinkHref; switchLabel: string }> = {
  login: {
    title: "Entrar no GenTask",
    submit: "Entrar",
    switchText: "Ainda não tem conta?",
    switchHref: "/signup",
    switchLabel: "Criar conta"
  },
  signup: {
    title: "Criar conta",
    submit: "Cadastrar",
    switchText: "Já possui conta?",
    switchHref: "/login",
    switchLabel: "Entrar"
  }
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthInput>({
    resolver: zodResolver(authSchema)
  });

  const copy = labels[mode];

  const onSubmit = async (values: AuthInput) => {
    setError(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { error: signupError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`
        }
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword(values);

      if (loginError) {
        setError(loginError.message);
        return;
      }
    }

    router.push("/app");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md border-primary/20">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : copy.submit}
          </Button>

          <p className="text-sm text-muted-foreground">
            {copy.switchText} {" "}
            <Link href={copy.switchHref} className="font-semibold text-primary hover:underline">
              {copy.switchLabel}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
