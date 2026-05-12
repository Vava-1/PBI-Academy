import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar,
  Clock, Globe, Image, ChevronLeft,
  Save, X, Upload, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, Link as LinkIcon, List, ListOrdered, Quote, Code,
  Heading1, Heading2, Heading3, Undo, Redo
} from 'lucide-react'
import { api } from '../lib/api'

interface ContentPage {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'
  featuredImage?: string
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  ogImage?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function AdminContent() {
  const [pages, setPages] = useState<ContentPage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImage: '',
    publishedAt: ''
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const data = await api.get('/admin/pages')
      setPages(data.pages)
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700'
      case 'DRAFT': return 'bg-gray-100 text-gray-700'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700'
      case 'ARCHIVED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleCreatePage = () => {
    setEditingPage(null)
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'DRAFT',
      featuredImage: '',
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogImage: '',
      publishedAt: ''
    })
    setShowEditor(true)
  }

  const handleEditPage = (page: ContentPage) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      status: page.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED',
      featuredImage: page.featuredImage || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      canonicalUrl: page.canonicalUrl || '',
      ogImage: page.ogImage || '',
      publishedAt: page.publishedAt || ''
    })
    setShowEditor(true)
  }

  const handleSavePage = async () => {
    try {
      if (editingPage) {
        await api.put(`/admin/pages/${editingPage.id}`, formData)
      } else {
        await api.post('/admin/pages', formData)
      }
      
      setShowEditor(false)
      fetchPages()
    } catch (error) {
      console.error('Failed to save page:', error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await api.delete(`/admin/pages/${pageId}`)
        fetchPages()
      } catch (error) {
        console.error('Failed to delete page:', error)
      }
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      metaTitle: prev.metaTitle || title
    }))
  }

  // Rich Text Editor Toolbar
  const RichTextEditor = () => (
    <div className="border border-gray-line rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-line p-2 flex items-center gap-1 flex-wrap">
        <button className="p-2 hover:bg-gray-200 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-line mx-1"></div>
        
        <button className="p-2 hover:bg-gray-200 rounded" title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-line mx-1"></div>
        
        <button className="p-2 hover:bg-gray-200 rounded" title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-line mx-1"></div>
        
        <button className="p-2 hover:bg-gray-200 rounded" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Quote">
          <Quote className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Code">
          <Code className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-line mx-1"></div>
        
        <button className="p-2 hover:bg-gray-200 rounded" title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Insert Image">
          <Image className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-line mx-1"></div>
        
        <button className="p-2 hover:bg-gray-200 rounded" title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded" title="Redo">
          <Redo className="w-4 h-4" />
        </button>
      </div>
      
      <textarea
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        placeholder="Start writing your content..."
        className="w-full p-4 min-h-[400px] focus:outline-none resize-none"
      />
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-bg">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-line px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-2xl text-navy">
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 border border-gray-line rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                className="px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple/90 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingPage ? 'Update Page' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-card">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Page Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="Enter page title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="url-slug"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Content</label>
                    <RichTextEditor />
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  
                  {formData.status === 'SCHEDULED' && (
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Publish Date</label>
                      <input
                        type="datetime-local"
                        value={formData.publishedAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      rows={3}
                      placeholder="Brief description of the page..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Featured Image</label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formData.featuredImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button className="w-full px-4 py-2 border border-gray-line rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display font-semibold text-navy mb-4">SEO Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">Meta Title</label>
                        <input
                          type="text"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                          placeholder="SEO title..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">Meta Description</label>
                        <textarea
                          value={formData.metaDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                          rows={3}
                          placeholder="SEO description..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">Canonical URL</label>
                        <input
                          type="url"
                          value={formData.canonicalUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                          placeholder="https://example.com/canonical-url"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">OG Image</label>
                        <input
                          type="url"
                          value={formData.ogImage}
                          onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                          placeholder="https://example.com/og-image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <div className="bg-white border-b border-gray-line px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-purple hover:text-purple/90">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-bold text-2xl text-navy">Content Management</h1>
          </div>
          
          <button
            onClick={handleCreatePage}
            className="flex items-center gap-2 px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple/90"
          >
            <Plus className="w-4 h-4" />
            Create Page
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-line px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-line">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-navy">{page.title}</div>
                        {page.excerpt && (
                          <div className="text-sm text-text-muted mt-1 line-clamp-2">{page.excerpt}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-muted">/{page.slug}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-muted">
                            {formatDate(page.updatedAt)}
                          </span>
                        </div>
                        {page.publishedAt && page.status === 'PUBLISHED' && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">
                              Published {formatDate(page.publishedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="p-2 bg-gray-100 text-text-muted rounded-lg hover:bg-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button className="p-2 bg-gray-100 text-text-muted rounded-lg hover:bg-gray-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
