import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe, Mail, CreditCard, Shield,
  Bell, Palette, Save, RefreshCw, Upload, ChevronLeft,
  ToggleLeft, ToggleRight
} from 'lucide-react'
import { api } from '../lib/api'

interface SiteSetting {
  id: string
  key: string
  value: string
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
  category: string
  description?: string
  updatedAt: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState('general')
  const [formData, setFormData] = useState<Record<string, any>>({})

  const settingCategories = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    const formDataObj: Record<string, any> = {}
    settings.forEach(setting => {
      if (setting.type === 'BOOLEAN') {
        formDataObj[setting.key] = setting.value === 'true'
      } else if (setting.type === 'NUMBER') {
        formDataObj[setting.key] = parseFloat(setting.value)
      } else {
        formDataObj[setting.key] = setting.value
      }
    })
    setFormData(formDataObj)
  }, [settings])

  const fetchSettings = async () => {
    try {
      const data = await api.get('/admin/settings')
      setSettings(data.settings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const settingsArray = Object.entries(formData).map(([key, value]) => {
        const setting = settings.find(s => s.key === key)
        return {
          key,
          value: value.toString(),
          type: setting?.type || 'STRING',
          category: setting?.category || 'general'
        }
      })

      await api.put('/admin/settings', { settings: settingsArray })
      
      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const renderSettingField = (setting: SiteSetting) => {
    const value = formData[setting.key]

    switch (setting.type) {
      case 'BOOLEAN':
        return (
          <button
            onClick={() => handleInputChange(setting.key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-purple' : 'bg-gray-200'
            }`}
          >
            {value ? (
              <ToggleRight className="w-6 h-6 text-white" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
          </button>
        )
      
      case 'NUMBER':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
          />
        )
      
      case 'JSON':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple font-mono text-sm"
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
          />
        )
    }
  }

  const getFilteredSettings = () => {
    return settings.filter(setting => setting.category === activeCategory)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple border-t-transparent rounded-full"></div>
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
            <h1 className="font-display font-bold text-2xl text-navy">Settings & Configuration</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSettings}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-line rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple/90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-line min-h-screen">
          <div className="p-4">
            <h3 className="font-display font-semibold text-navy mb-4">Categories</h3>
            <nav className="space-y-2">
              {settingCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-purple/10 text-purple'
                      : 'hover:bg-gray-50 text-text-muted'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeCategory === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Site Name</label>
                    <input
                      type="text"
                      value={formData['site_name'] || ''}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="PBI Academy"
                    />
                    <p className="text-xs text-text-muted mt-1">The name of your website</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Site Description</label>
                    <textarea
                      value={formData['site_description'] || ''}
                      onChange={(e) => handleInputChange('site_description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="Learn languages with AI-powered courses"
                    />
                    <p className="text-xs text-text-muted mt-1">Brief description of your website</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Site URL</label>
                    <input
                      type="url"
                      value={formData['site_url'] || ''}
                      onChange={(e) => handleInputChange('site_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="https://pbiacademy.com"
                    />
                    <p className="text-xs text-text-muted mt-1">Main website URL</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Maintenance Mode</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleInputChange('maintenance_mode', !formData['maintenance_mode'])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData['maintenance_mode'] ? 'bg-purple' : 'bg-gray-200'
                        }`}
                      >
                        {formData['maintenance_mode'] ? (
                          <ToggleRight className="w-6 h-6 text-white" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <span className="text-sm text-text-muted">
                        Enable maintenance mode to temporarily disable the site
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'contact' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={formData['contact_email'] || ''}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="contact@pbiacademy.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData['contact_phone'] || ''}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Address</label>
                    <textarea
                      value={formData['contact_address'] || ''}
                      onChange={(e) => handleInputChange('contact_address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Support Email</label>
                    <input
                      type="email"
                      value={formData['support_email'] || ''}
                      onChange={(e) => handleInputChange('support_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="support@pbiacademy.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">Payment Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Stripe Public Key</label>
                    <input
                      type="text"
                      value={formData['stripe_public_key'] || ''}
                      onChange={(e) => handleInputChange('stripe_public_key', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="pk_test_..."
                    />
                    <p className="text-xs text-text-muted mt-1">Your Stripe publishable key</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Currency</label>
                    <select
                      value={formData['currency'] || 'USD'}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Enable Test Mode</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleInputChange('test_mode', !formData['test_mode'])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData['test_mode'] ? 'bg-purple' : 'bg-gray-200'
                        }`}
                      >
                        {formData['test_mode'] ? (
                          <ToggleRight className="w-6 h-6 text-white" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <span className="text-sm text-text-muted">
                        Enable test mode for payment processing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Enable Two-Factor Authentication</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleInputChange('enable_2fa', !formData['enable_2fa'])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData['enable_2fa'] ? 'bg-purple' : 'bg-gray-200'
                        }`}
                      >
                        {formData['enable_2fa'] ? (
                          <ToggleRight className="w-6 h-6 text-white" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <span className="text-sm text-text-muted">
                        Require 2FA for admin accounts
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={formData['session_timeout'] || 30}
                      onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      min="5"
                      max="1440"
                    />
                    <p className="text-xs text-text-muted mt-1">Auto-logout after inactivity</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={formData['max_login_attempts'] || 5}
                      onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      min="3"
                      max="10"
                    />
                    <p className="text-xs text-text-muted mt-1">Lock account after failed attempts</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Enable Email Notifications</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleInputChange('email_notifications', !formData['email_notifications'])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData['email_notifications'] ? 'bg-purple' : 'bg-gray-200'
                        }`}
                      >
                        {formData['email_notifications'] ? (
                          <ToggleRight className="w-6 h-6 text-white" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <span className="text-sm text-text-muted">
                        Send email notifications to users
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">SMTP Server</label>
                    <input
                      type="text"
                      value={formData['smtp_server'] || ''}
                      onChange={(e) => handleInputChange('smtp_server', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">SMTP Port</label>
                    <input
                      type="number"
                      value={formData['smtp_port'] || 587}
                      onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="587"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={formData['primary_color'] || '#6366f1'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-full h-10 border border-gray-line rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Logo URL</label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formData['logo_url'] || ''}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                        placeholder="https://example.com/logo.png"
                      />
                      <button className="px-4 py-2 border border-gray-line rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Favicon URL</label>
                    <input
                      type="url"
                      value={formData['favicon_url'] || ''}
                      onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-line rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Settings from Database */}
          {getFilteredSettings().length > 0 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-xl text-navy mb-6">Additional Settings</h2>
                
                <div className="space-y-6">
                  {getFilteredSettings().map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm font-medium text-navy mb-2">
                        {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {renderSettingField(setting)}
                      {setting.description && (
                        <p className="text-xs text-text-muted mt-1">{setting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
