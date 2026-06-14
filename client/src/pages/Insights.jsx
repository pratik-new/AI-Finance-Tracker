import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInsights, fetchPrediction } from '../redux/slices/insightSlice'
import { formatCurrency } from '../utils/format'

function Insights() {
  const dispatch = useDispatch()
  const { insights, predictions, provider, loading, error } = useSelector(state => state.insights)

  useEffect(() => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Insights</h2>
          <p className="mt-1 text-sm text-slate-500">Smart analysis powered by OpenAI when configured, with a deterministic fallback engine.</p>
        </div>
        <button
          onClick={() => { dispatch(fetchInsights()); dispatch(fetchPrediction()) }}
          className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-blue-600"
        >
          Refresh Insights
        </button>
      </div>

      {error &&<div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recommendations</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{provider || 'heuristic'}</span>
          </div>
          {loading ? (
            <p className="text-slate-500">Generating insights...</p>
          ) : (
            <div className="space-y-3">
              {insights.length ? insights.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-lg border border-sky-100 bg-sky-50 p-4 text-slate-800">
                  {item}
                </div>
              )) :<p className="text-sm text-slate-500">Add transactions to generate insights.</p>}
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Spending Prediction</h3>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-slate-500">Predicted Expense</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(predictions.predictedExpense || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Confidence</p>
              <div className="mt-2 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${predictions.confidence || 0}%` }} />
              </div>
              <p className="mt-1 text-sm font-medium">{predictions.confidence || 0}%</p>
            </div>
            {predictions.budgetRisk && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Predicted spending is above your monthly budget.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Insights