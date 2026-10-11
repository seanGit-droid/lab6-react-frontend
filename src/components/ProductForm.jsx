import { useState } from 'react'

const EMPTY = { product_name: '', description: '', price: '', quantity: '' }

// Used for both Add (product = null) and Edit (product = existing row)
export default function ProductForm({ product, onSave, onCancel, saving, serverError, fieldErrors }) {
  const [form, setForm] = useState(
    product
      ? {
          product_name: product.product_name,
          description: product.description || '',
          price: String(product.price),
          quantity: String(product.quantity),
        }
      : EMPTY
  )

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    onSave({
      product_name: form.product_name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{product ? 'Edit product' : 'Add product'}</h2>

        {serverError && <div className="alert error">{serverError}</div>}

        <label>
          Product name
          <input name="product_name" value={form.product_name} onChange={change} maxLength={100} required autoFocus />
          {fieldErrors.product_name && <span className="field-error">{fieldErrors.product_name}</span>}
        </label>

        <label>
          Description
          <textarea name="description" rows={3} value={form.description} onChange={change} />
        </label>

        <div className="row">
          <label>
            Price (₱)
            <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={change} required />
            {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
          </label>
          <label>
            Quantity
            <input type="number" name="quantity" min="0" step="1" value={form.quantity} onChange={change} required />
            {fieldErrors.quantity && <span className="field-error">{fieldErrors.quantity}</span>}
          </label>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  )
}
