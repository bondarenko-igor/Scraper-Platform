import { useOutletContext } from 'react-router-dom'

export interface LayoutContext {
  globalSearch: string
}

export function useLayoutContext() {
  return useOutletContext<LayoutContext>()
}
