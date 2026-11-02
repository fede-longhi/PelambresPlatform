'use client';

import { useEffect } from 'react';

/**
 * Prevents the document (html/body) from scrolling while the admin shell
 * owns a single overflow-y pane. Avoids the nested "double scrollbar" UX.
 */
export default function AdminScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlHeight: html.style.height,
      bodyHeight: body.style.height,
    };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.height = '100%';

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.height = previous.htmlHeight;
      body.style.height = previous.bodyHeight;
    };
  }, []);

  return null;
}
