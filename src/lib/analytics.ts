/**
 * Analytics and Monitoring Utilities
 * 
 * This module provides utilities for tracking events and metrics.
 * Integrate with services like Google Analytics, Mixpanel, or PostHog.
 */

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface MetricData {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
}

class Analytics {
  private enabled: boolean
  private events: AnalyticsEvent[] = []

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production'
  }

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled) {
      console.log('[Analytics]', event.name, event.properties)
      return
    }

    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date(),
    })

    // TODO: Send to analytics service
    // Example: Google Analytics, Mixpanel, PostHog, etc.
  }

  /**
   * Track a page view
   */
  pageView(path: string, properties?: Record<string, any>): void {
    this.track({
      name: 'page_view',
      properties: {
        path,
        ...properties,
      },
    })
  }

  /**
   * Track a business metric
   */
  metric(data: MetricData): void {
    if (!this.enabled) {
      console.log('[Metric]', data.name, data.value, data.unit)
      return
    }

    // TODO: Send to monitoring service
    // Example: Datadog, New Relic, CloudWatch, etc.
  }

  /**
   * Track an error
   */
  error(error: Error, context?: Record<string, any>): void {
    console.error('[Error]', error.message, context)

    this.track({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    })

    // TODO: Send to error tracking service
    // Example: Sentry, Rollbar, Bugsnag, etc.
  }

  /**
   * Get recent events (for debugging)
   */
  getRecentEvents(limit: number = 10): AnalyticsEvent[] {
    return this.events.slice(-limit)
  }
}

// Singleton instance
export const analytics = new Analytics()

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track({ name, properties })
}

export const trackPageView = (path: string, properties?: Record<string, any>) => {
  analytics.pageView(path, properties)
}

export const trackMetric = (name: string, value: number, unit?: string, tags?: Record<string, string>) => {
  analytics.metric({ name, value, unit, tags })
}

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.error(error, context)
}

// Business event helpers
export const trackMerchantRegistration = (merchantId: string, category: string) => {
  trackEvent('merchant_registered', { merchantId, category })
  trackMetric('merchants_total', 1, 'count', { category })
}

export const trackCustomerRegistration = (customerId: string) => {
  trackEvent('customer_registered', { customerId })
  trackMetric('customers_total', 1, 'count')
}

export const trackTransaction = (type: 'earn' | 'redeem', amount: number, points: number) => {
  trackEvent(`transaction_${type}`, { amount, points })
  trackMetric(`transaction_${type}_amount`, amount, 'rupees')
  trackMetric(`transaction_${type}_points`, points, 'points')
}

export const trackWalletUpdate = (merchantId: string, amount: number, type: 'ADD' | 'DEDUCT') => {
  trackEvent('wallet_update', { merchantId, amount, type })
  trackMetric('wallet_update_amount', amount, 'rupees', { type: type.toLowerCase() })
}
