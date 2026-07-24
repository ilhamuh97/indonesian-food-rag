import React from 'react';

function CustomSection({ children }) {
  return (
    <section className={'flex min-h-0 flex-1 flex-col overflow-y-auto p-6 md:p-10'}>
      {children}
    </section>
  );
}

export default CustomSection;
