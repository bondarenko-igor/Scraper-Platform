import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './ui/error-state'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.fallbackTitle ?? 'Page error'}
          message={this.state.message}
          onRetry={() => this.setState({ hasError: false, message: undefined })}
        />
      )
    }
    return this.props.children
  }
}
