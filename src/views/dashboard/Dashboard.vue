<template>
  <main-layout>
    <div class="dashboard">
      <div class="dashboard-container">
        <!-- Header -->
        <div class="dashboard-header">
          <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">A clear view of your payment activity and merchant performance.</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <!-- Transaction Value Card -->
          <div class="stat-card stat-card-primary">
            <div class="stat-card-header">
              <span class="stat-label">TRANSACTIONS VALUE</span>
              <span class="stat-badge">{{ metrics.transactionValue.period }}</span>
            </div>
            <div class="stat-amount">{{ formatCurrency(metrics.transactionValue.amount) }}</div>
            <div class="stat-change" :class="{ positive: metrics.transactionValue.change >= 0 }">
              {{ metrics.transactionValue.change }}% this month
            </div>
            <button class="stat-action">View transactions →</button>
          </div>

          <!-- Total Transactions Card -->
          <div class="stat-card">
            <span class="stat-label">TOTAL TRANSACTIONS</span>
            <div class="stat-amount">{{ metrics.totalTransactions }}</div>
            <p class="stat-subtitle">No transactions yet</p>
          </div>

          <!-- Success Rate Card -->
          <div class="stat-card">
            <span class="stat-label">SUCCESS RATE</span>
            <div class="stat-amount">{{ formatPercent(metrics.successRate) }}</div>
            <p class="stat-subtitle">Awaiting payment activity</p>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Transaction Activity Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h2 class="chart-title">Transaction activity</h2>
                <p class="chart-subtitle">Value processed over the selected period</p>
              </div>
              <div class="chart-controls">
                <select class="period-select" v-model="selectedPeriod">
                  <option value="30days">Last 30 days</option>
                  <option value="60days">Last 60 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>
            </div>

            <div class="chart-section">
              <div class="value-processed">
                <div>
                  <p class="vp-label">VALUE PROCESSED</p>
                  <p class="vp-amount">
                    {{
                      formatCurrency(
                        chartData.transactionActivityData.values[
                          chartData.transactionActivityData.values.length - 1
                        ]
                      )
                    }}
                  </p>
                  <p
                    class="vp-change"
                    :class="{ positive: chartData.quarterSummaryData.change >= 0 }"
                  >
                    ↑ {{ chartData.quarterSummaryData.change }}% vs previous period
                  </p>
                </div>
              </div>

              <div v-if="lineChartReady" class="chart-container">
                <apexchart
                  type="line"
                  :options="lineChartOptions"
                  :series="lineChartSeries"
                  height="300"
                />
              </div>
            </div>
          </div>

          <!-- Quarter Summary Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h2 class="chart-title">Quarter summary</h2>
                <p class="chart-subtitle">Payment performance snapshot</p>
              </div>
            </div>
