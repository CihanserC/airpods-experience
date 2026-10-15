import { Component, type ErrorInfo, type ReactNode } from 'react'

type BoundaryProps = {
  fallback: ReactNode
  children: ReactNode
}

type BoundaryState = {
  failed: boolean
}

export class ModelBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('GLB yüklenemedi, placeholder kullanılıyor.', error, info.componentStack)
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}
