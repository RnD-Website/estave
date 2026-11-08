import { Component } from 'react'

// Keeps the rest of the scene alive if an asset (e.g. a photo) fails to load.
export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error) {
    console.warn('[ESTAVÉ] asset failed to load:', error?.message || error)
  }
  render() {
    return this.state.error ? this.props.fallback ?? null : this.props.children
  }
}
