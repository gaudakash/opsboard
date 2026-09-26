'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/utils/supabase/client'
import { createProduct } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Upload, X, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: 'Please select a category' }),
  price: z.number().min(1, { message: 'Price must be greater than 0' }),
  compareAtPrice: z.number().optional(),
  sku: z.string().min(2, { message: 'SKU is required' }),
  stock: z.number().min(0, { message: 'Stock cannot be negative' }),
  status: z.enum(['draft', 'published', 'archived']),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Variant {
  name: string
  color: string
  size: string
  price: number
  stock: number
  sku: string
}

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [newVariant, setNewVariant] = useState<Variant>({
    name: '',
    color: 'Black',
    size: 'M',
    price: 999,
    stock: 10,
    sku: '',
  })
  const [uploading, setUploading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'draft',
      stock: 10,
      price: 999,
    },
  })

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUrls: string[] = [...imageUrls]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error } = await supabase.storage.from('product-images').upload(fileName, file)

      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        newUrls.push(publicUrlData.publicUrl)
      }
    }

    setImageUrls(newUrls)
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    if (!newVariant.sku) {
      alert('Please enter a variant SKU')
      return
    }
    setVariants([...variants, { ...newVariant, name: `${newVariant.color} / ${newVariant.size}` }])
    setNewVariant({ name: '', color: 'Black', size: 'M', price: 999, stock: 10, sku: '' })
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const nextStep = async () => {
    let isValid = false
    if (step === 1) isValid = await trigger(['name', 'description', 'categoryId'])
    else if (step === 2) isValid = await trigger(['price', 'compareAtPrice', 'sku', 'stock', 'status'])
    else isValid = true

    if (isValid) setStep((prev) => Math.min(prev + 1, 5))
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true)
    setServerError(null)

    const result = await createProduct({
      ...data,
      images: imageUrls,
    })

    if (result?.error) {
      setServerError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Add New Product</h2>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded-lg border shadow-sm text-center text-xs font-semibold">
        <div className={`p-2 rounded ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>1. Basic</div>
        <div className={`p-2 rounded ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>2. Pricing</div>
        <div className={`p-2 rounded ${step === 3 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>3. Variants</div>
        <div className={`p-2 rounded ${step === 4 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>4. Images</div>
        <div className={`p-2 rounded ${step === 5 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>5. Review</div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {serverError && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Step 1: Basic Details</h3>
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="e.g. Wireless Mechanical Keyboard" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register('categoryId')}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Product details..."
                    {...register('description')}
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Step 2: Pricing and Stock</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" {...register('price', { valueAsNumber: true })} />
                    {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Compare at Price (MRP)</Label>
                    <Input type="number" {...register('compareAtPrice', { valueAsNumber: true })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU (Product Code)</Label>
                    <Input placeholder="SKU-KEY-001" {...register('sku')} />
                    {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input type="number" {...register('stock', { valueAsNumber: true })} />
                    {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register('status')}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Step 3: Product Variants (Optional)</h3>
                <p className="text-sm text-slate-500">Add size or color variations for this product.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-lg border">
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      value={newVariant.color}
                      onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      placeholder="Black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Size</Label>
                    <Input
                      value={newVariant.size}
                      onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                      placeholder="M / L"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      value={newVariant.price}
                      onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">SKU</Label>
                    <Input
                      value={newVariant.sku}
                      onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                      placeholder="SKU-VAR-1"
                    />
                  </div>
                  <div className="col-span-full pt-2">
                    <Button type="button" onClick={addVariant} size="sm" className="w-full gap-2">
                      <Plus className="h-4 w-4" /> Add Variant
                    </Button>
                  </div>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-2">
                    {variants.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-md text-sm">
                        <span>{v.color} / {v.size} — ₹{v.price} ({v.sku})</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(idx)} className="text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No variants added yet.</p>
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Step 4: Product Images</h3>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-slate-50">
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                    {uploading ? 'Uploading...' : 'Upload Images'}
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">PNG, JPG, WEBP up to 5MB</p>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group border rounded-md overflow-hidden aspect-square bg-slate-100">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Step 5: Review and Submit</h3>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> {getValues('name')}</p>
                  <p><strong>Price:</strong> ₹{getValues('price')}</p>
                  <p><strong>SKU:</strong> {getValues('sku')}</p>
                  <p><strong>Stock:</strong> {getValues('stock')}</p>
                  <p><strong>Status:</strong> {getValues('status')}</p>
                  <p><strong>Variants Added:</strong> {variants.length}</p>
                  <p><strong>Images Uploaded:</strong> {imageUrls.length}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
              ) : <div />}

              {step < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving Product...' : 'Submit Product'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}