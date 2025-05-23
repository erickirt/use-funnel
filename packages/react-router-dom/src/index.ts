import { createUseFunnel } from '@use-funnel/core';
import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export * from '@use-funnel/core';

interface ReactRouterDomRouteOption {
  preventScrollReset?: boolean;
  unstable_flushSync?: boolean;
  unstable_viewTransition?: boolean;
}

export const useFunnel = createUseFunnel<ReactRouterDomRouteOption>(({ id, initialState }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const stepName = `${id}.step`;
  const contextName = `${id}.context`;
  const historiesName = `${id}.histories`;

  const currentStep = searchParams.get(stepName);
  const currentContext = location.state?.[contextName];
  const currentState = useMemo(() => {
    return currentStep != null && currentContext != null
      ? ({
          step: currentStep,
          context: currentContext,
        } as typeof initialState)
      : initialState;
  }, [currentStep, currentContext, initialState]);

  const history: (typeof initialState)[] = useMemo(() => {
    const histories = location.state?.[historiesName];
    if (Array.isArray(histories) && histories.length > 0) {
      return histories;
    } else {
      return [currentState];
    }
  }, [location.state, currentState]);

  const currentIndex = history.length - 1;

  return useMemo(
    () => ({
      history,
      currentIndex,
      push(state, { preventScrollReset, unstable_flushSync, unstable_viewTransition } = {}) {
        setSearchParams(
          (prev) => {
            prev.set(stepName, state.step);
            return prev;
          },
          {
            replace: false,
            state: {
              ...location.state,
              [contextName]: state.context,
              [historiesName]: [...(history ?? []), state],
            },
            preventScrollReset,
            unstable_flushSync,
            unstable_viewTransition,
          },
        );
      },
      replace(state, { preventScrollReset, unstable_flushSync, unstable_viewTransition } = {}) {
        setSearchParams(
          (prev) => {
            prev.set(stepName, state.step);
            return prev;
          },
          {
            replace: true,
            state: {
              ...location.state,
              [contextName]: state.context,
              [historiesName]: [...(history ?? []).slice(0, currentIndex), state],
            },
            preventScrollReset,
            unstable_flushSync,
            unstable_viewTransition,
          },
        );
      },
      go(index) {
        navigate(index);
      },
      cleanup() {
        const newLocationState = { ...location.state };
        const currentSearchParams = new URLSearchParams(window.location.search);

        if (
          !currentSearchParams.has(stepName) ||
          !(contextName in newLocationState) ||
          !(historiesName in newLocationState)
        ) {
          return;
        }

        delete newLocationState[contextName];
        delete newLocationState[historiesName];
        setSearchParams(
          (prev) => {
            prev.delete(stepName);
            return prev;
          },
          {
            replace: true,
            state: newLocationState,
          },
        );
      },
    }),
    [id, stepName, currentState, history, currentIndex, setSearchParams, navigate, location.state],
  );
});
