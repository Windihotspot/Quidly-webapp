export interface DashboardMetrics {
  transactionValue: {
    amount: number
    change: number
    period: string
  }
  totalTransactions: number
  successRate: number
  valueProcessed: {
    amount: number
    change: number
  }
}

export interface ChartData {
  transactionActivityData: {
    dates: string[]
    values: number[]
  }
  quarterSummaryData: {
    transactionValue: number
    transactionCount: number
    change: number
  }
}

export interface RecentTransaction {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  reference: string
}

export const dashboardMetrics: DashboardMetrics = {
  transactionValue: {
    amount: 0,
    change: 0,
    period: 'This month',
  },
  totalTransactions: 0,
  successRate: 0,
  valueProcessed: {
    amount: 0,
    change: 0,
  },
}

export const chartData: ChartData = {
  transactionActivityData: {
    dates: ['01', '06', '12', '18', '24', '30'],
    values: [0, 0, 0, 0, 0, 0],
  },
  quarterSummaryData: {
    transactionValue: 0,
    transactionCount: 0,
    change: 0,
  },
}

export const recentTransactions: RecentTransaction[] = []