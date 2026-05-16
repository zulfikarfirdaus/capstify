import { supabase } from './lib/supabase'

// ── Public fetchers ───────────────────────────────────────────────────────────

export const fetchHero = async () => {
  const { data } = await supabase.from('settings').select('key, value')
  return (data || []).reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
}

export const fetchCategories = async () => {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

export const fetchProducts = async (params = {}) => {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('sort_order')

  if (params.category) {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', params.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (params.featured !== undefined) query = query.eq('featured', true)
  if (params.new !== undefined)      query = query.eq('is_new_arrival', true)
  if (params.limit)                  query = query.limit(parseInt(params.limit))

  const { data } = await query
  return (data || []).map(normaliseProduct)
}

export const fetchProduct = async (slug) => {
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single()
  return data ? normaliseProduct(data) : null
}

export const searchProducts = async (q) => {
  if (!q || q.length < 2) return []
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .order('sort_order')
  return (data || []).map(normaliseProduct)
}

function normaliseProduct(p) {
  return {
    ...p,
    category_name: p.categories?.name,
    category_slug: p.categories?.slug,
    images: Array.isArray(p.images) ? p.images : [],
    details: p.details || { specs: [], features: [] },
  }
}

// ── Image upload (Supabase Storage) ──────────────────────────────────────────

export const uploadImage = async (file) => {
  const ext  = file.name.split('.').pop()
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
  return publicUrl
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export const adminFetchProducts = async () => {
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('sort_order')
  return (data || []).map(normaliseProduct)
}

export const adminSaveProduct = async (form, editId) => {
  const payload = { ...form }
  if (payload.price === '') payload.price = null
  delete payload.categories

  if (editId) {
    const { error } = await supabase.from('products').update(payload).eq('id', editId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('products').insert(payload)
    if (error) throw error
  }
}

export const adminDeleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export const adminFetchCategories = async () => {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

export const adminSaveCategory = async (form, editId) => {
  if (editId) {
    const { error } = await supabase.from('categories').update(form).eq('id', editId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('categories').insert(form)
    if (error) throw error
  }
}

export const adminDeleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export const adminFetchSettings = async () => {
  const { data } = await supabase.from('settings').select('key, value')
  return (data || []).reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
}

export const adminSaveSettings = async (settings) => {
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }))
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export const trackVisit = async (page, productId = null) => {
  await supabase.from('analytics_visits').insert({ page, product_id: productId }).catch(() => {})
}

export const trackClick = async (productId, type) => {
  await supabase.from('analytics_clicks').insert({ product_id: productId, type }).catch(() => {})
}

export const adminFetchAnalytics = async (range = '7d') => {
  const days = range === '90d' ? 90 : range === '30d' ? 30 : 7
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  const [{ data: visitRows }, { data: clickRows }] = await Promise.all([
    supabase.from('analytics_visits').select('visited_at').gte('visited_at', sinceISO),
    supabase.from('analytics_clicks').select('clicked_at, type').gte('clicked_at', sinceISO),
  ])

  const visitsByDate = {}
  visitRows?.forEach(v => {
    const d = v.visited_at.split('T')[0]
    visitsByDate[d] = (visitsByDate[d] || 0) + 1
  })

  const clickData = {}
  clickRows?.forEach(c => {
    const d = c.clicked_at.split('T')[0]
    clickData[`${d}__${c.type}`] = (clickData[`${d}__${c.type}`] || 0) + 1
  })

  const clicks = []
  dates.forEach(d => {
    ;['whatsapp', 'shopee', 'tiktok'].forEach(type => {
      const count = clickData[`${d}__${type}`] || 0
      if (count > 0) clicks.push({ date: d, type, count })
    })
  })

  return {
    totals: {
      visits:   visitRows?.length || 0,
      whatsapp: clickRows?.filter(c => c.type === 'whatsapp').length || 0,
      shopee:   clickRows?.filter(c => c.type === 'shopee').length   || 0,
      tiktok:   clickRows?.filter(c => c.type === 'tiktok').length   || 0,
    },
    visits: dates.map(d => ({ date: d, count: visitsByDate[d] || 0 })),
    clicks,
  }
}
