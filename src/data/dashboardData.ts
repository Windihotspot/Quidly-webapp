/* --------------------------------------------------------------------------
| Types
-------------------------------------------------------------------------- */

export interface PeriodSummary {
  transactions: number
  amount: number
  change: number
}

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

  weekly: PeriodSummary

  monthly: PeriodSummary

  quarterly: PeriodSummary
}


export interface TransactionActivityData {
  dates: string[]
  values: number[]
}


export interface QuarterSummaryData {
  transactionValue: number
  transactionCount: number
  change: number
}


export interface ChartData {
  transactionActivityData: TransactionActivityData

  quarterSummaryData: QuarterSummaryData
}


export interface RecentTransaction {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  reference: string
}


/* --------------------------------------------------------------------------
| API Response Types
| These make it easier to work with your backend responses.
-------------------------------------------------------------------------- */

export interface WeeklyTransactionResponse {
  this_week_transactions: number
  this_week_total_amount: number

  last_week_transaction: number
  last_week_total_amount: number

  pct_change_transactions: number
  pct_change_amount: number
}


export interface QuarterlyTransactionResponse {
  this_quarter_transactions: number
  this_quarter_total_amount: number

  last_quarter_transaction: number
  last_quarter_total_amount: number

  pct_change_transactions: number
  pct_change_amount: number
}


export interface MonthlyTransactionResponse {
  month_str: string
  transaction_value: number
  transaction_count: number
}


export interface LatestTransactionResponse {
  id?: string
  transaction_id?: string

  date?: string
  transaction_date?: string
  created_at?: string

  amount?: number
  transaction_value?: number

  status?: string

  reference?: string
  transaction_reference?: string
}


/* --------------------------------------------------------------------------
| API State
-------------------------------------------------------------------------- */

export interface DashboardState {
  loading: boolean
  error: string | null
}


/* --------------------------------------------------------------------------
| Default Dashboard Metrics
-------------------------------------------------------------------------- */

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

  weekly: {
    transactions: 0,
    amount: 0,
    change: 0,
  },

  monthly: {
    transactions: 0,
    amount: 0,
    change: 0,
  },

  quarterly: {
    transactions: 0,
    amount: 0,
    change: 0,
  },
}


/* --------------------------------------------------------------------------
| Default Chart Data
-------------------------------------------------------------------------- */

export const chartData: ChartData = {
  transactionActivityData: {
    dates: [],
    values: [],
  },

  quarterSummaryData: {
    transactionValue: 0,
    transactionCount: 0,
    change: 0,
  },
}


/* --------------------------------------------------------------------------
| Recent Transactions
-------------------------------------------------------------------------- */

export const recentTransactions: RecentTransaction[] = []


/* --------------------------------------------------------------------------
| Dashboard API State
-------------------------------------------------------------------------- */

export const dashboardState: DashboardState = {
  loading: false,
  error: null,
}