<!-- 
            <div class="quarter-content">
              <div v-if="donutChartReady" class="donut-container">
                <apexchart
                  type="donut"
                  :options="donutChartOptions"
                  :series="donutChartSeries"
                  height="240"
                />
              </div>

              <div class="quarter-stats">
                <div class="quarter-stat">
                  <span class="qs-label">Value</span>
                  <span class="qs-value">{{
                    formatCurrency(chartData.quarterSummaryData.transactionValue)
                  }}</span>
                </div>
                <div class="quarter-stat">
                  <span class="qs-label">Count</span>
                  <span class="qs-value">{{ chartData.quarterSummaryData.transactionCount }}</span>
                </div>
                <div class="quarter-stat">
                  <span class="qs-label">Change</span>
                  <span
                    class="qs-value"
                    :class="{ positive: chartData.quarterSummaryData.change >= 0 }"
                  >
                    {{ chartData.quarterSummaryData.change }}%
                  </span>
                </div>
              </div>
            </div> -->
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="recent-transactions">
          <div class="rt-header">
            <div>
              <h2 class="rt-title">Recent transactions</h2>
              <p class="rt-subtitle">Your latest payment activity</p>
            </div>
            <router-link to="/transactions" class="view-all-link">View all</router-link>
          </div>

          <div class="rt-content">
            <div class="empty-state" v-if="recentTransactions.length === 0">
              <div class="empty-icon">
                <i class="mdi mdi-format-list-bulleted"></i>
              </div>
              <h3>No transactions yet</h3>
              <p>Your recent payments will appear here once customers start paying.</p>
            </div>

            <div class="transactions-table" v-else>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tx in recentTransactions" :key="tx.id">
                    <td>{{ formatDate(tx.date) }}</td>
                    <td>{{ tx.reference }}</td>
                    <td>{{ formatCurrency(tx.amount) }}</td>
                    <td>
                      <span class="status-badge" :class="tx.status">{{ tx.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineComponent } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

import {
  dashboardMetrics,
  chartData as initialChartData,
  recentTransactions as initialRecentTransactions,
  type DashboardMetrics,
  type ChartData,
  type RecentTransaction
} from '@/data/dashboardData'

import MainLayout from '@/layouts/MainLayout.vue'

defineComponent({
  components: {
    apexchart: VueApexCharts
  }
})

/* --------------------------------------------------------------------------
| Data
-------------------------------------------------------------------------- */

const metrics = ref<DashboardMetrics>(dashboardMetrics)

const charts = ref<ChartData>(initialChartData)

const transactions = ref<RecentTransaction[]>(initialRecentTransactions)

const selectedPeriod = ref('30days')

const lineChartReady = ref(false)
const donutChartReady = ref(false)

/* --------------------------------------------------------------------------
| Computed
-------------------------------------------------------------------------- */

const chartData = computed(() => charts.value)

const recentTransactions = computed(() => transactions.value)

/* --------------------------------------------------------------------------
| Line Chart
-------------------------------------------------------------------------- */

const lineChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false
    },
    sparkline: {
      enabled: false
    }
  },

  stroke: {
    curve: 'smooth',
    width: 3
  },

  colors: ['#5c8a1f'],

  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },

  xaxis: {
    categories: chartData.value.transactionActivityData.dates,

    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '12px',
        fontFamily: 'inherit'
      }
    },

    axisBorder: {
      show: false
    },

    axisTicks: {
      show: false
    }
  },

  yaxis: {
    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '12px',
        fontFamily: 'inherit'
      }
    }
  },

  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 3
  },

  tooltip: {
    theme: 'light',
    style: {
      fontSize: '12px'
    }
  }
}))

const lineChartSeries = computed(() => [
  {
    name: 'Transaction Value',
    data: chartData.value.transactionActivityData.values
  }
])

/* --------------------------------------------------------------------------
| Donut Chart
-------------------------------------------------------------------------- */

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: {
      show: false
    }
  },

  colors: ['#5c8a1f', '#a3c46a'],

  labels: ['Value', 'Count'],

  plotOptions: {
    pie: {
      donut: {
        size: '65%',

        labels: {
          show: true,

          name: {
            offsetY: 5,
            color: '#64748b',
            fontSize: '12px'
          },

          value: {
            offsetY: -5,
            color: '#1f2937',
            fontSize: '16px',
            fontWeight: 600
          },

          total: {
            show: true,
            label: 'transactions',
            fontSize: '12px',
            color: '#64748b',

            formatter() {
              return '0'
            }
          }
        }
      }
    }
  },

  dataLabels: {
    enabled: false
  },

  legend: {
    position: 'bottom',
    offsetY: 10,

    labels: {
      colors: '#64748b',
      useSeriesColors: false
    },

    markers: {
      width: 10,
      height: 10
    }
  },

  tooltip: {
    theme: 'light'
  }
}))

const donutChartSeries = computed(() => [
  chartData.value.quarterSummaryData.transactionValue,
  chartData.value.quarterSummaryData.transactionCount
])

/* --------------------------------------------------------------------------
| Methods
-------------------------------------------------------------------------- */

const formatCurrency = (amount: number): string => {
  if (amount === 0) return '₦0.00'

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount)
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/* --------------------------------------------------------------------------
| Lifecycle
-------------------------------------------------------------------------- */

onMounted(() => {
  setTimeout(() => {
    lineChartReady.value = true
    donutChartReady.value = true
  }, 100)
})
</script>

<style scoped>
/* Layout */
.dashboard {
  background: #f8fafc;
  min-height: 100vh;
  padding: 20px;
  font-family: inherit;
}

