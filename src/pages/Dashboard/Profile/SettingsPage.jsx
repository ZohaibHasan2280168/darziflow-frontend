"use client"

import { useState, useEffect } from "react"
import Navbar from "../../../components/layout/Navbar.jsx"
import { Bell, Lock, Globe, Palette } from "lucide-react"

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: "Friends Only",
    language: "English",
    profilePicture: true,
    dataCollection: false,
  })

  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const settingsCategories = [
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Theme",
          description: "Choose your preferred color scheme",
          type: "toggle",
          key: "theme",
          value: theme,
          action: toggleTheme,
          badge: theme === "dark" ? "Dark" : "Light",
        },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Lock,
      items: [
        {
          label: "Account Privacy",
          description: "Control who can see your profile",
          type: "select",
          key: "privacy",
          value: settings.privacy,
          options: ["Public", "Friends Only", "Private"],
          onChange: (value) => handleSettingChange("privacy", value),
        },
        {
          label: "Show Profile Picture",
          description: "Display your profile picture publicly",
          type: "toggle",
          key: "profilePicture",
          value: settings.profilePicture,
          onChange: () => handleSettingChange("profilePicture", !settings.profilePicture),
        },
      ],
    },
    {
      title: "Notifications & Data",
      icon: Bell,
      items: [
        {
          label: "Email Notifications",
          description: "Receive updates and alerts via email",
          type: "toggle",
          key: "notifications",
          value: settings.notifications,
          onChange: () => handleSettingChange("notifications", !settings.notifications),
        },
        {
          label: "Data Collection",
          description: "Help us improve by sharing usage data",
          type: "toggle",
          key: "dataCollection",
          value: settings.dataCollection,
          onChange: () => handleSettingChange("dataCollection", !settings.dataCollection),
        },
      ],
    },
    {
      title: "Preferences",
      icon: Globe,
      items: [
        {
          label: "Language",
          description: "Select your preferred language",
          type: "select",
          key: "language",
          value: settings.language,
          options: ["English", "Urdu", "Spanish", "French", "German"],
          onChange: (value) => handleSettingChange("language", value),
        },
      ],
    },
  ]

  return (
    <div className="settings-container">
      <Navbar />

      <div className="settings-content">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account and preferences</p>
        </div>

        {/* Settings Categories */}
        <div className="settings-grid">
          {settingsCategories.map((category, idx) => {
            const IconComponent = category.icon
            return (
              <div key={idx} className="settings-category">
                {/* Category Header */}
                <div className="category-header">
                  <div className="category-icon-wrapper">
                    <IconComponent size={20} />
                  </div>
                  <h2 className="category-title">{category.title}</h2>
                </div>

                {/* Category Items */}
                <div className="category-items">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="settings-item">
                      <div className="item-info">
                        <label className="item-label">{item.label}</label>
                        <p className="item-description">{item.description}</p>
                      </div>

                      {/* Item Control */}
                      <div className="item-control">
                        {item.type === "toggle" && (
                          <>
                            {item.action ? (
                              <button
                                className={`toggle-btn ${item.value === "dark" || item.value ? "active" : ""}`}
                                onClick={item.action}
                                aria-label={`Toggle ${item.label}`}
                              >
                                <span className="toggle-switch" />
                              </button>
                            ) : (
                              <>
                                <button
                                  className={`toggle-btn ${item.value ? "active" : ""}`}
                                  onClick={item.onChange}
                                  aria-label={`Toggle ${item.label}`}
                                >
                                  <span className="toggle-switch" />
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {item.type === "select" && (
                          <select
                            value={item.value}
                            onChange={(e) => item.onChange(e.target.value)}
                            className="select-input"
                          >
                            {item.options.map((option, optIdx) => (
                              <option key={optIdx} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 100%);
          color: #e2e8f0;
          transition: background 0.3s, color 0.3s;
        }

        .settings-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .settings-header {
          margin-bottom: 3rem;
        }

        .settings-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .settings-subtitle {
          font-size: 1rem;
          color: #94a3b8;
        }

        .settings-grid {
          display: grid;
          gap: 2rem;
          grid-auto-flow: row;
        }

        .settings-category {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .settings-category:hover {
          border-color: rgba(106, 17, 203, 0.2);
          background: rgba(30, 41, 59, 0.95);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(15, 23, 42, 0.5);
        }

        .category-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(106, 17, 203, 0.2) 0%, rgba(37, 117, 252, 0.2) 100%);
          border-radius: 10px;
          color: #a78bfa;
        }

        .category-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f1f5f9;
        }

        .category-items {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          padding: 1rem;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .settings-item:hover {
          background: rgba(106, 17, 203, 0.05);
        }

        .item-info {
          flex: 1;
        }

        .item-label {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 0.25rem;
          cursor: pointer;
        }

        .item-description {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .item-control {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .toggle-btn {
          width: 48px;
          height: 28px;
          background: #334155;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          padding: 0;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        }

        .toggle-switch {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .toggle-btn.active .toggle-switch {
          left: 22px;
        }

        .select-input {
          padding: 0.75rem 1rem;
          background: transparent; /* flat */
          border: 1px solid rgba(148, 163, 184, 0.08);
          border-radius: 10px;
          color: inherit;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.15s ease;
          min-width: 180px;
          box-shadow: none; /* remove heavy shadow */
        }

        .select-input:hover {
          border-color: rgba(106, 17, 203, 0.12);
          background: rgba(255,255,255,0.02);
        }

        .select-input:focus {
          outline: none;
          border-color: rgba(106, 17, 203, 0.2);
          box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.06);
        }

        .select-input option {
          background: inherit;
          color: inherit;
        }

        @media (max-width: 768px) {
          .settings-content {
            padding: 2rem 1rem;
          }

          .settings-title {
            font-size: 2rem;
          }

          .settings-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .item-control {
            width: 100%;
          }

          .select-input {
            width: 100%;
            min-width: auto;
          }

          .category-header {
            gap: 0.75rem;
          }

          .category-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}
