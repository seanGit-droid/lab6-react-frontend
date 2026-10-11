import { useEffect, useMemo, useState } from 'react'
import * as api from '../api.js'
import ProductForm from './ProductForm.jsx'

const peso = (n) =>
  Number(n).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })

export default function Products({ user, onLogout }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null) // { type, text }
  const [search, setSearch] = useState('')

  // modal state: null | { product: null | row }
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formFields, setFormFields] = useState({})
  const [toDelete, setToDelete] = useState(null)

  const flash = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.getProducts()
      setProducts(data.data)
    } catch (err) {
      flash('error', api.parseError(err).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    )
  }, [products, search])

  const openForm = (product = null) => {
    setFormError('')
    setFormFields({})
    setEditing({ product })
  }

  const save = async (payload) => {
    setSaving(true)
    setFormError('')
    setFormFields({})
    try {
      if (editing.product) {
        await api.updateProduct(editing.product.id, payload)
        flash('success', 'Product updated.')
      } else {
        await api.createProduct(payload)
        flash('success', 'Product added.')
      }
      setEditing(null)
      await load()
    } catch (err) {
      const parsed = api.parseError(err)
      setFormError(parsed.message)
      setFormFields(parsed.fields)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await api.deleteProduct(toDelete.id)
      flash('success', `Deleted "${toDelete.product_name}".`)
      setToDelete(null)
      await load()
    } catch (err) {
      flash('error', api.parseError(err).message)
      setToDelete(null)
    }
  }

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <h1>Products</h1>
          <p className="muted">Signed in as <strong>{user.username}</strong></p>
        </div>
        <button className="btn" onClick={onLogout}>Logout</button>
      </header>

      {message && <div className={`alert ${message.type}`}>{message.text}</div>}

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn primary" onClick={() => openForm()}>+ Add product</button>
      </div>

      <div className="card table-wrap">
        {loading ? (
          <p className="empty">Loading products…</p>
        ) : filtered.length === 0 ? (
          <p className="empty">
            {products.length === 0 ? 'No products yet. Add your first one!' : 'No products match your search.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th className="num">Price</th>
                <th className="num">Qty</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.product_name}</strong></td>
                  <td className="desc">{p.description}</td>
                  <td className="num">{peso(p.price)}</td>
                  <td className="num">{p.quantity}</td>
                  <td>{p.created_at ? new Date(p.created_at.replace(' ', 'T')).toLocaleDateString() : ''}</td>
                  <td className="row-actions">
                    <button className="btn small" onClick={() => openForm(p)}>Edit</button>
                    <button className="btn small danger" onClick={() => setToDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing.product}
          onSave={save}
          onCancel={() => setEditing(null)}
          saving={saving}
          serverError={formError}
          fieldErrors={formFields}
        />
      )}

      {toDelete && (
        <div className="modal-backdrop" onClick={() => setToDelete(null)}>
          <div className="card modal small-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete product?</h2>
            <p>
              This will permanently delete <strong>{toDelete.product_name}</strong>.
            </p>
            <div className="actions">
              <button className="btn" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="btn danger solid" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
