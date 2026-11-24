"use client";

import { startTransition, useActionState } from "react";

/**
 * Como useActionState, mas envia pelo onSubmit para o React não limpar os campos após a ação.
 * Assim, um erro de validação não apaga o que a pessoa já preencheu.
 */
type S = { error?: string; ok?: string } | undefined;

export function useFormAction(action: (state: S, formData: FormData) => Promise<S>, initial: S) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending] as const;
}
