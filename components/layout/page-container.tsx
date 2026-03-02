import type { ReactNode } from "react";

type PageContainerProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageContainer({ title, description, actions, children }: PageContainerProps) {
  return (
    <section className="space-y-4 px-4 py-5 md:px-6 md:py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground md:text-base">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>

      {children}
    </section>
  );
}
