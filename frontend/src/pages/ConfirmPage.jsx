import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Upload, X, ArrowLeft } from 'lucide-react'
import { fetchOrder, submitPaymentConfirmation } from '../api'
import './ConfirmPage.css'

function formatPrice(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

export default function ConfirmPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    senderName: '',
    amountSent: '',
    proofFile:  null,
  })
  const [preview,   setPreview]   = useState(null)
  const [errors,    setErrors]    = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }))
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, proofFile: file }))
    setPreview(URL.createObjectURL(file))
    if (errors.proofFile) setErrors(err => ({ ...err, proofFile: '' }))
  }

  const removeFile = () => {
    setForm(f => ({ ...f, proofFile: null }))
    setPreview(null)
  }

  const validate = () => {
    const e = {}
    if (!form.senderName.trim())   e.senderName = 'Sender name is required'
    if (!form.amountSent)          e.amountSent = 'Transfer amount is required'
    else if (isNaN(Number(form.amountSent.replace(/\D/g, '')))) e.amountSent = 'Invalid number format'
    if (!form.proofFile)           e.proofFile  = 'Please upload proof of payment'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const amountNum = parseInt(form.amountSent.replace(/\D/g, ''), 10)
      await submitPaymentConfirmation({
        orderId,
        senderName:  form.senderName,
        amountSent:  amountNum,
        proofFile:   form.proofFile,
      })
      navigate(`/thank-you/${orderId}`)
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to submit confirmation. Please try again.' })
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="confirm-loading"><p>Loading...</p></div>
  }

  if (!order) {
    return (
      <div className="confirm-not-found">
        <p>Order not found.</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="confirm-page">
      <div className="container confirm-container">
        <Link to={`/payment/${orderId}`} className="confirm-back">
          <ArrowLeft size={16} /> Back to Payment Details
        </Link>

        <div className="confirm-header">
          <span className="confirm-header__eyebrow">Payment Confirmation</span>
          <h1 className="confirm-header__order-id">{order.order_id}</h1>
          <p className="confirm-header__amount">
            Total: <strong>{formatPrice(order.total_amount)}</strong>
          </p>
        </div>

        <form className="confirm-form" onSubmit={handleSubmit} noValidate>
          <div className="confirm-field">
            <label htmlFor="senderName">Sender Name (as on bank account)</label>
            <input
              id="senderName"
              name="senderName"
              type="text"
              value={form.senderName}
              onChange={handleChange}
              placeholder="Name on sender's account"
              className={errors.senderName ? 'is-error' : ''}
            />
            {errors.senderName && <span className="confirm-field__err">{errors.senderName}</span>}
          </div>

          <div className="confirm-field">
            <label htmlFor="amountSent">Amount Transferred (Rp)</label>
            <input
              id="amountSent"
              name="amountSent"
              type="text"
              inputMode="numeric"
              value={form.amountSent}
              onChange={handleChange}
              placeholder="e.g. 275000"
              className={errors.amountSent ? 'is-error' : ''}
            />
            {errors.amountSent && <span className="confirm-field__err">{errors.amountSent}</span>}
          </div>

          <div className="confirm-field">
            <label>Payment Proof (photo / screenshot)</label>
            {preview ? (
              <div className="confirm-preview">
                <img src={preview} alt="Payment proof" />
                <button
                  type="button"
                  className="confirm-preview__remove"
                  onClick={removeFile}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
                <span className="confirm-preview__name">{form.proofFile.name}</span>
              </div>
            ) : (
              <label className={`confirm-upload${errors.proofFile ? ' is-error' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: 'none' }}
                />
                <Upload size={24} strokeWidth={1.5} />
                <span className="confirm-upload__label">Click to upload photo</span>
                <span className="confirm-upload__hint">JPG, PNG — max 5MB</span>
              </label>
            )}
            {errors.proofFile && <span className="confirm-field__err">{errors.proofFile}</span>}
          </div>

          {errors.submit && (
            <p className="confirm-error">{errors.submit}</p>
          )}

          <button type="submit" className="confirm-submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Payment Confirmation'}
          </button>
        </form>
      </div>
    </div>
  )
}
