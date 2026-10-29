import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SorbiChat from './SorbiChat.jsx';
import { contextualSuggestions } from '../../sorbi/knowledge.js';

const HINT_KEY = 'smoothiefitSorbiHintSeen';

function SorbiWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const checkedHintRef = useRef(false);
  const contextSuggestion = contextualSuggestions[location.pathname];
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (open) panelRef.current?.querySelector('textarea')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (isAdmin || location.pathname === '/asistente') return;
    if (checkedHintRef.current) return;
    checkedHintRef.current = true;
    try {
      if (sessionStorage.getItem(HINT_KEY)) return;
      sessionStorage.setItem(HINT_KEY, 'true');
    } catch {
      setShowHint(true);
      return;
    }
    setShowHint(true);
  }, [isAdmin, location.pathname]);

  useEffect(() => {
    if (!showHint) return undefined;
    const timer = window.setTimeout(() => setShowHint(false), 7000);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  if (isAdmin || location.pathname === '/asistente') return null;

  function containPanelFocus(event) {
    if (event.key !== 'Tab') return;
    const elements = [...panelRef.current.querySelectorAll(
      'button:not(:disabled), a[href], textarea:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )];
    if (!elements.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="sorbi-widget">
      {showHint && !open && (
        <button
          className="sorbi-discovery-hint"
          type="button"
          onClick={() => {
            setShowHint(false);
            setOpen(true);
          }}
        >
          {contextSuggestion?.label || '¿Te ayudo a elegir?'}
        </button>
      )}
      {open && (
        <div
          className="sorbi-widget-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Chat con Sorbi"
          onKeyDown={containPanelFocus}
        >
          <SorbiChat
            onMinimize={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            contextSuggestion={contextSuggestion}
            showMinimize
            initialFocus
          />
        </div>
      )}
      <button
        className={`sorbi-widget-trigger${open ? ' is-open' : ''}`}
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-label={open ? 'Minimizar conversación con Sorbi' : 'Abrir conversación con Sorbi'}
        onClick={() => {
          setShowHint(false);
          setOpen((current) => !current);
        }}
      >
        {open ? '×' : <><span className="sorbi-widget-face" aria-hidden="true">☺</span><span>Sorbi</span></>}
      </button>
    </div>
  );
}

export default SorbiWidget;
