import { AnyFunnelState, RouteOption } from './core.js';

export interface FunnelRouterOption<TState extends AnyFunnelState> {
  id: string;
  initialState: TState;
  steps?: {
    [TStepName: string]: unknown;
  };
}

export interface FunnelRouterTransitionOption {
  renderComponent?: {
    overlay: boolean;
  };
}

export interface FunnelRouterResult<TRouteOption extends RouteOption> {
  history: AnyFunnelState[];
  currentIndex: number;
  push: (state: AnyFunnelState, option?: FunnelRouterTransitionOption & TRouteOption) => void | Promise<void>;
  replace: (state: AnyFunnelState, option?: FunnelRouterTransitionOption & TRouteOption) => void | Promise<void>;
  go: (index: number) => void | Promise<void>;
  cleanup: () => void;
}

export interface FunnelRouter<TRouteOption extends RouteOption, TFunnelOption extends RouteOption = RouteOption> {
  (option: FunnelRouterOption<AnyFunnelState> & TFunnelOption): FunnelRouterResult<TRouteOption>;
}