.dashboard-container {
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-primary {
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
  color: #fff;
}

.stat-card-primary .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

.stat-card-primary .stat-amount {
  color: #fff;
}

.stat-card-primary .stat-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.stat-card-primary .stat-action {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-badge {
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
}

.stat-amount {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-change {
  font-size: 13px;
  color: #ef4444;
  margin-bottom: 16px;
  font-weight: 500;
}

.stat-change.positive {
  color: #22c55e;
}

.stat-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.stat-action {
  margin-top: 16px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1f2937;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-action:hover {
  background: rgba(0, 0, 0, 0.04);
}

.stat-card-primary .stat-action:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 12px;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.chart-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 12px;
}

.period-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-select:hover {
  border-color: #cbd5e1;
}

.chart-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.value-processed {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.vp-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}

.vp-amount {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.vp-change {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
  font-weight: 500;
}

.vp-change.positive {
  color: #22c55e;
}

.chart-container {
  width: 100%;
  margin-top: 12px;
}

/* Quarter Summary */
.quarter-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
}

.donut-container {
  display: flex;
  justify-content: center;
}

.quarter-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quarter-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.qs-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.qs-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.qs-value.positive {
  color: #22c55e;
}

/* Recent Transactions */
.recent-transactions {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.rt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 12px;
}

.rt-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.rt-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.view-all-link {
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #1d4ed8;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 32px;
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  max-width: 300px;
}

/* Transactions Table */
.rt-content {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  border-bottom: 2px solid #e2e8f0;
}

th {
  padding: 12px 0;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

td {
  padding: 16px 0;
  font-size: 13px;
  color: #1f2937;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .dashboard {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .quarter-content {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-controls {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: 12px;
  }

  .dashboard-header {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-amount {
    font-size: 24px;
  }

  .chart-card {
    padding: 16px;
  }

  .chart-title {
    font-size: 14px;
  }

  .chart-subtitle {
    font-size: 12px;
  }

  .charts-grid {
    gap: 16px;
    margin-bottom: 20px;
  }

  .value-processed {
    padding: 12px;
  }

  .vp-amount {
    font-size: 18px;
  }

  .quarter-stats {
    gap: 12px;
  }

  .quarter-stat {
    padding-bottom: 8px;
  }

  .qs-label {
    font-size: 12px;
  }

  .qs-value {
    font-size: 14px;
  }

  .recent-transactions {
    padding: 16px;
  }

  .rt-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .rt-title {
    font-size: 14px;
  }

  .view-all-link {
    text-align: right;
  }

  .empty-state {
    padding: 40px 16px;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .empty-state h3 {
    font-size: 14px;
  }

  .empty-state p {
    font-size: 12px;
  }

  th,
  td {
    padding: 12px 0;
    font-size: 12px;
  }

  .status-badge {
    padding: 3px 10px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 8px;
  }

  .page-title {
    font-size: 18px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-card-header {
    margin-bottom: 12px;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-badge {
    font-size: 10px;
    padding: 3px 8px;
  }

  .stat-amount {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .stat-change {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .stat-action {
    margin-top: 12px;
    font-size: 11px;
    padding: 6px 10px;
  }

  .chart-card {
    padding: 12px;
  }

  .chart-title {
    font-size: 13px;
  }

  .chart-subtitle {
    font-size: 11px;
  }

  .period-select {
    font-size: 11px;
    padding: 6px 10px;
  }

  .vp-label {
    font-size: 10px;
  }

  .vp-amount {
    font-size: 16px;
  }

  .vp-change {
    font-size: 11px;
  }

  .donut-container {
    height: 200px;
  }

  .recent-transactions {
    padding: 12px;
  }

  .rt-title {
    font-size: 13px;
  }

  .rt-subtitle {
    font-size: 11px;
  }

  .view-all-link {
    font-size: 11px;
  }

  th {
    font-size: 11px;
    padding: 8px 0;
  }

  td {
    padding: 8px 0;
    font-size: 11px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .chart-card {
    transition: none;
  }

  .view-all-link,
  .period-select,
  .stat-action {
    transition: none;
  }
}
</style>
