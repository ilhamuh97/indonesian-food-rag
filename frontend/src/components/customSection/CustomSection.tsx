import type { ReactNode } from 'react';

type CustomSectionProps = {
  children: ReactNode;
};

function CustomSection({ children }: CustomSectionProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 md:p-10">
      {children}
    </section>
  );
}

export default CustomSection;
